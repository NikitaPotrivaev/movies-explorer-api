const userRouter = require('express').Router();
const { validateUpdateUser } = require('../middlewares/validation');

const {
  updateUserData,
  getUser,
} = require('../controllers/users');

userRouter.get('/me', getUser);
userRouter.patch('/me', validateUpdateUser, updateUserData);

module.exports = {
  userRouter,
};
