const User = require("../Model/user");
const { passwordHasher } = require("../lib/utils");

async function createUserInDB(name, email, password, role, address, phone) {
  password = passwordHasher(password);
  try {
    let user = await User.findOne({
      email,
    });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    user = new User({
      name,
      email,
      password,
      role,
      address,
      phone,
    });
    await user.save();
  } catch {
    res.status(500).send("Some error occured");
  }
}

module.exports = {
  createUserInDB,
};
