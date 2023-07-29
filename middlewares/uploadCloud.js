const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../helpers/cloudinary');
const multer = require('multer');
const HttpError = require('../helpers/HttpError');

const configPoster = new CloudinaryStorage({
  cloudinary: cloudinary,
  allowedFormats: ['jpeg', 'png', 'gif', 'jpg'],
  filename: (req, file, cb) => {
    const uniquePreffixs = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const { originalname } = file;
    const fileName = `${uniquePreffixs}_${originalname}`;
    cb(null, fileName);
    // cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(HttpError(415, 'Unsupported image format. Choose file with extention jpeg or png'));
  }
};

const uploadCloud = multer({ storage: configPoster, fileFilter });

module.exports = uploadCloud;
