const router = require("express").Router();
const session = require("express-session");
const { Message, validMessage } = require("../models/message");
const { User } = require("../models/user");
const { Conversation } = require("../models/Conversation");
const { UserInChat } = require("../models/userInChat");

const { auth } = require("../middleware/auth");
const {
  Notification,
  validateNotifications,
} = require("../models/notification");

// -- User in chat -- //
router.post("/userInChatTrue", auth, async (req, res) => {
  let user = await User.findOne({ email: req.session.email });

  if (!user) {
    return res.send("user not login");
  }

  let userId = user._id;

  let findUser = await UserInChat.findOne({ userId: userId });

  if (!findUser) {
    let userInChat = await new UserInChat({
      ...req.body,
      userId: userId,
      online: true,
    });

    await userInChat.save();

    res.send(userInChat);
  } else {
    let userInChat = await UserInChat.findOneAndUpdate(
      { userId: userId },
      {
        $set: {
          currentChatId: req.body.currentChatId,
          online: true,
        },
      }
    );

    res.send(userInChat);
  }
});

// -- User leave chat -- //
router.put("/userInChatFalse", auth, async (req, res) => {
  let user = await User.findOne({ email: req.session.email });

  if (!user) {
    return res.send("user not login");
  }

  let userId = user._id;

  let userInChat = await UserInChat.findOneAndUpdate(
    { userId: userId },
    {
      $set: {
        online: false,
      },
    }
  );

  res.send(userInChat);
});

// -- show status user -- //
router.get("/userInChat/:id", auth, async (req, res) => {
  console.log(req.params.id);
  let userInChat = await UserInChat.findOne({ userId: req.params.id });
  if (!userInChat) {
    return res.send("user not found");
  }

  res.send(userInChat);
});

// -- new Notification -- //
router.post("/newNotification", auth, async (req, res) => {
  const userSession = await User.findOne({ email: req.session.email });

  const { error } = validateNotifications({
    senderName: userSession.name,
    senderLastName: userSession.lastName,
    receiverId: req.body.receiverId,
    senderId: req.body.senderId,
  });

  if (error) return res.send(error.details[0].message);

  // const receiverId = req.body.receiverId;
  // const checkUserOnline = await User.findById({ _id: receiverId });

  // console.log("receiverId :", receiverId);
  // console.log("checkUserOnline :", checkUserOnline);

  let notification = new Notification({
    ...req.body,
    senderName: userSession.name,
    senderLastName: userSession.lastName,
    receiverId: req.body.receiverId,
    senderId: req.body.senderId,
  });

  // ------------------updated the conversation to top in DB & front end when user send new message------------------ //

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

  const saveNotification = await notification.save();
  res.status(200).json({ saveNotification, updateConvTime, updateConvTime2 });
});

// -- new messages -- //
router.post("/", auth, async (req, res) => {
  const user = await User.findOne({ email: req.session.email });

  const { error } = validMessage({
    sender: user._id.toString(),
    name: user.name,
    lastName: user.lastName,
    image: user.image,
    text: req.body.text,
  });

  if (error) return res.send(error.details[0].message);

  const newMessage = new Message({
    ...req.body,
    sender: user._id,
    name: user.name,
    lastName: user.lastName,
    image: user.image,
    text: req.body.text,
  });

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

// -- get Notification receiverUser -- /
router.get("/notification/receiver/:receiverId", auth, async (req, res) => {
  let notification = await Notification.find({
    receiverId: req.params.receiverId,
  });
  res.send(notification);
});

// -- get Notification senderUser -- /
router.get("/notification/sender/:senderId", auth, async (req, res) => {
  let notification = await Notification.find({
    senderId: req.params.senderId,
  });

  res.send(notification);
});

// -- remove Notification -- /
router.delete("/notification/sender/:senderId", auth, async (req, res) => {
  let notification = await Notification.deleteMany({
    senderId: req.params.senderId,
  });

  res.send(notification);
});

// -- get conversationId -- //
router.get("/:conversationId", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
