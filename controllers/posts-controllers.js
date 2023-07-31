const Post = require('../models/post');
const ctrlWrapper = require('../decorators/ctrlWrapper');
const HttpError = require('../helpers/HttpError');
const cloudinary = require('../helpers/cloudinary');
const fs = require('fs/promises');
const { User } = require('../models/user');
const pagination = require('../utils/pagination');

// GET ALL POSTS
const getAll = async (req, res) => {
  const { page: currentPage, limit: currentLimit } = req.query;

  const { page, limit, skip } = pagination(currentPage, currentLimit);

  const posts = await Post.find({}, '', { skip, limit })
    .populate('owner', '_id name email avatarUrl')
    .sort('-createdAt');

  if (!posts) {
    throw HttpError(404, 'Not Found Post');
  }

  const popularPosts = await Post.find({}, '', { skip, limit }).sort('-viewsCount');
  const totalPosts = await Post.find().count();

  res.json({
    posts,
    popularPosts,
    totalPosts,
    totalPages: Math.ceil(totalPosts / limit),
    currentPage: page,
    limit,
  });
};

// CREATE POST
const createPost = async (req, res) => {
  const { _id: owner } = req.user;
  const { path: oldPath } = req.file;

  const fileData = await cloudinary.uploader.upload(oldPath, {
    folder: 'posts',
  });

  // await fs.unlink(oldPath);
  const post = await Post.create({
    ...req.body,
    owner,
    imageUrl: fileData.url,
  });
  //   const doc = new Post({
  //     title: req.body.title,
  //     text: req.body.text,
  //     imageUrl: req.body.imageUrl,
  //     tags: req.body.tags,
  //     owner,
  //   });

  //   const post = await doc.save();

  await User.findByIdAndUpdate(owner, { $push: { posts: post } }, { new: true });

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

// GET ALL USER POSTS
const getUserPosts = async (req, res) => {
  const { posts } = req.user;
  // console.log('POSTS', posts);
  // Видаляємо null або невизначені значення
  const validPosts = posts.filter((post) => post !== null && post._id);

  const postIds = await validPosts.map((post) => post._id);
  // console.log(postIds);

  // опцією $in, щоб знайти всі пости, які мають ідентифікатор, який знаходиться в postIds. Отриманий результат - postList - містить знайдені пости за цими ідентифікаторами.
  const postList = await Post.find({ _id: { $in: postIds } });

  if (postList.length === 0) {
    throw HttpError(404, 'Not Found Posts');
  }

  res.json(postList);
};

// GET POSTS BY TAG
const getPostsByTag = async (req, res) => {
  const { page: currentPage, limit: currentLimit } = req.query;

  const { page, limit, skip } = pagination(currentPage, currentLimit);

  const { tag } = req.params;

  const posts = await Post.find({ tags: [`${tag}`] }, '', { skip, limit }).sort('createdAt');

  if (!posts) {
    throw HttpError(404, 'Not Found Post');
  }

  const totalPosts = await Post.find({ tags: [`${tag}`] }).count();

  res.json({
    posts,
    totalPosts,
    totalPages: Math.ceil(totalPosts / limit),
    currentPage: page,
    limit,
  });
};

// GET SEARCH POST
const getSearchPosts = async (req, res) => {
  const { page: currentPage, limit: currentLimit, name = '' } = req.query;

  const { page, skip, limit } = pagination(currentPage, currentLimit);

  const query = {
    ...(page && page),
    ...(name && { title: { $regex: name, $options: 'i' } }),
  };

  if (!query) {
    const posts = await Post.find();

    res.json(posts);
  }

  const searchPosts = await Post.find(query, '', { skip, limit }).populate(
    'owner',
    '_id name email avatarUrl'
  );

  const totalPosts = await Post.find(query).count();

  res.json({
    searchPosts,
    totalPosts,
    totalPages: Math.ceil(totalPosts / limit),
    currentPage: page,
    limit,
  });

  // const { name = '' } = req.query;

  // if (!name) {
  //   const posts = await Post.find();

  //   return res.json(posts);
  // }

  // const searchPosts = await Post.find();

  // const filteredPosts = searchPosts.filter((post) =>
  //   post.title.toLowerCase().includes(name.toLowerCase())
  // );

  // if (filteredPosts.length === 0) {
  //   throw HttpError(404, 'Not Found Post');
  // }

  // res.json(filteredPosts);
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  createPost: ctrlWrapper(createPost),
  getOne: ctrlWrapper(getOne),
  deletePost: ctrlWrapper(deletePost),
  updatePost: ctrlWrapper(updatePost),
  getUserPosts: ctrlWrapper(getUserPosts),
  getPostsByTag: ctrlWrapper(getPostsByTag),
  getSearchPosts: ctrlWrapper(getSearchPosts),
};
