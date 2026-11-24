/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces role restrictions based on the authenticated JWT payload
 * @param  {...string} allowedRoles Allowed roles (e.g. 'STUDENT', 'TEACHER', 'ADMIN')
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Authentication required before checking permissions.'
      });
    }

    const userRole = req.user.role.toUpperCase();
    const authorized = allowedRoles.map((r) => r.toUpperCase()).includes(userRole);

    if (!authorized) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: `Forbidden: Access denied. Required role: [${allowedRoles.join(', ')}], your role: [${userRole}].`
      });
    }

    next();
  };
};

export default authorize;
