const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const path = require('path');
const fs = require('fs/promises');

const { User } = require('../models/user');
const HttpError = require('../helpers/HttpError');
const ctrlWrapper = require('../decorators/ctrlWrapper');
const { SECRET_KEY } = process.env;

const avatarDir = path.join(__dirname, '../', 'public', 'avatars');

const signUp = async (req, res, next) => {
  const { email, password } = req.body;

  const candidate = await User.findOne({ email });

  if (candidate) {
    throw HttpError(409, 'Email already exists');
  }

  const hashPassword = await bcrypt.hashSync(password, 10);
  const avatarUrl = gravatar.url(email);
  // console.log(avatarUrl);

  const result = await User.create({ ...req.body, password: hashPassword, avatarUrl });

  res.status(201).json({
    result,
  });
};

const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const candidate = await User.findOne({ email });

  if (!candidate || !bcrypt.compare(password, candidate.password)) {
    throw HttpError(401, 'Wrong credentials');
  }

  const payload = {
    id: candidate._id,
    email: candidate.email,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '23h' });

  await User.findByIdAndUpdate(candidate._id, { token });
  //   await User.findOneAndUpdate(email, { token });

  res.json({ token });
};

const logout = async (req, res, next) => {
  const { _id } = req.user;
  console.log(_id);
  //   await User.findByIdAndUpdate({ _id: user.id }, { token: '' });
  await User.findByIdAndUpdate(_id, { token: '' });

  res.status(204).json({ message: 'Logout success' });
};

const updateAvatar = async (req, res, next) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;

  const filename = `${_id}_${originalname}`;

  const publicUpload = path.join(avatarDir, filename);

  await fs.rename(tempUpload, publicUpload);

  const avatarURL = path.join('avatars', filename);

  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({ avatarURL });
};

module.exports = {
  signUp: ctrlWrapper(signUp),
  signIn: ctrlWrapper(signIn),
  logout: ctrlWrapper(logout),
  updateAvatar: ctrlWrapper(updateAvatar),
};
