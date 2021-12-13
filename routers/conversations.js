const router = require("express").Router();
const { Conversation, validConversation } = require("../models/Conversation");
const { User } = require("../models/user");
const { Message } = require("../models/message");
const { auth } = require("../middleware/auth");

// -- new conversation -- //
router.post("/", auth, async (req, res) => {
  const conversation = await Conversation.find({
    members: { $in: [req.body.senderId, req.body.receiverId] },
  });

  const check = conversation.some(
    (con) =>
      (con.members[0] === req.body.senderId &&
        con.members[1] === req.body.receiverId) ||
      (con.members[0] === req.body.receiverId &&
        con.members[1] === req.body.senderId)
  );

  if (check) {
    // ------------------block to add two conversation & updated the conversation to top in DB & front end------------------ //

    const updateConvTime = await Conversation.findOneAndUpdate(
      {
        members: [req.body.senderId, req.body.receiverId],
      },
      {
        $set: {
          timestamps: true,
        },
      }
    );

    const updateConvTime2 = await Conversation.findOneAndUpdate(
      {
        members: [req.body.receiverId, req.body.senderId],
      },
      {
        $set: {
          timestamps: true,
        },
      }
    );

    return res.send("cant send conversations twice");
  }

  let receiverUser = await User.findById({ _id: req.body.receiverId });
  let senderUser = await User.findById({ _id: req.body.senderId });

  const receiverId = receiverUser._id.toString();
  const senderId = senderUser._id.toString();

  const { error } = validConversation({
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

  const newConversation = new Conversation({
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

  const newMessage = new Message({
    conversationId: await newConversation._id,
  });

  const savedConversation = await newConversation.save();
  const savedMessage = await newMessage.save();
  res.status(200).json({ savedConversation, savedMessage });
});

// -- get conversation of a user -- //
router.get("/:userId", auth, async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    }).sort({ updatedAt: +1 });

    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// -- get conversation includes two userId [current chat]-- //
router.get("/find/:firstUserId/:secondUserId", auth, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
