require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const helmet = require('helmet');

const { PORT = 3000, DB_ADDRESS = 'mongodb://127.0.0.1:27017/bitfilmsdb' } = process.env;

const cors = require('cors');
const auth = require('./middlewares/auth');
const { createUser, login } = require('./controllers/users');
const { userRouter } = require('./routes/users');
const { movieRouter } = require('./routes/movies');
const { validateCreateUser, validateUserLogin } = require('./middlewares/validation');
const errorHandler = require('./middlewares/error-handler');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const limiter = require('./middlewares/limiter');

const NotFound = require('./utils/NotFound');

const app = express();
app.use(cors({
  origin: ['https://puppet.nomoredomainsmonster.ru'],
  credentials: true,
  maxAge: 30,
}));
app.use(helmet());

mongoose.connect(DB_ADDRESS, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(requestLogger);
app.use(express.json());
app.use(limiter);

app.post('/signup', validateCreateUser, createUser);
app.post('/signin', validateUserLogin, login);
app.use('/users', auth, userRouter);
app.use('/movies', auth, movieRouter);

app.all('*', auth, (req, res, next) => {
  next(new NotFound('Страница не найдена'));
});

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`${PORT} порт подключен`);
});
