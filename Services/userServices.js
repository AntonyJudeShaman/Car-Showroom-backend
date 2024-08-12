const User = require("../Model/user");
const { passwordHasher } = require("../lib/utils");

async function createUserInDB(
  username,
  email,
  password,
  address,
  phone,
  role = "customer"
) {
  let user = await User.findOne({ $or: [{ username }, { email }] });

  if (user) {
    return { status: 400, error: "Username or Email already exists" };
  }

  // password = passwordHasher(password);

  // console.log(password);

  user = new User({
    username,
    email,
    password,
    role,
    address,
    phone,
  });

  await user.save();

  return user;
}

module.exports = {
  createUserInDB,
};
