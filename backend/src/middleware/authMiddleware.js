import AppError from '../utils/AppError.js';

/**
 * requireAdmin Guard Middleware
 * Institutional Authentication Guard: Validates server-side session before granting
 * access to faculty administrative operations.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.adminId) {
    return next(
      new AppError('Unauthorized: Faculty authentication required.', 401)
    );
  }
  next();
};

export default requireAdmin;
