const { Schema, model } = require('mongoose');
const handleMongooseError = require('../helpers/handleMongooseError');

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      unique: true,
    },
    tags: {
      type: Array,
      default: [],
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'user',
    },
  },
  { versionKey: false, timestamps: true }
);

postSchema.post('save', handleMongooseError);

const Post = model('post', postSchema);

module.exports = Post;
