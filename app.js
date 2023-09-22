import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import User from "./schema.js";

const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/userDb");

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const user = await User.create({
      email: req.body.username,
      password: req.body.password,
    });
    res.status(200).render("secrets");
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email: username, password: password });
    user
      ? res.render("secrets")
      : res
          .status(401)
          .render("login", { error: "Invalid username or password" });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});
