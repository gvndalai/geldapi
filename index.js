const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const sql = require("./db");

const app = express();
const PORT = 8080;

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
      VALUES (${email},${name}, ${encryptedPassword}, 'img', ${new Date()}, ${new Date()}) `;
  } catch (error) {
    throw res.send({ error: "ERROR occured" });
  }
  res.status(201).send({ message: "Successfully created" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;

    const result = await bcrypt.compare(password, users[0].password);

    if (result === password) {
      return res.send("Successfully logged in");
    }
    res.status(400).send("Incorrect password");
  } catch (error) {
    throw res.send(error);
  }
});
app.listen(PORT, () => {
  console.log("Apllication is running at http://localhost:" + PORT);
});
