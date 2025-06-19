import { pgClient } from "../../server.js";
import { v4 as uuidv4 } from "uuid";

export const INSERT_TICKET = async (req, res) => {
  try {
    const response = await pgClient.query({
      text: `INSERT INTO tickets (
        id, title, ticket_price, from_location, to_location, to_location_photo_url) 
        VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
      values: [
        uuidv4(),
        req.body.title,
        req.body.ticket_price,
        req.body.from_location,
        req.body.to_location,
        req.body.to_location_photo_url,
      ],
    });

    const ticket = response.rows[0];

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
    let response = await pgClient.query({
      text: `SELECT money_balance FROM users WHERE id = $1`,
      values: [req.body.userId],
    });

    const userBalance = response.rows[0].money_balance;

    const ticketId = req.params.id;
    response = await pgClient.query({
      text: `SELECT * FROM tickets WHERE id = $1`,
      values: [ticketId],
    });
    const ticket = response.rows[0];

    if (!ticket)
      return res
        .status(404)
        .json({ message: "Ticket with such id not found." });

    console.log(userBalance);
    console.log(ticket.ticket_price);

    if (userBalance < ticket.ticket_price)
      return res
        .status(400)
        .json({ message: "User does not have enough money for ticket" });

    response = await pgClient.query({
      text: `UPDATE users SET money_balance = money_balance - $1, bought_tickets = array_append(bought_tickets, $2) WHERE id = $3`,
      values: [ticket.ticket_price, ticket.id, req.body.userId],
    });

    return res.status(200).json({ message: "Ticket successfully bought" });
  } catch (error) {
    res.status(500).json({ message: "There are issues", error: error });
  }
};
