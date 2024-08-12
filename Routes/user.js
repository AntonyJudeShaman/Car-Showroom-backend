const router = require("express").Router();

const { createUserInDB } = require("../Services/userServices");

router.post("/", async (req, res) => {
  const { name, email, password, role, address, phone } = req.body;
  try {
    let user = await createUserInDB(
      name,
      email,
      password,
      role,
      address,
      phone
    );
    res.status(200).json({ user });
  } catch {
    res.status(500).send("Some error occured");
  }
});
