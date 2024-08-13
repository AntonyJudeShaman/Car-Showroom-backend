const { passwordHasher } = require("../lib/utils");
const User = require("../Model/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.registerUser = async (
  username,
  email,
  password,
  address,
  phone,
  role
) => {
  password = await passwordHasher(password);
  const user = await this.createUserInDB(
    username,
    email,
    password,
    address,
    phone,
    role
  );
  if (user.status === 400) {
    return user;
  }
  return user;
};

exports.createUserInDB = async (
  username,
  email,
  password,
  address,
  phone,
  role
) => {
  try {
    const user = new User({
      username,
      email,
      password,
      address,
      phone,
      role,
    });
    await user.save();
    return user;
  } catch (error) {
    if (error.code === 11000) {
      return { status: 400, error: "Username or email already exists" };
    }
    throw error;
  }
};

exports.loginUser = async (nameOrEmail, password) => {
  const user = await User.findOne({
    $or: [{ username: nameOrEmail }, { email: nameOrEmail }],
  });
  if (!user) {
    return { status: 404, error: "User not found" };
  }
  const check = await bcrypt.compare(password, user.password);
  if (!check) {
    return { status: 400, error: "Invalid Credentials" };
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  return { user, token };
};

exports.updateUser = async (userId, updateData) => {
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });
  return updatedUser;
};

exports.checkToken = async (req) => {
  try {
    let authHeader = req.headers["authorization"];
    let token = authHeader && authHeader.split(" ")[1];
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    return user || null;
  } catch (err) {
    return null;
  }
};

exports.getAllUsers = async () => {
  return await User.find();
};

exports.getUserById = async (userId) => {
  return await User.findById(userId);
};
