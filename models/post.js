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
      enum: ['war', 'animal', 'fashion', 'science'],
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
    favorites: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: 'user',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    comments: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  },
  { versionKey: false, timestamps: true }
);

postSchema.post('save', handleMongooseError);

const Post = model('post', postSchema);

module.exports = Post;
