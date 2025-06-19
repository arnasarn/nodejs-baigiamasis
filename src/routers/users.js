import express from "express";
import {
  GET_ALL_USERS,
  LOGIN_USER,
  SIGNUP_USER,
} from "../controllers/users.js";
import { validation } from "../middlewares/validation.js";
import { userLoginSchema, userRegisterSchema } from "../schemas/users.js";

export const usersRouter = express.Router();

usersRouter.get("/", GET_ALL_USERS);

usersRouter.post("/signUp", validation(userRegisterSchema), SIGNUP_USER);

usersRouter.post("/login", validation(userLoginSchema), LOGIN_USER);
