const helpers = require('../lib/utils');
const User = require('../Model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const errorMessages = require('../config/errors');
const Payment = require('../Model/payment');
const Invoice = require('../Model/invoice');
const emailjs = require('@emailjs/nodejs');
const logger = require('../config/winston');
const sendEmail = require('../lib/sendPasswordRestMail');

exports.registerUser = async (username, email, password, address, phone, role, wallet) => {
  try {
    const user = new User({
      username,
      email,
      password: await helpers.passwordHasher(password),
      wallet,
      address,
      phone,
      role,
    });
    if (!user) {
      logger.error(`[registerUser service] username:${username} not created`);
      return { error: errorMessages.USER_NOT_CREATED };
    }
    await user.save();
    return user;
  } catch (error) {
    logger.error(`[registerUser service] username:${username} not created`);
    helpers.handleErrors(res, error);
    return { error: errorMessages.USER_NOT_CREATED };
  }
};

exports.loginUser = async (credential, password) => {
  try {
    const user = await User.findOne({
      $or: [{ username: credential }, { email: credential }],
    });
    if (!user) {
      logger.error(`[loginUser service]  credential:${credential} user not found`);
      return { error: errorMessages.USER_NOT_FOUND };
    }
    const check = await bcrypt.compare(password, user.password);
    if (!check) {
      logger.error(`[loginUser service]  credential:${credential} invalid password`);
      return { error: errorMessages.INVALID_CREDENTIALS };
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '15d',
    });
    return { user, token, refreshToken };
  } catch (error) {
    logger.error(`[loginUser service]  credential:${username} Cannot login`);
    helpers.handleErrors(res, error);
    return { error: errorMessages.SOME_ERROR };
  }
};

exports.updateUser = async (userId, updateData) => {
  try {
    if (!userId) return { error: errorMessages.INVALID_ID };

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) {
      logger.error(`[updateUser service]  userId:${userId} Cannot update`);
      return { error: errorMessages.USER_NOT_UPDATED };
    }
    return updatedUser;
  } catch (error) {
    logger.error(`[updateUser service]  userId:${userId} Cannot update`);
    helpers.handleErrors(res, error);
    return { error: errorMessages.SOME_ERROR };
  }
};

exports.checkToken = async (req) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      logger.error(`[checkToken service] token: ${authHeader}  User not found`);
      return null;
    }
    return user;
  } catch (error) {
    logger.error(`[checkToken service] token: ${authHeader}  Cannot verify token`);
    return { error };
  }
};

exports.getAllUsers = async (page, limit) => {
  try {
    const skip = (page - 1) * limit;
    const users = await User.find().skip(skip).limit(limit).select('-password');

    return users;
  } catch (error) {
    return null;
  }
};

exports.getUserById = async (userId) => {
  return await User.findById(userId);
};

exports.getUserByEmail = async (email) => {
  return await User.findOne({ email });
};

exports.getUserByUsername = async (username) => {
  return await User.findOne({ username });
};

exports.deleteUser = async (userId) => {
  return await User.findByIdAndDelete(userId);
};

exports.searchUser = async (searchQuery) => {
  if (!searchQuery) {
    logger.error(`[searchUser service]  No search query`);
    return { error: errorMessages.NO_SEARCH_QUERY };
  }
  return await User.find({
    $or: [
      { username: { $regex: searchQuery, $options: 'i' } },
      { email: { $regex: searchQuery, $options: 'i' } },
      { role: { $regex: searchQuery, $options: 'i' } },
      { address: { $regex: searchQuery, $options: 'i' } },
      {
        $or: [
          { 'carCollection.name': { $regex: searchQuery, $options: 'i' } },
          { 'carCollection.brand': { $regex: searchQuery, $options: 'i' } },
        ],
      },
    ],
  });
};

