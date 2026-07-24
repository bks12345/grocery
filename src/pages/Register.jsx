import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Loader2, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const initialForm = { name: "", email: "", phone: "", password: "", confirmPassword: "" };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      navigate("/account", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card-elevated rounded-3xl p-8">
        <div className="w-12 h-12 rounded-full bg-basil-50 flex items-center justify-center">
          <UserPlus size={20} className="text-basil-600" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink mt-4">
          Create your account
        </h1>
        <p className="text-ink-soft text-sm mt-1">
          Sign up to track orders and save your favorites.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
          <Field icon={User} label="Full name" type="text" autoComplete="name" required
            value={form.name} onChange={handleChange("name")} />
          <Field icon={Mail} label="Email" type="email" autoComplete="email" required
            value={form.email} onChange={handleChange("email")} />
          <Field icon={Phone} label="Phone number" type="tel" autoComplete="tel" required
            value={form.phone} onChange={handleChange("phone")} />
          <Field icon={Lock} label="Password" type="password" autoComplete="new-password" required
            value={form.password} onChange={handleChange("password")} />
          <Field icon={Lock} label="Confirm password" type="password" autoComplete="new-password" required
            value={form.confirmPassword} onChange={handleChange("confirmPassword")} />

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
                <Loader2 size={17} className="animate-spin" /> Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-ink-soft mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-basil-600 hover:text-basil-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, ...inputProps }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink-soft">{label}</span>
      <div className="relative">
        <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50" />
        <input
          {...inputProps}
          className="w-full pl-10 pr-4 py-2.5 rounded-full bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink"
        />
      </div>
    </label>
  );
}
