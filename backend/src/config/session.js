import session from 'express-session';
import { SESSION_SECRET, SESSION_MAX_AGE, NODE_ENV } from './env.js';

/**
 * Institutional Server-Side Session Configuration
 * Employs HttpOnly and SameSite cookie flags to defend against XSS and CSRF attacks.
 */
const sessionMiddleware = session({
  name: 'iiitbh_session',
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE
  }
});

export { sessionMiddleware };
export default sessionMiddleware;
