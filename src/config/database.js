const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://vedantsalvekar86_db_user:BY7afnVQ5NS8OBG4@learnnode.4wchioh.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
