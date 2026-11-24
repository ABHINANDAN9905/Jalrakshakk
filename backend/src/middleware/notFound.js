/**
 * 404 Not Found Middleware
 * Intercepts unmapped routes and returns standardized JSON response
 */
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

export default notFound;