exports.buyCar = async (user, carId, selectedFeatures = [], paymentDetails, token) => {
  if (!user._id || !carId || carId.length !== 24) return { error: errorMessages.INVALID_ID };
  try {
    token = token.split(' ')[1];
    console.log('Getting car details');
    const carResponse = await fetch(`${process.env.API_URL}/api/car/view-car/${carId}`, {
      method: 'GET',
      headers: {
        // Authorization: `Bearer ${process.env.JWT_TOKEN}`,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!carResponse.ok) {
      logger.error(`[buyCar service]  carId:${carId} Cannot fetch car`);
      return { error: errorMessages.FAILED_TO_FETCH_CAR };
    }
    const carData = await carResponse.json();
    console.log('car found');
    if (!carData || !carData.car) {
      logger.error(`[buyCar service]  carId:${carId} no car found`);
      return { error: errorMessages.INVALID_CAR_DATA };
    }
    if (carData.car.stock.quantity < 1 || carData.car.status === 'sold_out') {
      logger.error(`[buyCar service]  carId:${carId} out of stock`);
      return { error: errorMessages.CAR_OUT_OF_STOCK };
    }

    console.log('car stock available');
    const { totalPrice, addedFeatures, discount } = helpers.calculateTotalPrice(
      carData.car.basePrice,
      selectedFeatures,
      carData.car.features,
      carData.car.tax,
    );

    console.log(
      'total price',
      totalPrice,
      'calculated with discount',
      discount,
      'and features',
      addedFeatures,
      'tax',
      carData.car.tax * 100,
    );
    if (user.wallet < totalPrice) {
      console.log('user has insufficient balance');
      logger.error(`[buyCar service]  user:${user.username} insufficient balance`);
      return { error: errorMessages.INSUFFICIENT_BALANCE };
    }

    console.log('user has enough balance');
    const invoice = await helpers.generateInvoice(user, {
      ...carData,
      totalPrice,
      addedFeatures,
      tax: carData.car.tax,
      discount,
    });
    if (!invoice) {
      logger.error(`[buyCar service]  user:${user.username} failed to generate invoice`);
      return { error: errorMessages.FAILED_TO_GENERATE_INVOICE };
    }
    console.log('invoice generated');

    const savedPayment = await exports.processPayment(
      {
        user: user._id,
        car: carId,
        invoice: invoice._id,
        paymentMethod: paymentDetails.method,
        amount: totalPrice,
        status: 'completed',
        transactionId: paymentDetails.transactionId,
      },
      token,
    );
    if (savedPayment.error) {
      return { error: savedPayment.error };
    }

    console.log('payment processed');
    const savedInvoice = await invoice.save();
    if (!savedInvoice) {
      await Payment.findByIdAndRemove(savedPayment._id);
      logger.error(`[buyCar service]  user:${user.username} failed to save invoice`);
      return { error: errorMessages.FAILED_TO_SAVE_INVOICE };
    }

    const verifyPayment = await exports.verifyPayment(savedPayment._id, token);

    if (verifyPayment.error) {
      await Invoice.findByIdAndRemove(savedInvoice._id);
      await Payment.findByIdAndRemove(savedPayment._id);
      logger.error(`[buyCar service]  user:${user.username} failed to verify payment`);
      return { error: verifyPayment.error };
    }

    if (verifyPayment.success) {
      console.log('Payment verified successfully');
    }

    const updatedCar = await exports.updateCar(carData, token);
    if (updatedCar.error) {
      await Invoice.findByIdAndRemove(savedInvoice._id);
      await Payment.findByIdAndRemove(savedPayment._id);
      logger.error(`[buyCar service]  user:${user.username} failed to update car`);
      return { error: updatedCar.error };
    }

    console.log('car quantity updated');
    const { stock, createdAt, updatedAt, ...carToBeAdded } = carData.car;
    carToBeAdded.features = addedFeatures;
    carToBeAdded.totalPrice = totalPrice;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $push: {
          carCollection: carToBeAdded,
          invoices: savedInvoice,
        },
        $set: { wallet: user.wallet - totalPrice, updatedAt: new Date() },
      },
      { new: true },
    );
    if (!updatedUser) {
      await Invoice.findByIdAndRemove(savedInvoice._id);
      await Payment.findByIdAndRemove(savedPayment._id);
      await this.updateCar({ ...carData, reverse: true });
      logger.error(`[buyCar service]  user:${user.username} failed to update user`);
      return { error: errorMessages.FAILED_TO_UPDATE_USER };
    }

    console.log('car added to collection');
    // console.log('savedInvoice:', savedInvoice);
    // console.log('savedPayment:', savedPayment);

    return {
      updatedUser,
      updatedCar,
      invoice: savedInvoice,
      payment: savedPayment,
    };
  } catch (error) {
    helpers.handleErrors(res, error);
    return { error: errorMessages.SOME_ERROR };
  }
};

