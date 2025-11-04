const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://vedantsalvekar86_db_user:HBjTx1TCEzVfE1sw@learnnode.4wchioh.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
