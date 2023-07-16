const express = require('express');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

const app = express(); // web server

const productsRouter = require('./routes/api/products-router');
const authRouter = require('./routes/api/auth-router');

const formatLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(logger(formatLogger));
app.use(cors({ origin: '*' }));
app.use(express.json());
// add static
app.use(express.static('public'));

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use((err, req, res, next) => {
  const { status = 500, message = 'Server error' } = err;
  res.status(status).json(message);
});

module.exports = app;
