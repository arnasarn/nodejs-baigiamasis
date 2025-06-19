import { v4 as uuidv4 } from "uuid";
import TicketModel from "../models/tickets.js";
import UserModel from "../models/users.js";

export const INSERT_TICKET = async (req, res) => {
  try {
    const data = {
      ...req.body,
      id: uuidv4(),
    };

    const response = new TicketModel(data);
    const ticket = await response.save();

    res.status(201).json({
      message: "Ticket inserted.",
      ticket: ticket,
    });
  } catch (error) {
    res.status(500).json({ message: "There are issues", error: error });
  }
};

export const BUY_TICKET = async (req, res) => {
  try {
    const user = await UserModel.findOne({ id: req.body.userId });
    const userBalance = user.money_balance;

    const ticketId = req.params.id;

    const ticket = await TicketModel.findOne({ id: ticketId });

    if (!ticket)
      return res
        .status(404)
        .json({ message: "Ticket with such id not found." });

    if (userBalance < ticket.ticket_price)
      return res
        .status(400)
        .json({ message: "User does not have enough money for ticket" });

    const updatedUser = await UserModel.findOneAndUpdate(
      { id: req.body.userId },
      {
        $push: { bought_tickets: ticketId },
        $inc: { money_balance: ticket.ticket_price * -1 },
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Ticket successfully bought", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "There are issues", error: error });
  }
};
