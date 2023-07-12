const jwt = require('jsonwebtoken');

const HttpError = require('../helpers/HttpError');

const { User } = require('../models/user');

const { SECRET_KEY } = process.env;

const checkAuth = async (req, res, next) => {
  const { authorization = '' } = req.headers;
  // console.log(authorization); // Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0OTlmZGY0M2JlZDdjODE2Y2U1YTFmNSIsImlhdCI6MTY4Nzg2ODY5MCwiZXhwIjoxNjg4MDQxNDkwfQ.-qY9ioaCOXTI6T_eW-iLM_YPWxzw3i1Z6tFTb9SIxb0

  //   const [bearer, token] = req.headers.authorization?.split(' ');
  const [bearer, token] = authorization.split(' ');
  if (bearer !== 'Bearer') {
    throw HttpError(401, 'Not authorized');
  }

  try {
    // const payload = jwt.verify(token, SECRET_KEY);
    // const user = await User.findById({_id: payload.id});
    const { id } = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(id);

    if (!user || !user.token || user.token !== token) {
      throw HttpError(401, 'Not authorized');
    }
    req.user = user;
    console.log('User', req.user);
    next();
  } catch (error) {
    next(HttpError(401, 'Not authorized'));
  }
};

module.exports = checkAuth;
