const errorHandler = (err, req, res, next) => {
  // Default values
  const statusCode = err.statusCode || 500;

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: "ValidationError", messages });
  }

  // Mongoose bad ObjectId / cast error
  if (err.name === "CastError") {
    return res.status(400).json({ error: "InvalidId", message: "Invalid ID format" });
  }

  return res.status(statusCode).json({
    error: err.name || "ServerError",
    message: err.message || "An unexpected error occurred"
  });
};

module.exports = errorHandler;
