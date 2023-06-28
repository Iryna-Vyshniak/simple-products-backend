const bcrypt = require('bcryptjs');

const { User } = require('../models/user');
const HttpError = require('../helpers/HttpError');
const ctrlWrapper = require('../decorators/ctrlWrapper');
const { SECRET_KEY } = process.env;

const signUp = async (req, res, next) => {
  const { email, password } = req.body;

  const candidate = await User.findOne({ email });

  if (candidate) {
    throw HttpError(409, 'Email already exists');
  }

  const hashPassword = await bcrypt.hashSync(password, 10);

  const result = await User.create({ ...req.body, password: hashPassword });

  res.status(201).json({
    result,
  });
};

const signIn = async (req, res, next) => {};
const logout = async (req, res, next) => {};

module.exports = {
  signUp: ctrlWrapper(signUp),
  signIn: ctrlWrapper(signIn),
  logout: ctrlWrapper(logout),
};
