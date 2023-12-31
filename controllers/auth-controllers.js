const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
// const path = require('path');
const fs = require('fs/promises');
// const Jimp = require('jimp');
const { randomUUID } = require('crypto');

const { User } = require('../models/user');
const HttpError = require('../helpers/HttpError');
const sendEmail = require('../helpers/sendEmail');
const ctrlWrapper = require('../decorators/ctrlWrapper');
const cloudinary = require('../helpers/cloudinary');
// const Post = require('../models/post');

const { SECRET_KEY, FRONTEND_URL } = process.env;

// const avatarDir = path.join(__dirname, '../', 'public', 'avatars');

// register
const signUp = async (req, res, next) => {
  const { email, password } = req.body;

  const candidate = await User.findOne({ email });

  if (candidate) {
    throw HttpError(409, 'Email already exists');
  }

  const hashPassword = await bcrypt.hashSync(password, 10);
  const avatarUrl = gravatar.url(email);
  const verificationToken = randomUUID();

  const result = await User.create({
    ...req.body,
    password: hashPassword,
    avatarUrl,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: 'Сonfirm your registration',
    html: `<a target="_blank" href="${FRONTEND_URL}/signin?verificationToken=${verificationToken}">Click to confirm your registration</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    result,
  });
};

// verify email

const verify = async (req, res) => {
  const { verificationToken } = req.params;

  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw HttpError(404, 'User not found');
  }

  await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: '' });

  res.json({
    message: 'Verification successful',
  });
};

// resend verify email

const resendVerify = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(404, 'User not found');
  }
  if (user.verify) {
    throw HttpError(400, 'Verification has already been passed');
  }

  const verifyEmail = {
    to: email,
    subject: 'Сonfirm your registration',
    html: `<a target="_blank" href="${FRONTEND_URL}/api/auth/verify/${user.verificationToken}">Click to confirm your registration</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: 'Verification email sent',
  });
};

// login
const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw HttpError(400, 'Email or password is missing');
  }

  const candidate = await User.findOne({ email });

  if (!candidate || !bcrypt.compare(password, candidate.password)) {
    throw HttpError(401, 'Wrong credentials');
  }

  if (!candidate.verify) {
    throw HttpError(404, 'User not found');
  }

  const payload = {
    id: candidate._id,
    email: candidate.email,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '60d' });

  await User.findByIdAndUpdate(candidate._id, { token });
  //   await User.findOneAndUpdate(email, { token });

  res.json({
    token,
    user: {
      _id: candidate._id,
      name: candidate.name,
      email: candidate.email,
      avatarUrl: candidate.avatarUrl,
      favorites: candidate.favorites,
    },
  });
};

// logout user
const logout = async (req, res, next) => {
  const { _id } = req.user;
  // console.log(_id);
  //   await User.findByIdAndUpdate({ _id: user.id }, { token: '' });
  await User.findByIdAndUpdate(_id, { token: '' });

  res.status(204).json({ message: 'Logout success' });
};

// update avatar

const updateUser = async (req, res, next) => {
  if (!req.file) {
    throw HttpError(400, 'Avatar must be provided');
  }

  const { _id } = req.user;
  // console.log('ID: ', _id);
  // console.log(req.user);

  const { path: tempUpload } = req.file;
  // console.log(tempUpload);
  // const { path: tempUpload, originalname } = req.file;

  // await Jimp.read(tempUpload)
  //   .then((avatar) => {
  //     return (
  //       avatar
  //         // .resize(250, 250) // resize
  //         .quality(60) // set JPEG quality
  //         .write(tempUpload)
  //     ); // save
  //   })
  //   .catch((err) => {
  //     throw err;
  //   });

  // const fileName = `${_id}_${originalname}`;

  // const publicUpload = path.join(avatarDir, fileName);

  // await fs.rename(tempUpload, publicUpload);

  // const avatarUrl = path.join('avatars', fileName);

  const fileData = await cloudinary.uploader.upload(tempUpload, {
    folder: 'avatars',
  });

  // console.log('FILEDATA', fileData);
  // збережений в папку temp файл - видаляємо
  await fs.unlink(tempUpload);

  const name = req.body.name;

  // const user = await User.findByIdAndUpdate(_id, { avatarUrl, name }, { new: true });
  const user = await User.findByIdAndUpdate(_id, { avatarUrl: fileData.url, name }, { new: true });

  res.json({
    token: user.token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      favorites: user.favorites,
    },
  });
};

// get current user
const getCurrent = async (req, res) => {
  // console.log(req.user);
  const { _id, name, email, token, avatarUrl, favorites } = req.user;
  res.json({
    token,
    user: {
      _id,
      name,
      email,
      avatarUrl,
      favorites,
    },
  });
};

const getAllUsers = async (req, res) => {
  const users = await User.find().sort('posts.length');
  // console.log('USERS', users);

  const popularAuthor = users.filter((user) => user.posts.length > 0);
  // console.log(popularAuthor);

  if (!users || !popularAuthor) {
    throw HttpError(404, 'Users not found');
  }

  res.json({ users: popularAuthor });
};

// // get favorite
// const getFavoritesPosts = async (req, res) => {
//   const { id } = req.params;

//   const user = await User.findById(id);
//   console.log(user);

//   if (!user) {
//     throw HttpError(404, `User not found`);
//   }

//   // Отримуємо об'єкти улюблених постів з усіма даними
//   const favoritePosts = await Post.find({ _id: { $in: user.favorites } });

//  // console.log(favoritePosts);

//   res.json(favoritePosts);
// };

module.exports = {
  signUp: ctrlWrapper(signUp),
  verify: ctrlWrapper(verify),
  resendVerify: ctrlWrapper(resendVerify),
  signIn: ctrlWrapper(signIn),
  logout: ctrlWrapper(logout),
  updateUser: ctrlWrapper(updateUser),
  getCurrent: ctrlWrapper(getCurrent),
  getAllUsers: ctrlWrapper(getAllUsers),
  // getFavoritesPosts: ctrlWrapper(getFavoritesPosts),
};
