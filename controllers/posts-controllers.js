const Post = require('../models/post');
const ctrlWrapper = require('../decorators/ctrlWrapper');
const HttpError = require('../helpers/HttpError');
const cloudinary = require('../helpers/cloudinary');
const fs = require('fs/promises');

// GET ALL POSTS
const getAll = async (req, res) => {
  const posts = await Post.find({}).populate('owner', '_id name email avatarUrl');
  res.json(posts);
};

// CREATE POST
const createPost = async (req, res) => {
  const { _id: owner } = req.user;

  const post = await Post.create({
    ...req.body,
    owner,
  });
  //   const doc = new Post({
  //     title: req.body.title,
  //     text: req.body.text,
  //     imageUrl: req.body.imageUrl,
  //     tags: req.body.tags,
  //     owner,
  //   });

  //   const post = await doc.save();

  res.status(201).json(post);
};

// GET ONE
const getOne = async (req, res) => {
  const postId = req.params.id;

  const post = await Post.findOneAndUpdate(
    { _id: postId },
    { $inc: { viewsCount: 1 } },
    { new: true }
  );
  if (!post) {
    throw HttpError(404, 'Not Found Post');
  }
  res.json(post);
};

// DELETE
const deletePost = async (req, res) => {
  const postId = req.params.id;
  const owner = req.user._id;

  const post = await Post.findOneAndDelete({ _id: postId, owner }, req.body, { new: true });

  if (!post) {
    throw HttpError(404, 'Not Found Post');
  }

  res.json({
    message: 'Post successfully deleted',
  });
};

// UPDATE
const updatePost = async (req, res) => {
  const postId = req.params.id;
  const owner = req.user._id;

  const post = await Post.findOneAndUpdate({ _id: postId, owner }, req.body, { new: true });

  if (!post) {
    throw HttpError(404, 'Not Found Post');
  }

  res.json(post);
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  createPost: ctrlWrapper(createPost),
  getOne: ctrlWrapper(getOne),
  deletePost: ctrlWrapper(deletePost),
  updatePost: ctrlWrapper(updatePost),
};
