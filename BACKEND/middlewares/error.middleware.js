
function notFound(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || 500;

  res.status(status).json({
    message: status === 500
      ? "Internal server error"
      : err.message,
  });
}

export default { notFound, errorHandler };