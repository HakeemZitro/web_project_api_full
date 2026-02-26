const usersRouter = require('express').Router();
const { getUsers, getUserById, updateUserInfo, updateUserAvatar } = require('../controllers/users.js');

usersRouter.get('/users', getUsers);
usersRouter.patch('/users/me', updateUserInfo);
usersRouter.patch('/users/me/avatar', updateUserAvatar);
usersRouter.get('/users/:id', getUserById);

module.exports = usersRouter;