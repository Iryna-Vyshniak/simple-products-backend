const Post = require('../models/post');
const { User } = require('../models/user');
const ctrlWrapper = require('../decorators/ctrlWrapper');
const HttpError = require('../helpers/HttpError');
const cloudinary = require('../helpers/cloudinary');
// const fs = require('fs/promises');
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
  const totalPosts = await Post.countDocuments();
  //  const totalPosts = await Post.find().count();

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
  ).populate('owner', '_id name email avatarUrl');
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
  const { body, file } = req;

  const post = await Post.findById({ _id: postId });

  if (!post) {
    throw HttpError(404, 'Not Found Post');
  }

  const updateData = {
    title: body.title,
    text: body.text,
  };

  if (file) {
    const { path: oldPath } = file;

    const fileData = await cloudinary.uploader.upload(oldPath, {
      folder: 'posts',
    });

    updateData.imageUrl = fileData.url;
  }

  const updatePost = await Post.findByIdAndUpdate(
    {
      _id: postId,
      owner,
    },
    updateData,
    { new: true }
  );

  res.json(updatePost);
};

// GET ALL USER POSTS
const getUserPosts = async (req, res) => {
  const { user } = req.params;
  console.log(user);

  const postList = await Post.find().populate({
    path: 'owner',
    match: { name: user },
    select: '_id name email avatarUrl',
  });

  const filteredPosts = postList.filter((post) => post.owner !== null);

  if (filteredPosts.length === 0) {
    throw new HttpError(404, 'Not Found Posts');
  }

  res.json({ posts: filteredPosts });
};
// const getUserPosts = async (req, res) => {
//   const { posts } = req.user;
//   // console.log('POSTS', posts);
//   // Видаляємо null або невизначені значення
//   const validPosts = posts.filter((post) => post !== null && post._id);

//   const postIds = await validPosts.map((post) => post._id);
//   // console.log(postIds);

//   // опцією $in, щоб знайти всі пости, які мають ідентифікатор, який знаходиться в postIds. Отриманий результат - postList - містить знайдені пости за цими ідентифікаторами.
//   const postList = await Post.find({ _id: { $in: postIds } }).populate(
//     'owner',
//     '_id name email avatarUrl'
//   );

//   if (postList.length === 0) {
//     throw HttpError(404, 'Not Found Posts');
//   }

//   res.json({ posts: postList });
// };

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

  const posts = await Post.find(query, '', { skip, limit }).populate(
    'owner',
    '_id name email avatarUrl'
  );

  const totalPosts = await Post.find(query).count();

  res.json({
    posts,
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

const getAllTags = async (req, res) => {
  const tags = await Post.distinct('tags');

  res.json(tags);
};

// FAVORITES POSTS
const setFavoritePost = async (req, res) => {
  const owner = req.user._id;
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {
    throw HttpError(404, 'Could not find post for provided id.');
  }
  // В даному випадку краще використовувати $addToSet (not  $push:), оскільки це дозволить додавати унікальні значення до масиву, запобігаючи дублікатам. Якщо користувач вже лайкнув пост або додав його до улюблених, це не призведе до додавання додаткових елементів у масив.
  const user = await User.findByIdAndUpdate(owner, { $addToSet: { favorites: id } });

  if (!user) {
    throw HttpError(404, `Post not found`);
  }

  if (user.favorites.includes(id)) {
    throw HttpError(422, `Post is already in favorites.`);
  }

  await Post.findByIdAndUpdate(id, { $addToSet: { likedBy: owner } });

  res.status(201).json({ message: 'Post added to favorites successfully' });
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
  getAllTags: ctrlWrapper(getAllTags),
  setFavoritePost: ctrlWrapper(setFavoritePost),
};