exports.updateCar = async (carData, token) => {
  if (!carData || !carData.car || !carData.car._id) {
    return { error: errorMessages.INVALID_CAR_DATA };
  }

  const car = carData.car;

  const quantity = carData?.reverse ? 1 : -1;

  try {
    const response = await fetch(`${process.env.API_URL}/api/car/update-car/${car._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        'stock.quantity': car.stock.quantity + quantity,
        status: car.stock.quantity - quantity === 0 ? 'sold_out' : 'available',
      }),
    });

    if (!response.ok) {
      return { error: errorMessages.CAR_NOT_UPDATED };
    }

    const updatedCar = await response.json();

    if (!updatedCar) {
      return { error: errorMessages.CAR_NOT_UPDATED };
    }

    return updatedCar;
  } catch {
    return { error: errorMessages.CAR_NOT_UPDATED };
  }
};

exports.getCarCollection = async (userId, page, limit) => {
  const start = (page - 1) * limit;
  const end = page * limit;
  const user = await User.findById(userId);

  if (!user) return { error: errorMessages.USER_NOT_FOUND };

  return user.carCollection.slice(start, end);
};

exports.processPayment = async (paymentInfo, token) => {
  const savedPayment = await fetch(`${process.env.API_URL}/api/payment/create-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(paymentInfo),
  });

  return savedPayment.json();
};

