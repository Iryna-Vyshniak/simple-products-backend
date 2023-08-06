const { Schema, model } = require('mongoose');
const handleMongooseError = require('../helpers/handleMongooseError');

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  { timestamps: true }
);

commentSchema.post('save', handleMongooseError);

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
    // comments: {
    //   type: [{ type: String, ref: 'user' }],
    //   default: [],
    // },
    comments: [commentSchema],
  },
  { versionKey: false, timestamps: true }
);

postSchema.post('save', handleMongooseError);

const Post = model('post', postSchema);
const Comment = model('comment', commentSchema);

module.exports = { Post, Comment };
