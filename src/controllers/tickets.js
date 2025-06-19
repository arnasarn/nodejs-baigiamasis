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
