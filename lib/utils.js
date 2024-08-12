const bcrypt = require("bcrypt");

const passwordHasher = async (password) => {
  return await bcrypt.hash(password, 10);
};

const handleErrors = (res, err) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message });
};

// console.log(passwordHasher("antony"));
module.exports = {
  passwordHasher,
  handleErrors,
};
