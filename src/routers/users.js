import express from "express";
import {
  GET_ALL_USERS,
  GET_USER_BY_ID,
  LOGIN_USER,
  REFRESH_TOKEN,
  SIGNUP_USER,
  GET_USERS_AGGREGATED_TICKETS,
  GET_USER_AGGREGATED_TICKETS_BY_ID,
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

usersRouter.get("/aggregatedTickets", auth, GET_USERS_AGGREGATED_TICKETS);

usersRouter.get(
  "/aggregatedTickets/:id",
  auth,
  GET_USER_AGGREGATED_TICKETS_BY_ID
);

usersRouter.get("/:id", auth, GET_USER_BY_ID);

usersRouter.post("/signUp", validation(userRegisterSchema), SIGNUP_USER);

usersRouter.post("/login", validation(userLoginSchema), LOGIN_USER);

usersRouter.post("/refresh", validation(tokenSchema), REFRESH_TOKEN);
