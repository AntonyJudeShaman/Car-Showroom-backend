const Validator = require("validator");
const { isEmpty } = require("../lib/utils");

module.exports = function validRegistrationInput(data) {
  let errors = {};

  data.username = !isEmpty(data.username) ? data.username : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.address = !isEmpty(data.address) ? data.address : "";
  data.phone = !isEmpty(data.phone) ? data.phone : "";

  if (!Validator.isLength(data.username, { min: 4, max: 30 })) {
    errors.username = "Username Must be between 4 to 30";
  }

  if (Validator.isEmpty(data.username)) {
    errors.username = "Username field is Required";
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is Invalid";
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must between 6 to 30 Characters";
  }

  if (Validator.isEmpty(data.address)) {
    errors.address = "Address field is Required";
  }

  if (!Validator.isLength(data.phone, { min: 10, max: 10 })) {
    errors.phone = "Phone must be 10 digits";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
