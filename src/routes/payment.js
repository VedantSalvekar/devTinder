const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Payment = require("../models/payment");
const User = require("../models/user");
const paymentRouter = express.Router();
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  silver: {
    name: "GitTogether Silver",
    price: 999,
    description: "Silver Membership",
  },
  gold: {
    name: "GitTogether Gold",
    price: 1999,
    description: "Gold Membership",
  },
};

paymentRouter.post(
  "/payment/create-checkout-session",
  userAuth,
  async (req, res) => {
    try {
      const { plan } = req.body;
      if (!plan || !PLANS[plan]) {
        return res.status(400).json({
          success: false,
          message: "Invalid plan selected",
        });
      }
      const selectedPlan = PLANS[plan];

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: selectedPlan.name,
                description: selectedPlan.description,
              },
              unit_amount: selectedPlan.price,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:5173/payment/cancel`,
        client_reference_id: req.user._id.toString(),
        customer_email: req.user.emailId,
        metadata: {
          userId: req.user._id.toString(),
          plan: plan,
        },
      });

      const payment = new Payment({
        userId: req.user._id,
        stripeSessionId: session.id,
        plan: plan,
        amount: selectedPlan.price / 100,
        currency: "eur",
        paymentStatus: "pending",
      });

      await payment.save();

      res.json({
        success: true,
        sessionId: session.id,
        url: session.url,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: "Error creating checkout session: " + err.message,
      });
    }
  }
);
paymentRouter.get("/payment/verify/:sessionId", userAuth, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId
    );

    if (session.payment_status === "paid") {
      // Get the plan from metadata
      const purchasedPlan = session.metadata.plan;

      // Update payment record in database
      const payment = await Payment.findOneAndUpdate(
        { stripeSessionId: req.params.sessionId },
        {
          paymentStatus: "paid",
          stripePaymentIntentId: session.payment_intent,
          metadata: {
            ...session.metadata,
            paidAt: new Date(),
          },
        },
        { new: true }
      );

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment record not found",
        });
      }

      // Update user to premium status
      await User.findByIdAndUpdate(req.user._id, {
        isPremium: true,
        premiumPlan: purchasedPlan,
        premiumPurchasedAt: new Date(),
      });

      res.json({
        success: true,
        message: "Payment verified successfully",
        paymentStatus: session.payment_status,
        plan: purchasedPlan,
        amountPaid: session.amount_total / 100, // Convert cents to dollars
      });
    } else {
      res.json({
        success: false,
        message: "Payment not completed",
        paymentStatus: session.payment_status,
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error verifying payment: " + err.message,
    });
  }
});

// Get user's payment history
paymentRouter.get("/payment/history", userAuth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      payments,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Error fetching payment history: " + err.message,
    });
  }
});

module.exports = paymentRouter;
