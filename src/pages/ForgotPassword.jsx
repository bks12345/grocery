import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, KeyRound, ArrowLeft, Lock, Hash } from "lucide-react";
import * as authService from "../services/authService";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await authService.requestPasswordReset(email);
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to request password reset.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await authService.resetPassword(email, otp, newPassword);
      setStep(3);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please check your OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card-elevated rounded-3xl p-8">
        <div className="w-12 h-12 rounded-full bg-basil-50 flex items-center justify-center">
          <KeyRound size={20} className="text-basil-600" />
        </div>

        {step === 3 ? (
          <>
            <h1 className="font-display text-2xl font-semibold text-ink mt-4">
              Password Reset Successfully
            </h1>
            <p className="text-ink-soft text-sm mt-2 leading-relaxed">
              Your password has been changed. You can now log in with your new password.
            </p>
            <Link
              to="/login"
              className="mt-6 flex items-center justify-center gap-2 bg-basil-600 text-white py-3 rounded-full font-medium hover:bg-basil-700 hover:shadow-glow transition-all"
            >
              Go to Login
            </Link>
          </>
        ) : step === 2 ? (
          <>
            <h1 className="font-display text-2xl font-semibold text-ink mt-4">
              Enter OTP
            </h1>
            <p className="text-ink-soft text-sm mt-1">
              We've sent a 6-digit code to <span className="text-ink font-medium">{email}</span>
            </p>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="flex flex-col gap-4 mt-6">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-ink-soft">OTP Code</span>
                <div className="relative">
                  <Hash size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink tracking-widest font-mono"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-ink-soft">New Password</span>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 bg-basil-600 text-white py-3 rounded-full font-medium hover:bg-basil-700 hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {submitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" /> Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold text-ink mt-4">
              Reset your password
            </h1>
            <p className="text-ink-soft text-sm mt-1">
              Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleRequestOtp} className="flex flex-col gap-4 mt-6">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-ink-soft">Email</span>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 bg-basil-600 text-white py-3 rounded-full font-medium hover:bg-basil-700 hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {submitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" /> Sending...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          </>
        )}

        {step !== 3 && (
          <Link
            to="/login"
            className="flex items-center gap-1.5 justify-center text-sm font-medium text-basil-600 hover:text-basil-700 mt-6"
          >
            <ArrowLeft size={14} /> Back to login
          </Link>
        )}
      </div>
    </div>
  );
}
