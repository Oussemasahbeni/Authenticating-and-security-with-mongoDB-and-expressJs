import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import User from "./schema.js";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";

// import md5 from "md5";
// import bcrypt from "bcrypt";
// const saltRounds = 10;
const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/userDb");

// we tell our app to set up a session
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true },
  })
);

// we tell our app to use passport to initialize a session
app.use(passport.initialize());
// we tell our app to use passport to manage our session
app.use(passport.session());

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

app.get("/secrets", (req, res) => {
  // if the user is authenticated and still logged in, we render the secrets page
  // if (req.isAuthenticated()) {
  //   res.render("secrets");
  // } else {
  //   res.redirect("/login");
  // }
  res.render("secrets");
});

app.post("/register", async (req, res) => {
  // try {
  //   const hash = await new Promise((resolve, reject) => {
  //     bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
  //       if (err) reject(err);
  //       resolve(hash);
  //     });
  //   });
  //   await User.create({
  //     email: req.body.username,
  //     password: hash,
  //   });
  //   res.status(200).render("secrets");
  // } catch (err) {
  //   res.status(500).send("Internal server error");
  // }
  try {
    const user = await User.register(
      { username: req.body.username },
      req.body.password
    );
    passport.authenticate("local")(req, res, function () {
      // this only works if the authentication is successful
      res.redirect("/secrets");
      // if the user is logged in already they should be able to access the secrets page
    });
  } catch (err) {
    console.log(err);
    res.render("register", { error: err.message });
  }
});

app.post("/login", async (req, res) => {
  // const username = req.body.username;
  // * const password = md5(req.body.password);
  // const password = req.body.password;
  // try {
  //   const user = await User.findOne({ email: username });
  // *user
  // *  ? res.render("secrets")
  // *  : res
  // *      .status(401)
  // *      .render("login", { error: "Invalid username or password" });
  //   bcrypt.compare(password, user.password, function (err, result) {
  //     if (result === true) {
  //       res.render("secrets");
  //     } else {
  //       res
  //         .status(401)
  //         .render("login", { error: "Invalid username or password" });
  //     }
  //   });
  // } catch (err) {
  //   res.status(500).send("Internal server error");
  // }
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
