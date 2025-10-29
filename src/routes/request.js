const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { ConnectionRequestModel } = require("../models/connectionRequest");
const User = require("../models/user");
const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(400).json({
          message: "User not found",
          success: false,
        });
      }

      const allowedStatuses = ["ignored", "interested"];
      if (!allowedStatuses.includes(status)) {
        throw new Error("Invalid status type: " + status);
      }

      const existingConnectionRequest = await ConnectionRequestModel.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        throw new Error("Request already sent");
      }

      const connectionRequest = new ConnectionRequestModel({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();
    } catch (err) {
      res.status(400).send("Error:" + err.message);
    }

    res.send(fromUserId.firstName + "sent the connection request");
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;
      console.log("1");
      const allowedStatuses = ["accepted", "rejected"];
      console.log("2");
      if (!allowedStatuses.includes(status)) {
        console.log("3");
        throw new Error("Invalid status type: " + status);
      }

      const connectionRequest = await ConnectionRequestModel.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      console.log(connectionRequest);
      console.log(loggedInUser._id);
      if (!connectionRequest) {
        return res.status(404).json({
          message: "Request not found",
          success: false,
        });
      }
      console.log("5");
      connectionRequest.status = status;
      console.log("6");

      const data = await connectionRequest.save();
      console.log("7");

      res.json({ message: "Connection Request" + status, data });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);
module.exports = requestRouter;
