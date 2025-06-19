import express from "express";
import cors from "cors";
import "dotenv/config";
import { usersRouter } from "./src/routers/users.js";
import pg from "pg";
import { ticketsRouter } from "./src/routers/tickets.js";
const { Client } = pg;

const app = express();

export const pgClient = new Client({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
});

pgClient.connect((err) => {
  if (err) {
    console.log("Issues connecting to db: ", err);
    return;
  }
  console.log("Connected to DB");
});

await pgClient.query(`CREATE TABLE IF NOT EXISTS users(
  id varchar(255) NOT NULL UNIQUE, 
  name varchar(255) NOT NULL, 
  email varchar(255) NOT NULL UNIQUE,
  password varchar(255) NOT NULL, 
  bought_tickets varchar(255)[], 
  money_balance int);
  `);

await pgClient.query(`CREATE TABLE IF NOT EXISTS tickets(
  id varchar(255) NOT NULL UNIQUE, 
  title varchar(255) NOT NULL, 
  ticket_price int NOT NULL,
  from_location varchar(255) NOT NULL, 
  to_location varchar(255) NOT NULL, 
  to_location_photo_url text NOT NULL);
  `);

app.use(express.json());
app.use(cors());

app.use("/users", usersRouter);
app.use("/tickets", ticketsRouter);

app.listen(process.env.PORT, () => {
  console.log(`App running on port ${process.env.PORT}`);
});
