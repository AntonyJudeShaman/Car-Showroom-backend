const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { handleErrors } = require("../lib/utils");
const userServices = require("../Services/userServices");

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { username, email, password, address, phone, role } = req.body;
    const user = await userServices.registerUser(
      username,
      email,
      password,
      address,
      phone,
      role
    );
    if (user.status === 400) {
      return res.status(400).json({ error: user.error });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ user, token });
  } catch (err) {
    handleErrors(res, err);
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { credential, password } = req.body;
    const loginResult = await userServices.loginUser(credential, password);
    if (loginResult.error) {
      return res.status(loginResult.status).json({ error: loginResult.error });
    }
    const { user, token } = loginResult;
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ user, token });
  } catch (err) {
    handleErrors(res, err);
  }
};

exports.updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  try {
    const { username, password, role, ...updateData } = req.body;
    if (username || password || role) {
      return res
        .status(400)
        .json({ error: "Username/Password/Role cannot be changed" });
    }
    const updatedUser = await userServices.updateUser(
      req.params.id,
      updateData
    );
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.status(200).json(updatedUser);
  } catch (err) {
    handleErrors(res, err);
  }
};

exports.viewAllUser = async (req, res) => {
  try {
    const user = await userServices.checkToken(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Forbidden. Admin access required" });
    }
    const users = await userServices.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    handleErrors(res, err);
  }
};

exports.checkToken = async (req, res) => {
  try {
    const user = await userServices.checkToken(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    res.status(200).json(user);
  } catch (err) {
    handleErrors(res, err);
  }
};

exports.viewUser = async (req, res) => {
  try {
    const userExists = await userServices.checkToken(req);
    if (!userExists) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await userServices.getUserById(req.params.id);

    if (!user) return res.status(404).json({ error: "No user found" });

    res.status(200).json(user);
  } catch {
    handleErrors(res, err);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userExists = await userServices.checkToken(req);
    if (!userExists) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await userServices.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "No user found" });
    let resp = await userServices.deleteUser(req.params.id);
    if (!resp) return res.status(404).json({ error: "Cannot delete user" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    handleErrors(res, err);
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

exports.searchUser = async (req, res) => {
  try {
    const user = await userServices.checkToken(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const users = await userServices.searchUser(req.query.q);
    if (!users.length) return res.status(404).json({ error: "No user found" });
    res.status(200).json(users);
  } catch (err) {
    handleErrors(res, err);
  }
};
