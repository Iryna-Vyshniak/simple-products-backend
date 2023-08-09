/* "валідація форми:
title: макс 250 сиволів | обов'язково
start: формат 09:00 | обов'язково 
end: формат 09:30 | end > start | обов'язково
priority: [low | medium | high] | обов'язково
date: формат YYYY-MM-DD | обов'язково
category: [to-do | in-progress | done] | обов'язково"			
*/
const { Schema, model } = require('mongoose');
const handleMongooseError = require('../helpers/handleMongooseError');
const formatDate = require('../utils/formatDate');

const taskSchema = new Schema(
  {
    title: {
      type: String,
      default: 'My Task',
      required: [true, 'Please add title of task'],
    },
    start: {
      type: String,
      default: '09:00',
      required: [true, 'Please set start time of task'],
    },
    end: {
      type: String,
      default: '09:30',
      required: [true, 'Please set end time of task'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
      trim: true,
      required: true,
    },
    date: {
      //   type: Date,
      type: String,
      default: formatDate,
      required: true,
    },
    category: {
      type: String,
      enum: ['to-do', 'in-progress', 'done'],
      default: 'to-do',
      trim: true,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  },
  { versionKey: false, timestamps: true }
);

taskSchema.post('save', handleMongooseError);

const Task = model('task', taskSchema);

module.exports = Task;
