import { pgClient } from "../../server.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const GET_ALL_USERS = async (req, res) => {
  try {
    const response = await pgClient.query(
      `SELECT id, name, email, bought_tickets, money_balance FROM users ORDER BY name ASC`
    );
    return res
      .status(200)
      .json({ message: "Here are all the users.", users: response.rows });
  } catch (error) {
    return res.status(500).json({
      message: "There are issues.",
      error: error,
    });
  }
};

export const SIGNUP_USER = async (req, res) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    let name = req.body.name;
    if (name === name.toLowerCase()) {
      name = name[0].toUpperCase() + name.slice(1, name.length);
    }

    const response = await pgClient.query({
      text: `INSERT INTO users(id, name, email, password, bought_tickets, money_balance)
      VALUES($1, $2, $3, $4, $5, $6) RETURNING id, name, email, bought_tickets, money_balance`,
      values: [
        uuidv4(),
        name,
        req.body.email,
        hash,
        req.body.bought_tickets ?? [],
        req.body.money_balance ?? 0,
      ],
    });

    const user = response.rows[0];

    const token = jwt.sign(
      { email: user.email, password: hash, id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const refresh_token = jwt.sign(
      { email: user.email, password: hash, id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "User successfully registered.",
      user: response.rows[0],
      token: token,
      refresh_token: refresh_token,
    });
  } catch (error) {
    if (error.code === "23505")
      return res.status(400).json({ message: "Email already exists." });

    return res.status(500).json({
      message: "There are issues.",
      error: error,
    });
  }
};

export const LOGIN_USER = async (req, res) => {
  try {
    const response = await pgClient.query({
      text: `SELECT id, email, password FROM users WHERE email = $1`,
      values: [req.body.email],
    });

    const user = response.rows[0];

    if (!user)
      return res.status(404).json({ message: "No such email exists." });

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!isPasswordCorrect)
      return res.status(401).json({ message: "Password is incorrect" });

    const token = jwt.sign(
      { email: user.email, password: user.password, id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const refresh_token = jwt.sign(
      { email: user.email, password: user.password, id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Successfully logged in.",
      token: token,
      refresh_token: refresh_token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "There are issues.",
      error: error,
    });
  }
};

export const REFRESH_TOKEN = (req, res) => {
  try {
    const refresh_token = req.body.token;
    jwt.verify(refresh_token, process.env.JWT_SECRET, (error, decoded) => {
      if (error)
        return res
          .status(400)
          .json({ message: "Token expired, please log in again." });

      const token = jwt.sign(
        { email: decoded.email, password: decoded.password, id: decoded.id },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      return res.status(200).json({
        message: "Token refreshed.",
        token: token,
        refresh_token: refresh_token,
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "There are issues.",
      error: error,
    });
  }
};

export const GET_USER_BY_ID = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await pgClient.query({
      text: `SELECT * FROM users WHERE id = $1`,
      values: [id],
    });

    const user = response.rows[0];

    if (!user) return res.status(404).json({ message: "No such user found." });

    return res.status(200).json({ message: "Here is your user", user: user });
  } catch (error) {
    return res.status(500).json({
      message: "There are issues.",
      error: error,
    });
  }
};
