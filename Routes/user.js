const router = require("express").Router();
const userController = require("../controllers/userController");
const {
  userRegisterValidations,
  userUpdateValidations,
  userLoginValidations,
} = require("../validators/userValidator");

router.post("/register", userRegisterValidations, userController.register);
router.post("/login", userLoginValidations, userController.login);
router.get("/view-all-users", userController.viewAllUser);
router.get("/view-user/:id", userController.viewUser);
router.delete("/delete-user/:id", userController.deleteUser);
router.put(
  "/update-user/:id",
  userUpdateValidations,
  userController.updateUser
);
router.post("/verify-user", userController.checkToken);
router.post("/logout", userController.logout);

router.post("/search-user", userController.searchUser);

module.exports = router;
