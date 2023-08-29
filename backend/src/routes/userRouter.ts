const express = require("express");
import {UserController} from '../controllers/userController';
const {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} = new UserController()

const userRouter = express.Router();

// User API
userRouter.route("/").get(() => getAllUsers).post(() => createUser);
userRouter.route("/:id").get(() => getUserById).put(() => updateUser).delete(() => deleteUser);

module.exports = userRouter;