const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { ConnectionRequestModel } = require("../models/connectionRequest");
const User = require("../models/user");

const USER_SAFE_DATA = "";

userRouter.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const request = await ConnectionRequestModel.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", "firstName lastName gender skills");

    if (!request) {
      res.status(404).send("No request found!");
    }

    res.json({ data: request });
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});
userRouter.get("/user/connections", userAuth, async (req, res) => {
  const loggedInUser = req.user;
  try {
    const connections = await ConnectionRequestModel.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate(
        "fromUserId",
        "firstName LastName gender skills  photoUrl about"
      )
      .populate("toUserId", "firstName LastName gender skills  photoUrl about");

    // console.log(connections);
    if (!connections) {
      res.status(404).send("No connections found");
    }

    const data = connections.map((item) => {
      if (item.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return item.toUserId;
      } else {
        return item.fromUserId;
      }
    });

    res.send(data);
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;
    const connectionRequests = await ConnectionRequestModel.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId);
      hideUsersFromFeed.add(req.toUserId);
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select("firstName lastName skills gender photoUrl about")
      .skip(skip)
      .limit(limit);

    res.send(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = { userRouter };
