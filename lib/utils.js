const bcrypt = require("bcrypt");

const passwordHasher = async (password) => {
  return await bcrypt.hash(password, 10);
};

const handleErrors = (res, err) => {
  console.error("Error:", err);
  if (err.code === 11000) {
    return res.status(400).json({ error: "This Email is already in use" });
  }
  res.status(500).json({ error: err.message });
};

// console.log(passwordHasher("antony"));
module.exports = {
  passwordHasher,
  handleErrors,
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
