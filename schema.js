import mongoose from "mongoose";
import encrypt from "mongoose-encryption";
import "dotenv/config";
const { Schema, model } = mongoose;
const userSchema = new Schema({
  email: String,
  password: String,
});

console.log(process.env.SECRET);

// encrypt() is a plugin that encrypts the fields we specify
// plugin() is a method that takes the plugin we want to use and the options we want to pass to it
userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
}); // if we want to encrypt more fields, we can add them to the array
const User = model("User", userSchema);
export default User;
