const router = require("express").Router();
const { createUserInDB } = require("../Services/userServices");
const { body, validationResult } = require("express-validator");
const { passwordHasher } = require("../lib/utils");
const jwt = require("jsonwebtoken");
const User = require("../Model/user");

const handleErrors = require("../lib/utils");
const { userValidations } = require("../lib/constants");

router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    ...Object.values(userValidations),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { username, email, password, address, phone, role } = req.body;
      const hash = await passwordHasher(password);
      const user = await createUserInDB(
        username,
        email,
        hash,
        address,
        phone,
        role
      );

      if (user.status === 400)
        return res.status(400).json({ error: user.error });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ user, token });
    } catch (err) {
      handleErrors(res, err);
    }
  }
);

router.get("/view-all-users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    handleErrors(res, err);
  }
});

router.get("/view-user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    handleErrors(res, err);
  }
});

router.put(
  "/update-user/:id",
  Object.values(userValidations),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { username, password, ...updateData } = req.body;

      if (username || password) {
        return res
          .status(400)
          .json({ error: "Username/Password cannot be changed" });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedUser)
        return res.status(404).json({ error: "User not found" });

      res.status(200).json(updatedUser);
    } catch (err) {
      handleErrors(res, err);
    }
  }
);

module.exports = router;
