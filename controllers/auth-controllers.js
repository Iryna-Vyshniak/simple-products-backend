const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const path = require('path');
const fs = require('fs/promises');
const Jimp = require('jimp');
const { randomUUID } = require('crypto');

const { User } = require('../models/user');
const HttpError = require('../helpers/HttpError');
const sendEmail = require('../helpers/sendEmail');
const ctrlWrapper = require('../decorators/ctrlWrapper');

const { SECRET_KEY, BASE_URL, FRONTEND_URL } = process.env;

const avatarDir = path.join(__dirname, '../', 'public', 'avatars');

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
    html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationToken}">Click to confirm your registration</a>`,
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

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '23h' });

  await User.findByIdAndUpdate(candidate._id, { token });
  //   await User.findOneAndUpdate(email, { token });

  res.json({
    token,
    user: {
      name: candidate.name,
      email: candidate.email,
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

const updateAvatar = async (req, res, next) => {
  if (!req.file) {
    throw HttpError(400, 'Avatar must be provided');
  }

  const { _id } = req.user;
  console.log('ID: ', _id);
  // console.log(req.user);
  const { path: tempUpload, originalname } = req.file;

  await Jimp.read(tempUpload)
    .then((avatar) => {
      return avatar
        .resize(250, 250) // resize
        .quality(60) // set JPEG quality
        .write(tempUpload); // save
    })
    .catch((err) => {
      throw err;
    });

  const fileName = `${_id}_${originalname}`;

  const publicUpload = path.join(avatarDir, fileName);

  await fs.rename(tempUpload, publicUpload);

  const avatarUrl = path.join('avatars', fileName);

  await User.findByIdAndUpdate(_id, { avatarUrl });

  res.json({ avatarUrl });
};

// get current user
const getCurrent = async (req, res) => {
  console.log(req.user);
  const { name, email, token } = req.user;
  res.json({
    token,
    user: {
      name,
      email,
    },
  });
};

module.exports = {
  signUp: ctrlWrapper(signUp),
  verify: ctrlWrapper(verify),
  resendVerify: ctrlWrapper(resendVerify),
  signIn: ctrlWrapper(signIn),
  logout: ctrlWrapper(logout),
  updateAvatar: ctrlWrapper(updateAvatar),
  getCurrent: ctrlWrapper(getCurrent),
};
