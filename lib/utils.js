const crypto = require("crypto");

const passwordHasher = (password) => {
  return crypto.createHash("sha512").update(password).digest("hex");
};

const isEmpty = (string) => {
  return string === null || string === undefined;
};

// console.log(passwordHasher("antony"));
module.exports = {
  passwordHasher,
  isEmpty,
};
