const { server } = require("../app");
const { Post } = require("../models/posts");
const { User } = require("../models/user");
const session = require("express-session");
const { apiUrl } = require("../config.json");
const io = require("socket.io")(server, {
  cors: {
    origin: apiUrl,
    methods: ["GET", "POST"],
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId, userId) => {
  users = users.filter(
    (user) => user.socketId !== socketId && user.userId !== userId
  );
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", async (socket) => {
  //   console.log("socket.io: User connected ");

  // --------------- see uploaded in live work Only db Cloud --------------- //
  // const mongoDbCursor = Post.watch();
  // mongoDbCursor.on("change", async (data) => {
  //   // console.log(data);
  //   // switch (data.operationType) {
  //   // //  case "insert":
  //   //   //  return io.emit("eventCreated", { ...data.fullDocument });
  //   //   case "update":
  //   //     // const eventId = data.documentKey._id;
  //   //     // const event = await Post.findOne({ _id: eventId });
  //   //     const event = await await Post.find({});

  //   //     return io.emit("eventUpdated", event);
  //   //   //case "delete":
  //   //     //return io.emit("eventDeleted", data.documentKey._id);
  //   // }
  // });

  await Post.find({}).exec((err, result) => {
    io.emit("get-posts", result);
  });

  //take userId and socketId from user

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
  });

  socket.on(
    "sendNotification",
    ({ senderName, senderLastName, receiverId }) => {
      const user = getUser(receiverId);
      io.to(user?.socketId).emit("getNotification", {
        senderName,
        senderLastName,
        receiverId,
      });
    }
  );

  socket.on(
    "sendMessage",
    ({ senderId, receiverId, text, image, name, lastName }) => {
      removeUser(socket.id, senderId);
      addUser(senderId, socket.id);
      const user = getUser(receiverId);
      io.to(user?.socketId).emit("getMessage", {
        senderId,
        text,
        image,
        name,
        lastName,
      });
    }
  );

  await User.find({}).exec((err, result) => {
    io.emit("get-users", result);
  });

  socket.on("disconnect", (req, res) => {
    removeUser(socket.id);
  });
});
