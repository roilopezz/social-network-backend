const router = require("express").Router();
const { Post } = require("../models/posts");
const bcrypt = require("bcrypt");
const session = require("express-session");
const { Conversation } = require("../models/Conversation");
const { Friend } = require("../models/friend");
const { auth } = require("../middleware/auth");

const {
  validateRegister,
  User,
  validateLogin,
  validEditDetails,
} = require("../models/user");

// -- register user -- //
router.post("/register", async (req, res) => {
  const body = req.body;
  const { error } = validateRegister(body);

  console.log(error);

  if (error) return res.send(error.details[0].message);

  let user = await User.findOne({ email: body.email });

  if (user) return res.status(401).send("Email is invalid or already taken");

  user = new User({
    ...body,
    image: req.file
      ? req.file.path.replace("\\", "/")
      : "../upload/default/profile-picture.png",
    coverImage: "../upload/default/bg-cover.jpg",
  });

  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();
  res.send("user register ");
});

// -- login user -- //
router.post("/login", async (req, res) => {
  const body = req.body;

  const { error } = validateLogin(body);

  if (error) return res.send(error.details[0].message);

  let user = await User.findOne({ email: body.email });

  if (!user) return res.status(401).send("Email or Password incorrect");

  const validPass = await bcrypt.compare(body.password, user.password);

  if (validPass) {
    req.session.cookie;
    req.session.email = body.email;
    req.session.password = body.password;
    user.is_login = true;
    await user.save();
    res.send(user);
    return;
  }

  return res.status(401).send("Email or Password incorrect");
});

// -- logout -- //
router.post("/logout", async (req, res) => {
  let user = await User.findOne({
    email: req.session.email,
  });

  if (!user) return res.send("user cant logout if is not logged in !");

  user.is_login = false;
  await user.save();
  req.session.destroy();
  res.send(user);
});

// -- check if user online -- //
router.get("/user", async (req, res) => {
  let user = await User.findOne({ email: req.session.email }).select(
    "-password"
  );

  if (!user) return res.json(null);

  res.json(user);
});

// -- user profile -- //
router.get("/profile/:id", auth, async (req, res) => {
  // --block to crash the server if user send id Illegal-- //
  if (req.params.id.length > 24 || req.params.id.length < 24) {
    return res.status(404).send("error !");
  }

  const user = await User.findOne({ _id: req.params.id }).select("-password");

  if (!user) return res.status(401).send("profile not found !");

  res.send(user);
});

// -- Edit Profile -- //
router.put("/editprofile", auth, async (req, res) => {
  const { error } = validEditDetails(req.body);

  if (error) return res.status(401).send(error.details[0].message);

  let originalUser = await User.findOne({ email: req.session.email });

  // --update user name-- //
  let user = await User.findOneAndUpdate(
    { email: req.session.email },
    {
      $set: {
        name: req.body.name ? req.body.name : originalUser.name,
        lastName: req.body.lastName ? req.body.lastName : originalUser.lastName,
        birthday: req.body.birthday ? req.body.birthday : originalUser.birthday,
        city: req.body.city ? req.body.city : originalUser.city,
        street: req.body.street ? req.body.street : originalUser.street,
        phone: req.body.phone ? req.body.phone : originalUser.phone,
        headline: req.body.headline ? req.body.headline : originalUser.headline,
      },
    }
  );

  // --update friends name-- //
  const senderFriend = await Friend.updateMany(
    { "sender.senderId": user._id.toString() },
    {
      $set: {
        "sender.senderName": `${req.body.name} ${req.body.lastName}`,
      },
    }
  );

  const receiverFriend = await Friend.updateMany(
    { "receiver.receiverId": user._id.toString() },
    {
      $set: {
        "receiver.receiverName": `${req.body.name} ${req.body.lastName}`,
      },
    }
  );

  // --update conversation name-- //
  const sender = await Conversation.updateMany(
    { "sender.senderId": user._id.toString() },
    {
      $set: {
        "sender.senderName": `${req.body.name} ${req.body.lastName}`,
      },
    }
  );

  const receiver = await Conversation.updateMany(
    { "receiver.receiverId": user._id.toString() },
    {
      $set: {
        "receiver.receiverName": `${req.body.name} ${req.body.lastName}`,
      },
    }
  );

  // --update posts name-- //
  let post = await Post.updateMany(
    { user_id: originalUser._id },
    {
      $set: {
        name: req.body.name ? req.body.name : originalUser.name,
        lastName: req.body.lastName ? req.body.lastName : originalUser.lastName,
        "comments.$[elem].name": req.body.name
          ? req.body.name
          : originalUser.name,
        "comments.$[elem].lastName": req.body.lastName
          ? req.body.lastName
          : originalUser.lastName,
      },
    },
    {
      arrayFilters: [{ "elem.user_id": originalUser._id }],
      multi: true,
    }
  );

  res.send({ user, post });
});

