const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const sql = require("./db");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("./middleware/auth");
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
    const data = await sql`
      INSERT INTO users(email, name, password, avatarImg, createdAt, updatedAt)
      VALUES (${email}, ${name}, ${encryptedPassword}, 'img', NOW(), NOW())
    `;

    const token = jwt.sign({ userId: data[0].id }, secretKey, {
      expiresIn: "10h",
    });

    res.status(201).send({ message: "Successfully created", token });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.get("/dashboard", verifyToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "user not exist" });
  }

  const { email, id } = req.user;

  res.json({ message: `Welcome, ${email}, ${id}` });
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
      const token = jwt.sign({ userId: users[0].id }, secretKey, {
        expiresIn: "10h",
      });
      const tokened = { token, id: users[0].id };
      return res.json(tokened);
    }

    return res.status(400).send("Incorrect password");
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/category", async (req, res) => {
  const data = await sql`SELECT * FROM category`;
  res.send(data);
});

app.post("/category", async (req, res) => {
  const { category, icon } = req.body;

  try {
    const categoryData = await sql`
      INSERT INTO category(category_image, name, description, createdAt, updatedAt)
      VALUES (${icon}, ${category}, 'Category description', NOW(), NOW())
    `;
    res.status(201).send({ message: "Successfully created" });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.get("/transaction", async (req, res) => {
  const data = await sql`SELECT * FROM transaction`;
  res.send(data);
});

app.post("/transaction", verifyToken, async (req, res) => {
  const { time, payee, date, amount, note, type } = req.body;

  try {
    const userId = req.user.id;
    const categoryId = req.category.id;

    const user = await sql`SELECT * FROM users WHERE id = ${userId}`;
    const category = await sql`SELECT * FROM category WHERE id = ${categoryId}`;

    if (user.length === 0) {
      return res.status(400).send("User not found");
    }

    if (category.length === 0) {
      return res.status(400).send("Category not found");
    }

    const transactionData = await sql`
      INSERT INTO transaction(userId, categoryId, name, amount, transactionType, description, transactionDate, transactionTime, createdAt, updatedAt)
      VALUES (${userId}, ${categoryId}, ${payee}, ${amount}, ${type}, ${note}, ${date}, ${time}, NOW(), NOW())
    `;

    console.log("Transaction created successfully:", transactionData);

    res.status(201).send({ message: "Successfully created" });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).send({ error: `Internal Server Error: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log("Application is running at http://localhost:" + PORT);
});
