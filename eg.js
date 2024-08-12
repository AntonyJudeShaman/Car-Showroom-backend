const bcrypt = require("bcrypt");

const passwordHasher = async (password) => {
  return await bcrypt.hash(password, 20);
};

const isEmpty = (string) => {
  return string === null || string === undefined;
};

console.log(passwordHasher("antony"));
module.exports = {
  passwordHasher,
  isEmpty,
};
