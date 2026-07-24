import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, KeyRound, ArrowLeft } from "lucide-react";
import * as authService from "../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await authService.requestPasswordReset(email);
    setSubmitting(false);
    setSent(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card-elevated rounded-3xl p-8">
        <div className="w-12 h-12 rounded-full bg-basil-50 flex items-center justify-center">
          <KeyRound size={20} className="text-basil-600" />
        </div>

        {sent ? (
          <>
            <h1 className="font-display text-2xl font-semibold text-ink mt-4">
              Check your email
            </h1>
            <p className="text-ink-soft text-sm mt-2 leading-relaxed">
              If an account exists for <span className="text-ink font-medium">{email}</span>,
              we've sent a link to reset your password.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold text-ink mt-4">
              Reset your password
            </h1>
            <p className="text-ink-soft text-sm mt-1">
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
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
                  "Send Reset Link"
                )}
              </button>
            </form>
          </>
        )}

        <Link
          to="/login"
          className="flex items-center gap-1.5 justify-center text-sm font-medium text-basil-600 hover:text-basil-700 mt-6"
        >
          <ArrowLeft size={14} /> Back to login
        </Link>
      </div>
    </div>
  );
}
