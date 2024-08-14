const bcrypt = require('bcrypt');
const userServices = require('../Services/userServices');
const errorMessages = require('../config/errors');

exports.passwordHasher = async (password) => {
  return await bcrypt.hash(password, 10);
};

exports.handleErrors = (res, err) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
};

exports.checkAdmin = async (req) => {
  if (!req.headers['authorization'])
    return res.status(401).json({ error: errorMessages.UNAUTHORIZED });
  const user = await userServices.checkToken(req);
  if (!user) {
    return { status: 401, error: errorMessages.UNAUTHORIZED };
  }
  if (user.role !== 'admin') {
    return { status: 403, error: errorMessages.FORBIDDEN };
  }
  return { status: 200, user };
};
