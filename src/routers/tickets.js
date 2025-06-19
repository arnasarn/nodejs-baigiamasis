import express from "express";
import { auth } from "../middlewares/auth.js";
import { validation } from "../middlewares/validation.js";
import { ticketsSchema } from "../schemas/tickets.js";
import { INSERT_TICKET } from "../controllers/tickets.js";

export const ticketsRouter = express.Router();

ticketsRouter.post("/", validation(ticketsSchema), auth, INSERT_TICKET);
