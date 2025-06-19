export const validation = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate({ ...req.body });
    if (error)
      return res.status(400).json({
        message: "You have provided invalid credentials.",
        error: error,
      });

    next();
  };
};
