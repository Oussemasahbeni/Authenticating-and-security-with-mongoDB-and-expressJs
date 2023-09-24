import mongoose from "mongoose";
import encrypt from "mongoose-encryption";
import "dotenv/config";
import passportLocalMongoose from "passport-local-mongoose";
import passport from "passport";
const { Schema, model } = mongoose;
const userSchema = new Schema({
  email: String,
  password: String,
});

console.log(process.env.SECRET);

// encrypt() is a plugin that encrypts the fields we specify
// plugin() is a method that takes the plugin we want to use and the options we want to pass to it
// #Mongoose Encryption
// userSchema.plugin(encrypt, {
//   secret: process.env.SECRET,
//   encryptedFields: ["password"],
// }); // if we want to encrypt more fields, we can add them to the array

// #Mongoose Encryption - Level 2
/* await User.create({
      email: req.body.username,
      password: md5(req.body.password),
    });
    
    */

// #Mongoose Encryption - Level 3
/* const hash = await new Promise((resolve, reject) => {
      bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        if (err) reject(err);
        resolve(hash);
      });
    });

    await User.create({
      email: req.body.username,
      password: hash,
    });
*/

// we use to hash and salt our password and save our users in our db
// we set up userschem
userSchema.plugin(passportLocalMongoose);

const User = model("User", userSchema);
//passport-local-mongoose to createa a local login strategy
passport.use(User.createStrategy());

// we tell passport to serialize and deserialize our user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
export default User;