exports.verifyPayment = async (paymentId, token) => {
  const payment = await fetch(`${process.env.API_URL}/api/payment/verify-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id: paymentId }),
  });

  return payment.json();
};

exports.subscribe = async (userId) => {
  try {
    if (!userId) return { error: errorMessages.INVALID_ID };

    const user = await User.findById(userId);

    if (!user) {
      logger.error(`[subscribe service]  userId:${userId} user not found`);
      return { error: errorMessages.USER_NOT_FOUND };
    }

    if (user.subscribed) {
      logger.error(`[subscribe service]  userId:${userId} already subscribed`);
      return { error: errorMessages.ALREADY_SUBSCRIBED };
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { subscribed: true }, { new: true });
    if (!updatedUser) {
      logger.error(`[subscribe service]  userId:${userId} failed to subscribe`);
      return { error: errorMessages.SUBSCRIPTION_FAILED };
    }

    return updatedUser;
  } catch (error) {
    helpers.handleErrors(res, error);
    return { error: errorMessages.SUBSCRIPTION_FAILED };
  }
};

exports.unsubscribe = async (userId) => {
  try {
    if (!userId) return { error: errorMessages.INVALID_ID };
    const user = await User.findById(userId);

    if (!user) {
      logger.error(`[unsubscribe service]  userId:${userId} user not found`);
      return { error: errorMessages.USER_NOT_FOUND };
    }

    if (!user.subscribed) {
      logger.error(`[unsubscribe service]  userId:${userId} was not subscribed`);
      return { error: errorMessages.ALREADY_UNSUBSCRIBED };
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { subscribed: false }, { new: true });
    if (!updatedUser) {
      logger.error(`[unsubscribe service]  userId:${userId} failed to unsubscribe`);
      return { error: errorMessages.UNSUBSCRIPTION_FAILED };
    }

    return updatedUser;
  } catch (error) {
    helpers.handleErrors(res, error);
    return { error: errorMessages.UNSUBSCRIPTION_FAILED };
  }
};

exports.sendNotification = async (car) => {
  try {
    emailjs.init({
      publicKey: process.env.EMAILJS_PUBLIC_KEY,
      privateKey: process.env.EMAILJS_PRIVATE_KEY,
    });
    const subscribedUsers = await User.find({ subscribed: true });

    if (!subscribedUsers.length || !subscribedUsers) {
      logger.error(`[sendNotification service]  no subscribers found`);
      return { error: errorMessages.NO_SUBSCRIBED_USERS };
    }

    for (const user of subscribedUsers) {
      const res = await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID,
        {
          to_email: user.email,
          to_name: user.name ? user.name : user.username,
          car_name: car.name,
          car_model: car.brand,
          car_price: car.basePrice,
          features: car.features,
          link: 'https://antonyjudeshaman.vercel.app',
        },
      );

      console.log('res:', res);

      if (res.status !== 200) {
        console.log('notification not sent', user.email);
        logger.error(`[sendNotification service]  email:${user.email} failed to send notification`);
        return { error: errorMessages.FAILED_TO_SEND_NOTIFICATION };
      }

      console.log('Notification sent to', user.email);
    }

    return true;
  } catch (error) {
    helpers.handleErrors(res, error);
    return { error: errorMessages.SOME_ERROR };
  }
};

exports.forgotPassword = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.error(`[forgotPassword service] email:${email} user not found`);
      return { error: errorMessages.USER_NOT_FOUND };
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    await user.save();

    const result = await sendEmail(user.username, email, 'AJS Cars Password Reset', token);

    if (!result.success) {
      logger.error(`[forgotPassword service] email:${email} failed to send reset mail`);
      return { error: result.error };
    }

    return { success: true, message: 'Password reset email sent successfully' };
  } catch (error) {
    logger.error(`[forgotPassword service] Error: ${error.message}`);
    return { error: errorMessages.SOME_ERROR };
  }
};

exports.resetPassword = async (password, token) => {
  try {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      logger.error(`[resetPassword service] Invalid token: ${error.message}`);
      return { error: errorMessages.INVALID_TOKEN };
    }

    const user = await User.findOne({
      _id: decoded.id,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      logger.error(`[resetPassword service] User not found or token invalid`);
      return { error: errorMessages.USER_NOT_FOUND_OR_TOKEN_INVALID };
    }

    const hashedPassword = await helpers.passwordHasher(password);

    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    logger.info(`[resetPassword service] Password reset successful for user: ${user._id}`);
    return { message: 'Password reset successful' };
  } catch (error) {
    logger.error(`[resetPassword service] Error: ${error.message}`);
    return { error: errorMessages.INTERNAL_SERVER_ERROR };
  }
};

exports.getNewAccessToken = async (refreshToken) => {
  try {
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      logger.error(`[getNewAccessToken service] Invalid token: ${error.message}`);
      return { error: errorMessages.INVALID_TOKEN };
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      logger.error(`[getNewAccessToken service] User not found`);
      return { error: errorMessages.USER_NOT_FOUND };
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return { token };
  } catch (error) {
    logger.error(`[getNewAccessToken service] Error: ${error.message}`);
    return { error: errorMessages.INTERNAL_SERVER_ERROR };
  }
};

exports.changePassword = async (userId, oldPassword, newPassword) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      logger.error(`[changePassword service] User not found`);
      return { error: errorMessages.USER_NOT_FOUND };
    }

    const check = await bcrypt.compare(oldPassword, user.password);

    if (!check) {
      logger.error(`[changePassword service] Invalid password`);
      return { error: errorMessages.INVALID_PASSWORD };
    }

    const hashedPassword = await helpers.passwordHasher(newPassword);

    user.password = hashedPassword;

    await user.save();

    logger.info(`[changePassword service] Password updated for user: ${user._id}`);
    return { message: 'Password updated successfully' };
  } catch (error) {
    logger.error(`[changePassword service] Error: ${error.message}`);
    return { error: errorMessages.SOME_ERROR };
  }
};
