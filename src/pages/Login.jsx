import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
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

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink-soft">Password</span>
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50" />
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
            disabled={submitting}
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
          <Link to="/register" className="font-medium text-basil-600 hover:text-basil-700">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
