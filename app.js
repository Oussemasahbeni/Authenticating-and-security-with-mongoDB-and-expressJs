require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
// middlewares for session and passport
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDb");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  secret: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_Secret,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/secrets");
  }
);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  console.log(req.body.username);
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secrets", async (req, res) => {
  let users = await User.find({ secret: { $ne: null } }).exec();

  console.log("users", users);
  res.render("secrets", { usersWithSecrets: users });
});

app.post("/register", async (req, res) => {
  console.log(req.body.username);
  console.log(req.body.password);
  try {
    const user = await User.register(
      { username: req.body.username },
      req.body.password
    );
    let users = await User.find({ secret: { $ne: null } }).exec();
    passport.authenticate("local")(req, res, function () {
      res.render("secrets", { usersWithSecrets: users });
    });
  } catch (err) {
    console.log(err);
    res.render("register", { error: err.message });
  }
});

app.post("/login", async (req, res) => {
  console.log(req.body.username);
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

app.get("/submit", (req, res) => {
  console.log("authenticate", req.isAuthenticated());
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }
  // res.render("submit");
});

app.post("/submit", async (req, res) => {
  const submittedSecret = req.body.secret;

  // console.log(req);
  /* sessionID: '6ZIUGmbMsP4J_hw6RS5f8AEUwR8vwKMx',
  session: Session {
    cookie: { path: '/', _expires: null, originalMaxAge: null, httpOnly: true },
    passport: { user: '6510bac8c5d021ce39c10dad' }*/
  console.log("req user", req.user); // gives us the user id who is currently logged in
  try {
    const savedUser = await User.findById(req.user);
    if (savedUser) {
      savedUser.secret = submittedSecret;
      await savedUser.save();
      res.redirect("/secrets");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
