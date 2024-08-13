const router = require("express").Router();
const User = require("../Model/user");

const userController = require("../Controllers/userController");

const handleErrors = require("../lib/utils");

const {
  userRegisterValidations,
  userValidations,
  userLoginValidations,
} = require("../Validators/userValidator");

router.post(
  "/register",
  [...Object.values(userRegisterValidations)],
  userController.register
);

router.post(
  "/login",
  [Object.values(userLoginValidations)],
  userController.login
);

// router.get("/view-all-users", user.viewalluser);
router.post("/view-all-users", userController.viewAllUser);

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
  [Object.values(userValidations)],
  userController.updateUser
);

router.post("/verify-user", userController.checkToken);

module.exports = router;
