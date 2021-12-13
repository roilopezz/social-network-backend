const router = require("express").Router();
const { Post, generatePostNumber, validPost } = require("../models/posts");
const { User } = require("../models/user");
const { Comment, validComment } = require("../models/commentPost");
const session = require("express-session");
const { auth } = require("../middleware/auth");

// -- new post -- //
router.post("/", auth, async (req, res) => {
  // valid inputs to create a new post
  const body = req.body;
  let user = await User.findOne({ email: req.session.email });

  const { error } = validPost(body);

  if (error) return res.send(error.details[0].message);

  let post = await new Post({
    ...body,
    postNumber: await generatePostNumber(),
    user_id: user._id,
    name: user.name,
    lastName: user.lastName,
    userImage: user.image,
  });

  // save the post
  await post.save();
  res.send("the post was created");
});

// -- display Posts User -- //
router.get("/userposts/:id", auth, async (req, res) => {
  // --block to crash the server if user send id Illegal-- //
  if (req.params.id.length > 24 || req.params.id.length < 24) {
    return res.status(404).send("error !");
  }

  let post = await Post.find({ user_id: req.params.id });

  if (!post) return res.send("the post not found !");

  res.send(post);
});

// -- edit post -- //
router.put("/editpost/:id", auth, async (req, res) => {
  let user = await User.findOne({ email: req.session.email });

  console.log(req.body);

  const { error } = validPost(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, user_id: user._id },
    req.body
  );

  if (!post) return res.status(400).send("the post not found");

  res.send(post);
});

// -- delete post -- //
router.delete("/removepost/:id", auth, async (req, res) => {
  let user = await User.findOne({ email: req.session.email });
  let post = await Post.findByIdAndDelete({
    _id: req.params.id,
    user_id: user._id,
  });

  res.send("the post remove");
});

// -- like unlike -- //
router.put("/:id/like", auth, async (req, res) => {
  let user = await User.findOne({ email: req.session.email });
  let post = await Post.findOne({ _id: req.params.id });

  try {
    if (!post.likes.includes(user._id)) {
      await post.updateOne({ $push: { likes: user._id } });
      res.status(200).send("the post has liked");
    } else {
      await post.updateOne({ $pull: { likes: user._id } });
      res.status(200).send("The post has been unLike");
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

// -- add comment in post -- //
router.post("/addpostcomment/:id", auth, async (req, res) => {
  const body = req.body;
  let user = await User.findOne({ email: req.session.email });
  let post = await Post.findOne({ _id: req.params.id });

  if (!post) return res.status(401).send("error");

  const { error } = validComment(body);

  if (error) return res.status(401).send(error.details[0].message);

  let newComment = new Comment({
    ...body,
    user_id: user._id,
    name: user.name,
    lastName: user.lastName,
    userImage: user.image,
  });

  await post.updateOne({
    $push: {
      comments: {
        ...newComment,
      },
    },
  });

  res.send("add comment Successfully");
});

// -- delete comment in post -- //
router.post("/deletepostcomment/:id", auth, async (req, res) => {
  let user = await User.findOne({ email: req.session.email });
  let post = await Post.findOne({ _id: req.params.id });

  if (!post) return res.status(401).send("error");

  const { comments } = post;

  function deleteComment() {
    for (let i = 0; i < comments.length; i++) {
      if (
        comments[i]._id == req.body._id &&
        comments[i].user_id == user._id.toString()
      ) {
        let removedObject = comments.splice(i, 1);
        return true;
      }
    }
  }

  if (!deleteComment()) return res.status(401).send("error");

  await post.save();

  res.send("the comment post delete Successfully");
});

module.exports = router;
