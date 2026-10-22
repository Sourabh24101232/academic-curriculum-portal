import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import AppError from '../utils/AppError.js';

/**
 * Faculty Admin Login Handler
 * Authenticates credentials against MySQL and initiates an encrypted server-side session.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide both email and password.', 400));
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!admin) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordCorrect) {
      return next(new AppError('Invalid email or password.', 401));
    }

    // Populate server session
    req.session.adminId = admin.id;
    req.session.adminEmail = admin.email;

    // Extend cookie lifetime to 30 days if rememberMe is selected
    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    }

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      admin: {
        id: admin.id,
        email: admin.email
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Faculty Admin Logout Handler
 * Destroys server-side session and clears client cookie.
 */
export const logout = (req, res, next) => {
  if (!req.session) {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  }

  req.session.destroy((err) => {
    if (err) {
      return next(new AppError('Could not log out, please try again.', 500));
    }

    res.clearCookie('iiitbh_session');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  });
};

/**
 * Session Status Verification Handler
 * Returns active authentication status to support frontend ProtectedRoute guard.
 */
export const getMe = (req, res) => {
  if (req.session && req.session.adminId) {
    return res.status(200).json({
      success: true,
      authenticated: true,
      admin: {
        id: req.session.adminId,
        email: req.session.adminEmail
      }
    });
  }

  res.status(200).json({
    success: true,
    authenticated: false,
    admin: null
  });
};

export default {
  login,
  logout,
  getMe
};
