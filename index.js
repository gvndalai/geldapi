const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const sql = require("./db");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 8080;
const secretKey = process.env.SECRET_KEY;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/signup", async (req, res) => {
  const data = await sql`SELECT * FROM users;`;

  res.send(data);
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    const data =
      await sql`INSERT INTO users(email, name, password, avatarImg, createdAt, updatedAt) 
      VALUES (${email},${name}, ${encryptedPassword}, 'img', ${new Date()}, ${new Date()} )`;

    const token = jwt.sign({});
  } catch (error) {
    throw res.send({ error: "ERROR occured" });
  }
  res.status(201).send({ message: "Successfully created" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (users.length === 0) {
      return res.status(400).send("User not found");
    }

    const result = await bcrypt.compare(password, users[0].password);

    if (result) {
      return res.send("Successfully logged in");
    }
    res.status(400).send("Incorrect password");
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/transaction", async (req, res) => {
  const data = await sql`SELECT * FROM transaction;`;

  res.send(data);
});

app.post("/transaction", async (req, res) => {
  const { time, payee, date, amount, note, type } = req.body;

  try {
    const transactionData = await sql`
      INSERT INTO transaction(userId, categoryId, name, amount, transactionType, description, transactionDate, transactionTime)
      VALUES (null, null, ${payee}, ${amount}, ${type}, ${note}, ${date}, ${time})
    `;
    res.status(201).send({ message: "Successfully created" });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log("Apllication is running at http://localhost:" + PORT);
});
