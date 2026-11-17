import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Failed to sign in with Google.");
      }
      setGoogleLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card-elevated rounded-3xl p-8">
        <div className="w-12 h-12 rounded-full bg-basil-50 flex items-center justify-center">
          <LogIn size={20} className="text-basil-600" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink mt-4">
          Welcome back
        </h1>
        <p className="text-ink-soft text-sm mt-1">
          Log in to view your orders and saved items.
        </p>

        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || submitting}
          className="w-full mt-6 flex items-center justify-center gap-3 bg-white border border-basil-100 hover:bg-cream/70 text-ink font-medium py-2.5 px-4 rounded-full shadow-soft transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <Loader2 size={18} className="animate-spin text-basil-600" />
          ) : (
            <GoogleIcon />
          )}
          <span className="text-sm">Continue with Google</span>
        </button>

        <div className="relative my-6 flex items-center justify-center">
          <div className="w-full border-t border-basil-100"></div>
          <span className="absolute bg-white px-3 text-xs text-ink-soft/70 uppercase tracking-wider">
            or with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink-soft">Email</span>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50"
              />
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

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink-soft">Password</span>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50"
              />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink"
              />
            </div>
          </label>

          <Link
            to="/forgot-password"
            className="self-end text-xs font-medium text-basil-600 hover:text-basil-700 -mt-1"
          >
            Forgot password?
          </Link>

          {error && (
            <p className="text-sm text-tomato-500" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || googleLoading}
            className="flex items-center justify-center gap-2 bg-basil-600 text-white py-3 rounded-full font-medium hover:bg-basil-700 hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
          >
            {submitting ? (
              <>
                <Loader2 size={17} className="animate-spin" /> Logging in...
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-ink-soft mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-basil-600 hover:text-basil-700"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}
