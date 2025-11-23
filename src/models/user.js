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
      default: "https://i.pinimg.com/736x/ce/ea/c5/ceeac5c94c874759b67de03b9e45e30a.jpg",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid Url :" + value);
        }
      },
    },
    skills: {
      type: [String],
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    premiumPlan: {
      type: String,
      enum: ["silver", "gold", null],
      default: null,
    },
    premiumPurchasedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
