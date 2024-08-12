const router = require("express").Router();
const { createUserInDB } = require("../Services/userServices");
const ValidateInput = require("../Validators/userValidator");

router.post("/", async (req, res) => {
  const { username, email, password, address, phone, role } = req.body;

  try {
    const user = await createUserInDB(
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

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Some error occurred" });
  }
});

router.post("/register", async (req, res) => {
  const { errors, isValid } = ValidateInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
});

module.exports = router;
