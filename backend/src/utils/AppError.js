/**
 * AppError - Operational Error Class
 * Standardized institutional application error handling.
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {number} statusCode - HTTP status code (e.g. 400, 401, 404, 500)
   * @param {Array|string} errors - Detailed list of validation or field-level errors
   */
  constructor(message, statusCode = 500, errors = []) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = Array.isArray(errors) ? errors : (errors ? [errors] : []);

    Error.captureStackTrace(this, this.constructor);
  }
}

export { AppError };
export default AppError;
