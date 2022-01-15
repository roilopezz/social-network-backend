const express = require("express");
const session = require("express-session");
const app = express();
const cors = require("cors");
const { apiUrl } = require("./config.json");
const userRouter = require("./routers/user");
const postRouter = require("./routers/post");
const conversationRouter = require("./routers/conversations");
const friendsRouter = require("./routers/friends");
const messagesRouter = require("./routers/messages");
const http = require("http");
const server = http.createServer(app);
module.exports = { server };
const socket = require("./models/socket");
const multer = require("multer");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/upload", express.static("upload"));

// Loggers
const morgan = require("morgan");
app.use(morgan("dev"));

// -- Session settings -- //
const TWO_HOURS = 1000 * 60 * 60 * 2;
const {
  PORT = 3900,
  NODE_ENV = "development",
  SESS_NAME = "sid",
  SESS_SECRET = "secretSecret",
  SESS_LIFETIME = TWO_HOURS,
} = process.env;

const IN_PROD = NODE_ENV === "production";

// app.enable("trust proxy", 1);

app.use(
  session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
      maxAge: SESS_LIFETIME,
      sameSite: true,
      // to enable cookies in heroku or another cloud you need to edit :
      // sameSite: "none",
      secure: IN_PROD,
    },
  })
);

// -- enable cors -- //
app.use(
  cors({
    origin: [apiUrl],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

// -- connect mongoDB -- //
const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost/social-net", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("connect to mongoDB");
  })
  .catch(() => {
    console.log("the connection was fail");
  });

// -- settings upload image -- //
const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "upload/");
  },
  filename: (req, file, cb) => {
    if (file.mimetype != "image/jpeg" && file.mimetype != "image/png") {
      return null;
    }
    cb(null, `${Date.now()} - ${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: 1024 * 1024 * 2,
});

// routes //

app.enable(socket);

app.use("/", upload.single("image"), userRouter);
app.use("/post", postRouter);
app.use("/conversations", conversationRouter);
app.use("/messages", messagesRouter);
app.use("/friends", friendsRouter);

server.listen(PORT, () => {
  console.log(`listening on port : ${PORT}`);
});
