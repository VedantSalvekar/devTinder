const express = require("express");
const { Chat } = require("../models/chat");
const { userAuth } = require("../middlewares/auth");
const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  try {
    const userId1 = req.params.targetUserId;

    const userId2 = req.user._id;
    console.log(userId2);

    let chat = await Chat.findOne({
      participants: { $all: [userId1, userId2] },
    }).populate({ path: "messages.senderId", select: "firstName lastName" });

    if (!chat) {
      chat = new Chat({
        participants: [userId1, userId2],
        messages: [],
      });
      await chat.save();
    }

    res.json({ message: "Chat started successfully", data: chat });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

module.exports = {
  chatRouter,
};
