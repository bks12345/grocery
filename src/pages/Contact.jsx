import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Loader2, CheckCircle2 } from "lucide-react";

const contactDetails = [
  { icon: Phone, label: "Phone", value: "+91 98765 43210" },
  { icon: Mail, label: "Email", value: "support@daalbhat.com" },
  { icon: MapPin, label: "Store Address", value: "123 Market Street, Sydney" },
  { icon: Clock, label: "Support Hours", value: "Mon–Sat, 9am – 8pm" },
];

const initialForm = { name: "", email: "", subject: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // No backend yet — simulate a send. Swap for a real apiPost once one exists.
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setSent(true);
    setForm(initialForm);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">Get in Touch</h1>
        <p className="text-ink-soft mt-2 text-sm sm:text-base">
          Questions about an order, a product, or anything else — we're happy to help.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-6 sm:gap-8 mt-8 sm:mt-10">
        {/* Contact info */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {contactDetails.map(({ icon: Icon, label, value }) => (
            <div key={label} className="card-elevated rounded-2xl p-4 sm:p-5 flex items-center gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-basil-50 flex items-center justify-center">
                <Icon size={17} className="text-basil-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-ink-soft/60">{label}</p>
                <p className="text-sm font-medium text-ink break-words">{value}</p>
              </div>
            </div>
          ))}

          {/* Map placeholder — swap for a real embed once you have a Maps API key */}
          <div className="card-elevated rounded-2xl overflow-hidden h-48 bg-basil-50">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d424141.6978944982!2d150.93197474999997!3d-33.84824395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b129838f39a743f%3A0x3017d681632a850!2sSydney%20NSW%2C%20Australia!5e0!3m2!1sen!2snp!4v1784896782864!5m2!1sen!2snp"
              className="block w-full h-full border-0"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Store location map"
            ></iframe>
          </div>
        </div>

        {/* Contact form */}
        <div className="md:col-span-3">
          <div className="card-elevated rounded-3xl p-5 sm:p-8">
            {sent ? (
              <div className="text-center py-10">
                <CheckCircle2 size={36} className="mx-auto text-basil-600" />
                <h2 className="font-display text-xl font-semibold text-ink mt-4">
                  Message sent!
                </h2>
                <p className="text-ink-soft mt-2">
                  Thanks for reaching out — we'll get back to you within a day.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-5 text-sm font-medium text-basil-600 hover:text-basil-700"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="Your name"
                    value={form.name}
                    onChange={handleChange("name")}
                    required
                  />
                  <Field
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    required
                  />
                </div>
                <Field
                  label="Subject"
                  value={form.subject}
                  onChange={handleChange("subject")}
                  required
                />
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-ink-soft">Message</span>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange("message")}
                    className="px-4 py-3 rounded-2xl bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink resize-none"
                  />
                </label>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 bg-basil-600 text-white py-3 rounded-full font-medium hover:bg-basil-700 hover:shadow-glow transition-all disabled:opacity-60 w-full sm:w-auto sm:self-start px-8"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...inputProps }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink-soft">{label}</span>
      <input
        {...inputProps}
        className="px-4 py-2.5 rounded-full bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink"
      />
    </label>
  );
}
