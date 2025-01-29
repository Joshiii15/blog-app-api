const express = require("express");
const postController = require("../controllers/post");
const { verify, isLoggedIn, verifyAdmin } = require("../auth");
const router = express.Router();

//Create post
router.post("/addPost", verify, isLoggedIn, postController.createPost);

//Get all posts
router.get("/", verify, isLoggedIn, postController.getAllPosts);

//Get single post
router.get("/:id", verify, isLoggedIn, postController.getPost);

//Update post
router.put("/:id", verify, isLoggedIn, postController.updatePost);

//Delete post
router.delete("/:id", verify, isLoggedIn, postController.deletePost);

//Add comment
router.post("/addComment/:id", verify, isLoggedIn, postController.addComment);

//Delete comment
router.delete(
  "/deleteComment/:postId/:commentId",
  verify,
  isLoggedIn,
  (req, res, next) => {
    if (req.user.isAdmin) {
      return verifyAdmin(req, res, next);
    }
    next();
  },
  postController.deleteComment
);

//Admin delete post
router.delete(
  "/admin/deletePost/:id?",
  verify,
  isLoggedIn,
  verifyAdmin,
  postController.adminDeletePost
);

module.exports = router;
