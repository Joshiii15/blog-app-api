const Post = require("../models/Post");
const { errorHandler } = require("../auth");

// Create Post
module.exports.createPost = async (req, res) => {
  const { title, content } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. Please log in" });
    }

    const newPost = new Post({ title, content, author: req.user.id });
    const savedPost = await newPost.save();
    return res.status(201).json({
      message: "Post created successfully",
      post: savedPost,
    });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

//Get All Post
module.exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .populate({
        path: "comments.commenter",
        select: "name",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

//Get Single Post
module.exports.getPost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id).populate("author", "name email");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

//Update Post
module.exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this post" });
    }

    //Update post fields
    post.title = title || post.title;
    post.content = content || post.content;

    const updatedPost = await post.save();
    return res.status(200).json(updatedPost);
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

//Delete Post
module.exports.deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(id);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

//Add a comment to a post
module.exports.addComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = { commenter: req.user.id, content };

    post.comments.push(comment);
    await post.save();

    return res
      .status(201)
      .json({ message: "Comment added successfully", post });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

//Delete a comment
module.exports.deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const comment = post.comments[commentIndex];

    // Check permissions
    if (
      comment.commenter.toString() !== req.user.id &&
      post.author.toString() !== req.user.id &&
      !req.user.isAdmin
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment" });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    return res
      .status(200)
      .json({ message: "Comment deleted successfully", post: post });
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

//Admin delete all posts or a specific post
module.exports.adminDeletePost = async (req, res) => {
  const { id } = req.params;

  try {
    if (id) {
      const post = await Post.findByIdAndDelete(id);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      return res.status(200).json({ message: "Post deleted successfully" });
    } else {
      await Post.deleteMany({});
      return res
        .status(200)
        .json({ message: "All posts deleted successfully" });
    }
  } catch (error) {
    return errorHandler(error, req, res);
  }
};