// --change cover image-- //
router.post("/coverimage", auth, async (req, res) => {
  const UserCoverImage = await User.findOne({ email: req.session.email });

  const user = await User.findOneAndUpdate(
    { email: req.session.email },
    {
      $set: {
        coverImage: req.file
          ? req.file.path.replace("\\", "/")
          : UserCoverImage.coverImage,
      },
    }
  );

  if (!user) return res.status(404).send("user not found");

  res.send("ok");
});

// -- change profile image -- //
router.post("/updateProfileImage", auth, async (req, res) => {
  let userImage = await User.findOne({ email: req.session.email });

  /// -- update user image- - ///
  let updateUserImage = await User.findOneAndUpdate(
    { email: req.session.email },
    { image: req.file ? req.file.path.replace("\\", "/") : userImage.image }
  );

  /// --update Image Posts Save-- ///
  let updateImagePostsSave = await User.updateMany(
    { email: req.session.email },
    {
      $set: {
        "savePosts.$[elem].userImage": req.file
          ? req.file.path.replace("\\", "/")
          : userImage.image,
      },
    },
    {
      arrayFilters: [{ "elem.user_id": userImage._id }],
      multi: true,
    }
  );

  /// --update Image Posts Save Comments-- ///
  let updateImagePostsSaveComments = await User.updateMany(
    { email: req.session.email },
    {
      $set: {
        "savePosts.$[].comments.$[elem].userImage": req.file
          ? req.file.path.replace("\\", "/")
          : userImage.image,
      },
    },
    {
      arrayFilters: [{ "elem.user_id": userImage._id }],
      multi: true,
    }
  );

  // -- update friends image -- //
  const updateFriendImageSender = await Friend.updateMany(
    { "sender.senderId": userImage._id.toString() },
    {
      $set: {
        "sender.imageSender": req.file
          ? req.file.path.replace("\\", "/")
          : userImage.image,
      },
    }
  );

  const updateFriendImageReceiver = await Friend.updateMany(
    { "receiver.receiverId": userImage._id.toString() },
    {
      $set: {
        "receiver.imageReceiver": req.file
          ? req.file.path.replace("\\", "/")
          : userImage.image,
      },
    }
  );

  // --update conversation image-- //
  const updateSenderUserImage = await Conversation.updateMany(
    { "sender.senderId": userImage._id.toString() },
    {
      $set: {
        "sender.imageSender": req.file
          ? req.file.path.replace("\\", "/")
          : userImage.image,
      },
    }
  );

  const updateReceiverUserImage = await Conversation.updateMany(
    { "receiver.receiverId": userImage._id.toString() },
    {
      $set: {
        "receiver.imageReceiver": req.file
          ? req.file.path.replace("\\", "/")
          : userImage.image,
      },
    }
  );

  /// --update posts image-- ///
  const updatePostsImage = await Post.updateMany(
    { user_id: userImage._id },
    {
      userImage: req.file ? req.file.path.replace("\\", "/") : userImage.image,
    }
  );

  /// --update comments image-- ///
  const updateCommentsImage = await Post.updateMany(
    { "comments.user_id": userImage._id },
    {
      $set: {
        "comments.$[elem].userImage": req.file
          ? req.file.path.replace("\\", "/")
          : userImage.image,
      },
    },
    {
      arrayFilters: [{ "elem.user_id": userImage._id }],
      multi: true,
    }
  );

  res.send("the image updated !");
});

// -- user save posts -- //
router.post("/savepost/:id", auth, async (req, res) => {
  let post = await Post.findOne({ _id: req.params.id });

  if (!post) return res.status(401).send("post not found !");

  let user = await User.findOne({
    email: req.session.email,
  });

  const { savePosts } = user;

  const hasAlreadySave = savePosts.some((save) => {
    return save._id.toString() === post._id.toString();
  });

  if (hasAlreadySave) return res.status(401).send("can't save same post twice");

  await user.savePosts.push(post);
  await user.save();
  res.send("ok");
});

// -- Delete post user save- - //
router.post("/deletepostsave/:id", auth, async (req, res) => {
  let user = await User.findOne({
    email: req.session.email,
  });

  const { savePosts } = user;

  function deleteSavePost() {
    for (let i = 0; i < savePosts.length; i++) {
      if (savePosts[i]._id == req.params.id) {
        let removedObject = savePosts.splice(i, 1);
        return true;
      }
    }
  }

  if (!deleteSavePost()) return res.status(401).send("error");

  await user.save();
  res.send("the save post delete Successfully");
});

// -- get save posts user -- //
router.get("/postssave/:id", auth, async (req, res) => {
  let user = await User.findOne({ _id: req.params.id });

  res.send(user.savePosts);
});

module.exports = router;
