const Post = require('../models/post');
const ctrlWrapper = require('../decorators/ctrlWrapper');
const HttpError = require('../helpers/HttpError');
const cloudinary = require('../helpers/cloudinary');
const fs = require('fs/promises');

const getAll = async (req, res) => {
  const posts = await Post.find({}).populate('owner', '_id name email avatarUrl');
  res.json(posts);
};

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



module.exports = {
  getAll: ctrlWrapper(getAll),
  createPost: ctrlWrapper(createPost),
//   getOne: ctrlWrapper(getOne),
//   deletePost: ctrlWrapper(deletePost),
};
