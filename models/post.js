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
      type: [String],
      enum: ['war', 'animal', 'fashion', 'science', 'politics', 'sport', 'food', 'travel'],
      default: [],
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    likedBy: {
      type: [{ type: Schema.Types.ObjectId, ref: 'user' }],
      default: [],
    },
    comments: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  },
  { versionKey: false, timestamps: true }
);

postSchema.post('save', handleMongooseError);

const Post = model('post', postSchema);

module.exports = Post;
