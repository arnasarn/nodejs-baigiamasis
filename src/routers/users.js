import express from "express";
import {
  GET_ALL_USERS,
  LOGIN_USER,
  REFRESH_TOKEN,
  SIGNUP_USER,
} from "../controllers/users.js";
import { validation } from "../middlewares/validation.js";
import {
  tokenSchema,
  userLoginSchema,
  userRegisterSchema,
} from "../schemas/users.js";
import { auth } from "../middlewares/auth.js";

export const usersRouter = express.Router();

usersRouter.get("/", auth, GET_ALL_USERS);

usersRouter.post("/signUp", validation(userRegisterSchema), SIGNUP_USER);

usersRouter.post("/login", validation(userLoginSchema), LOGIN_USER);

usersRouter.post("/refresh", validation(tokenSchema), REFRESH_TOKEN);
