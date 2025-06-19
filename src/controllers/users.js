import UserModel from "../models/users.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const GET_ALL_USERS = async (req, res) => {
  try {
    const users = await UserModel.find()
      .sort({ name: -1 })
      .select(`-__v -_id -password`);
    return res
      .status(200)
      .json({ message: "Here are all the users.", users: users });
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

    const data = {
      ...req.body,
      id: uuidv4(),
      password: hash,
      bought_tickets: req.body.bought_tickets ?? [],
      money_balance: req.body.money_balance ?? 0,
    };

    const response = new UserModel(data);
    const user = await response.save();

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
      user: user,
      token: token,
      refresh_token: refresh_token,
    });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ message: "Email already exists." });

    return res.status(500).json({
      message: "There are issues.",
      error: error,
    });
  }
};

export const LOGIN_USER = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

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
    const user = await UserModel.findOne({ id: id }).select(
      `-__v -_id -password`
    );

    if (!user) return res.status(404).json({ message: "No such user found." });

    return res.status(200).json({ message: "Here is your user", user: user });
  } catch (error) {
    return res.status(500).json({
      message: "There are issues.",
      error: error,
    });
  }
};

export const GET_USERS_AGGREGATED_TICKETS = async (req, res) => {
  try {
    const users = await UserModel.aggregate([
      {
        $lookup: {
          from: "tickets",
          localField: "bought_tickets",
          foreignField: "id",
          as: "tickets",
        },
      },
      {
        $project: {
          password: 0,
          _id: 0,
          __v: 0,
        },
      },
    ]);

    return res
      .status(200)
      .json({ message: "Here are your aggregated users.", users: users });
  } catch (error) {
    return res.status(500).json({
      message: "There are issues.",
      error: error,
    });
  }
};

export const GET_USERS_AGGREGATED_TICKETS_BY_ID = async (req, res) => {
  try {
    const id = req.params.id;

    const users = await UserModel.aggregate([
      {
        $match: { id: id },
      },
      {
        $lookup: {
          from: "tickets",
          localField: "bought_tickets",
          foreignField: "id",
          as: "tickets",
        },
      },
      {
        $project: {
          password: 0,
          _id: 0,
          __v: 0,
        },
      },
    ]);

    return res
      .status(200)
      .json({ message: "Here are your aggregated users.", users: users });
  } catch (error) {
    return res.status(500).json({
      message: "There are issues.",
      error: error,
    });
  }
};
