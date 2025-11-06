const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stripeSessionId: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      enum: ["silver", "gold"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "eur",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
