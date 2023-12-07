const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const NotFound = require('../utils/NotFound'); // 404
const ConflictRequest = require('../utils/ConflictRequest'); // 409
const AuthorizationError = require('../utils/AuthorizationError'); // 401
const BadRequest = require('../utils/BadRequest'); // 400

const { NODE_ENV, JWT_SECRET } = process.env;

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new NotFound('Пользователь не найден');
    } else {
      res.send(user);
    }
  } catch (error) {
    if (error.name === 'CastError') {
      next(new BadRequest('Отсутствует пользователь с таким id'));
    } else {
      next(error);
    }
  }
};

const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  const passwordHash = bcrypt.hash(password, 10);
  passwordHash.then((hash) => User.create({
    name, email, password: hash,
  }))
    .then(() => res.status(201).send({
      name, email,
    }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при создании пользователя'));
      } else if (error.code === 11000) {
        next(new ConflictRequest('Пользователь уже существует'));
      } else {
        next(error);
      }
    });
};

const updateUserData = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const update = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true },
    );
    res.send(update);
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(new BadRequest('Переданы некорректные данные при обновлении пользователя'));
    } else {
      next(error);
    }
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      throw new AuthorizationError('Неверные почта или пароль');
    } else {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'token-generate-key', { expiresIn: '7d' });
      res.send({ token });
    }
  } catch (error) {
    if (error) {
      next(new AuthorizationError('Неверные почта или пароль'));
    } else {
      next(error);
    }
  }
};

module.exports = {
  getUser,
  createUser,
  updateUserData,
  login,
};
