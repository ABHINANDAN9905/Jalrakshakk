import { verifyAccessToken } from '../utils/token.utils.js';

/**
 * Authentication Middleware
 * Extracts and verifies JWT from Bearer header or HTTP-only cookie
 */
export const authenticate = (req, res, next) => {
  let token = null;

  // 1. Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1].trim();
  }

  // 2. Check HTTP-only cookie fallback
  if (!token && req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Authentication required. No access token provided.'
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { id, email, role }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Access token expired. Please refresh your session.',
        isExpired: true
      });
    }

    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Invalid access token.'
    });
  }
};

export default authenticate;
