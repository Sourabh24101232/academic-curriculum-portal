import { NODE_ENV } from '../config/env.js';

/**
 * Centralized Error Handling Middleware for Express
 * Catches all operational and systemic errors, formatting them into standard institutional responses.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let status = err.status || 'error';
  let message = err.message || 'An unexpected internal server error occurred.';
  let errors = err.errors || [];

  // Handle Prisma ORM Database Errors
  if (err.code === 'P2002') {
    statusCode = 409;
    status = 'fail';
    const targets = err.meta?.target ? ` on (${err.meta.target})` : '';
    message = `A record with this unique identifier already exists${targets}.`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    status = 'fail';
    message = 'The requested academic record was not found.';
  }

  // Handle Multer File Upload Errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    status = 'fail';
    message = 'File size exceeds 10 MB limit. Please upload a smaller document.';
  }

  // Handle Invalid JSON Syntax in Request Body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    status = 'fail';
    message = 'Malformed JSON payload provided in request body.';
  }

  const responsePayload = {
    success: false,
    status,
    message,
    errors
  };

  // Provide stack trace in development mode only
  if (NODE_ENV === 'development') {
    responsePayload.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
};

export { errorHandler };
export default errorHandler;
