const router = require("express").Router();
const { Friend, validFriend } = require("../models/friend");
const { User } = require("../models/user");
const { auth } = require("../middleware/auth");

// -- new Friends -- //
router.post("/", auth, async (req, res) => {
  let receiverUser = await User.findById({ _id: req.body.receiverId });
  let senderUser = await User.findById({ _id: req.body.senderId });
  const receiverId = receiverUser._id.toString();
  const senderId = senderUser._id.toString();
  const friends = await Friend.find({});

  const check = friends.some(
    (friend) =>
      (friend.members[0] === req.body.senderId &&
        friend.members[1] === req.body.receiverId) ||
      (friend.members[0] === req.body.receiverId &&
        friend.members[1] === req.body.senderId)
  );

  if (check) return res.send("you cant send request to add friends twice");

  const { error } = validFriend({
    members: [req.body.senderId, req.body.receiverId],
    sender: {
      senderId,
      imageSender: senderUser.image,
      senderName: `${senderUser.name} ${senderUser.lastName}`,
    },
    receiver: {
      receiverId,
      imageReceiver: receiverUser.image,
      receiverName: `${receiverUser.name} ${receiverUser.lastName}`,
    },
  });

  if (error) return res.send(error.details[0].message);

  const newFriend = new Friend({
    members: [req.body.senderId, req.body.receiverId],
    sender: {
      senderId,
      imageSender: senderUser.image,
      senderName: `${senderUser.name} ${senderUser.lastName}`,
    },
    receiver: {
      receiverId,
      imageReceiver: receiverUser.image,
      receiverName: `${receiverUser.name} ${receiverUser.lastName}`,
    },
  });

  const savedFriends = await newFriend.save();
  res.status(200).json(savedFriends);
});

// -- get friends of a user -- //
router.get("/:userId", auth, async (req, res) => {
  try {
    const friends = await Friend.find({
      members: { $in: [req.params.userId] },
    }).sort({ updatedAt: +1 });

    res.status(200).json(friends);
  } catch (err) {
    res.status(500).json(err);
  }
});

// -- delete friend -- //
router.delete("/:id", auth, async (req, res) => {
  const deleteFriend = await Friend.findByIdAndDelete({ _id: req.params.id });

  return res.send(deleteFriend);
});

module.exports = router;
