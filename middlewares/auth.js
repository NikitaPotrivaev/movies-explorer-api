const jwt = require('jsonwebtoken');

const AuthorizationError = require('../utils/AuthorizationError'); // 401

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new AuthorizationError('Необходима авторизация'));
  }
  let payload;
  const token = authorization.replace('Bearer ', '');
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'token-generate-key');
  } catch (error) {
    return next(new AuthorizationError('Неверные почта или пароль'));
  }
  req.user = payload;
  return next();
};
