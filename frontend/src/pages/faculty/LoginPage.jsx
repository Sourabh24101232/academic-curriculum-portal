import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { IIITBhagalpurSeal, AzadiMahotsavLogo } from '../../components/common/Header';

/**
 * Faculty LoginPage Component
 * Official institutional faculty login interface matching design specifications:
 * - Campus photo hero backdrop with dark gradient overlay (via LoginLayout)
 * - Centered institutional login card with circular seal & Azadi logo
 * - Email ID input with mail icon
 * - Password input with lock icon and visibility toggle
 * - Remember me checkbox
 * - Gold login button (#F59E0B)
 * - Red error banner for invalid credentials
 *
 * Strict Non-Negotiables:
 * - STRICTLY NO registration / sign-up page or link
 * - STRICTLY NO forgot-password workflow
 * - STRICTLY NO footer rendered
 */
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { isAuthenticated, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination: honour location.state.from or fallback to faculty dashboard
  const destination = location.state?.from?.pathname || '/faculty/courses';

  // If already authenticated, redirect to destination immediately
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, destination]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password, rememberMe);
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.message || 'Invalid email or password. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Centered Login Card */}
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 sm:p-8 text-institute-textDark">
        
        {/* Card Title & Subtitle */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#002855] tracking-tight">
            Faculty Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Access the curriculum management portal.
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div
            className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2.5 shadow-sm"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              <span className="font-semibold block mb-0.5">Authentication Failed</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email ID Field */}
          <div>
            <label
              htmlFor="faculty-email"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Email ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="faculty-email"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Enter your email id"
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f6ba38] focus:border-slate-400 transition-all text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Password Field with Eye Toggle */}
          <div>
            <label
              htmlFor="faculty-password"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="faculty-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Enter your password"
                className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f6ba38] focus:border-slate-400 transition-all text-slate-800 placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-800"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#f6ba38] focus:ring-[#f6ba38] cursor-pointer"
              />
              <span className="text-xs text-slate-600 font-medium">Remember me</span>
            </label>
          </div>

          {/* Gold Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-[#f6ba38] hover:bg-[#e5a823] active:bg-amber-600 text-slate-900 font-bold text-sm rounded-md shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>

        {/* Secondary Navigation (STRICTLY NO SIGNUP / NO FORGOT PASSWORD) */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-institute-navy font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Student Curriculum Portal</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
