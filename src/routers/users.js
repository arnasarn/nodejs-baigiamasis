import express from "express";
import { GET_ALL_USERS, SIGNUP_USER } from "../controllers/users.js";

export const usersRouter = express.Router();

usersRouter.get("/", GET_ALL_USERS);

usersRouter.post("/signUp", SIGNUP_USER);
