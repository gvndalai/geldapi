const { sql } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const secretKey = process.env.SECRET_KEY;

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findUser = await sql`SELECT * FROM users WHERE email=${email}`;

    if (findUser.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const checkPassword = bcrypt.compare(password, findUser[0].password);

    if (!checkPassword) {
      return res.status(400).json({ message: "wrong password" });
    }
    const token = jwt.sign(
      { userId: findUser[0].id, email: findUser[0].email },
      secretKey,
      { expiresIn: "10h" }
    );
    res.status(201).json({ message: "User sign in success", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "User failed" });
  }
};

const signUp = async (req, res) => {};
