const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
    },
    lastName: {
      type: String,
      required: true,
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      trim: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email : " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter strong pssword :" + value);
        }
      },
    },
    age: {
      type: Number,
      required: false,
      min: 18,
    },
    gender: {
      type: String,
      required: false,
      trim: true,
      validate(value) {
        if (
          !["male", "female", "others", "Male", "Female", "Others"].includes(
            value
          )
        ) {
          throw new Error("Not a valid gender (Male , Female and other)");
        }
      },
    },
    about: {
      type: String,
    },
    photoUrl: {
      type: String,
      default:
        "https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg?t=st=1740779693~exp=1740783293~hmac=3ffc11733917c931bddeec957e8fa649e6a1590282b3210d816ccbf54dab2e94&w=900",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid Url :" + value);
        }
      },
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
