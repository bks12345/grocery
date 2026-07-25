import { useState } from "react";
import {
  User,
  MapPin,
  ClipboardList,
  ShoppingBasket,
  Plus,
  Trash2,
  Phone,
  Mail,
  MessageCircle,
  Truck,
  Headphones,
  Heart,
  ShieldCheck,
  Smile,
  Info,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const initialCustomer = { fullName: "", phone: "", email: "" };
const initialAddress = { fullAddress: "", province: "", district: "", city: "" };
const emptyProductRow = () => ({
  id: crypto.randomUUID(),
  name: "",
  quantity: "",
});

const whyOrderWithUs = [
  { icon: ShieldCheck, label: "Genuine, quality products" },
  { icon: Truck, label: "Fast & reliable delivery" },
  { icon: Headphones, label: "Friendly customer support" },
  { icon: Heart, label: "Support for local business" },
];

export default function OrderFromNepal() {
  const [customer, setCustomer] = useState(initialCustomer);
  const [address, setAddress] = useState(initialAddress);
  const [products, setProducts] = useState([emptyProductRow()]);
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateCustomer = (field) => (e) =>
    setCustomer((prev) => ({ ...prev, [field]: e.target.value }));

  const updateAddress = (field) => (e) =>
    setAddress((prev) => ({ ...prev, [field]: e.target.value }));

  const updateProduct = (id, field) => (e) =>
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: e.target.value } : p))
    );

  const addProductRow = () =>
    setProducts((prev) => [...prev, emptyProductRow()]);

  const removeProductRow = (id) =>
    setProducts((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // No backend yet — simulate a send. Swap for a real apiPost once one exists.
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setSubmitted(true);
  };

  const resetForm = () => {
    setCustomer(initialCustomer);
    setAddress(initialAddress);
    setProducts([emptyProductRow()]);
    setNotes("");
    setConfirmed(false);
    setSubmitted(false);
  };

  const filledProducts = products.filter((p) => p.name.trim());

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <span className="text-2xl sm:text-3xl md:text-4xl">🇳🇵</span>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-ink">
            Order from Nepal
          </h1>
        </div>
        <p className="text-ink-soft mt-3">
          Can't find it in our catalogue? Tell us what you need and we'll source it
          for you — we'll be in touch shortly. <Heart size={14} className="inline text-tomato-500 -mt-0.5" fill="currentColor" />
        </p>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 mt-6 py-4 border-y border-basil-100 text-sm text-ink-soft">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-basil-600" /> 100% Genuine Products
        </span>
        <span className="flex items-center gap-1.5">
          <ShoppingBasket size={16} className="text-basil-600" /> Support Local Business
        </span>
        <span className="flex items-center gap-1.5">
          <Smile size={16} className="text-basil-600" /> We deliver happiness
        </span>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 mt-10">
        {/* Form */}
        <div className="lg:col-span-3">
          <div className="card-elevated rounded-3xl p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-10">
                <CheckCircle2 size={40} className="mx-auto text-basil-600" />
                <h2 className="font-display text-2xl font-semibold text-ink mt-4">
                  Order request received!
                </h2>
                <p className="text-ink-soft mt-2 max-w-sm mx-auto">
                  Thanks, {customer.fullName.split(" ")[0] || "there"} — our team
                  will call or message you shortly on {customer.phone} to confirm
                  your order.
                </p>
                <button
                  onClick={resetForm}
                  className="mt-5 text-sm font-medium text-basil-600 hover:text-basil-700"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {/* 1. Customer Information */}
                <section className="flex flex-col gap-4">
                  <SectionHeading icon={User} step="1" title="Your Information" />
                  <Field
                    label="Full Name"
                    required
                    placeholder="Enter your full name"
                    value={customer.fullName}
                    onChange={updateCustomer("fullName")}
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field
                      label="Phone Number"
                      required
                      placeholder="98XXXXXXXX"
                      value={customer.phone}
                      onChange={updateCustomer("phone")}
                    />
                    <Field
                      label="Email Address"
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={customer.email}
                      onChange={updateCustomer("email")}
                    />
                  </div>
                </section>

                {/* 2. Delivery Address */}
                <section className="flex flex-col gap-4">
                  <SectionHeading icon={MapPin} step="2" title="Delivery Address" />
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium text-ink-soft">
                      Complete Delivery Address <span className="text-tomato-500">*</span>
                    </span>
                    <textarea
                      required
                      rows={2}
                      placeholder="Enter your full delivery address"
                      value={address.fullAddress}
                      onChange={updateAddress("fullAddress")}
                      className="px-4 py-3 rounded-2xl bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink resize-none"
                    />
                  </label>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Field
                      label="Province"
                      required
                      placeholder="Enter your province"
                      value={address.province}
                      onChange={updateAddress("province")}
                    />
                    <Field
                      label="District"
                      required
                      placeholder="Enter your district"
                      value={address.district}
                      onChange={updateAddress("district")}
                    />
                    <Field
                      label="City"
                      required
                      placeholder="Enter your city"
                      value={address.city}
                      onChange={updateAddress("city")}
                    />
                  </div>
                </section>

                {/* 3. Product Information */}
                <section className="flex flex-col gap-4">
                  <SectionHeading icon={ShoppingBasket} step="3" title="Product Information" />
                  <p className="text-sm text-ink-soft -mt-2">
                    List each product you'd like us to source, with the quantity you need.
                  </p>

                  <div className="flex flex-col gap-4 sm:gap-3">
                    {products.map((product, index) => (
                      <div
                        key={product.id}
                        className="flex flex-col gap-3 sm:grid sm:grid-cols-[1fr_9rem_2.75rem] sm:gap-3 sm:items-end"
                      >
                        <Field
                          label={index === 0 ? "Product Name" : `Product Name #${index + 1}`}
                          required
                          placeholder="E.g. Basmati Rice, Cooking Oil, Sugar"
                          value={product.name}
                          onChange={updateProduct(product.id, "name")}
                        />
                        <div className="flex gap-3 items-end sm:contents">
                          <Field
                            label="Quantity"
                            required
                            placeholder="E.g. 10kg, 2L"
                            value={product.quantity}
                            onChange={updateProduct(product.id, "quantity")}
                            wrapperClassName="flex-1 sm:flex-auto"
                          />
                          <button
                            type="button"
                            onClick={() => removeProductRow(product.id)}
                            disabled={products.length === 1}
                            aria-label="Remove product"
                            className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full text-ink-soft/50 hover:text-tomato-500 hover:bg-tomato-100 transition-colors disabled:opacity-0 disabled:pointer-events-none"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addProductRow}
                    className="self-start flex items-center gap-1.5 text-sm font-medium text-basil-600 border border-basil-200 hover:border-basil-600 hover:bg-basil-50 transition-colors rounded-full px-4 py-2"
                  >
                    <Plus size={15} /> Add Another Product
                  </button>
                </section>

                {/* 4. Additional Information */}
                <section className="flex flex-col gap-4">
                  <SectionHeading icon={ClipboardList} step="4" title="Additional Information" />
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium text-ink-soft">
                      Additional Notes or Special Instructions (Optional)
                    </span>
                    <textarea
                      rows={3}
                      placeholder="Write any special requests, notes or instructions here..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="px-4 py-3 rounded-2xl bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink resize-none"
                    />
                  </label>
                </section>

                {/* 5. Confirmation */}
                <section className="flex flex-col gap-4 pt-2 border-t border-basil-100">
                  <label className="flex items-start gap-2.5 text-sm text-ink-soft cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded accent-basil-600"
                    />
                    I confirm that the above information is correct.
                  </label>

                  <button
                    type="submit"
                    disabled={submitting || !confirmed}
                    className="flex items-center justify-center gap-2 bg-basil-600 text-white py-3.5 rounded-full font-medium hover:bg-basil-700 hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    Submit Order
                  </button>
                  <p className="text-xs text-ink-soft/70 text-center -mt-2">
                    Your information is safe with us. We respect your privacy.
                  </p>
                </section>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Order summary */}
          <div className="card-elevated rounded-3xl p-6 bg-basil-50/60">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <ClipboardList size={18} className="text-basil-600" /> Order Summary
            </h3>
            {filledProducts.length > 0 ? (
              <ul className="mt-4 flex flex-col gap-2.5">
                {filledProducts.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 text-sm bg-white rounded-xl px-3.5 py-2.5 shadow-soft"
                  >
                    <span className="min-w-0 text-ink font-medium truncate">{p.name}</span>
                    {p.quantity && (
                      <span className="shrink-0 text-ink-soft">{p.quantity}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <ShoppingBasket size={40} className="mx-auto text-basil-300" />
                <p className="text-sm text-ink-soft mt-3">
                  Products you list below will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Why order with us */}
          <div className="card-elevated rounded-3xl p-6 bg-mango-100/50">
            <h3 className="font-display text-lg font-semibold text-ink">
              Why Order from Us?
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {whyOrderWithUs.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 text-sm text-ink-soft">
                  <Icon size={16} className="text-mango-600 shrink-0" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Need help */}
          <div className="card-elevated rounded-3xl p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <Headphones size={18} className="text-basil-600" /> Need Help?
            </h3>
            <p className="text-sm text-ink-soft mt-1">We are here for you!</p>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              <li className="flex items-center gap-2.5 text-ink-soft">
                <Phone size={15} className="text-basil-600 shrink-0" /> 98XXXXXXXX
              </li>
              <li className="flex items-center gap-2.5 text-ink-soft">
                <MessageCircle size={15} className="text-basil-600 shrink-0" /> 98XXXXXXXX (WhatsApp)
              </li>
              <li className="flex items-center gap-2.5 text-ink-soft">
                <Mail size={15} className="text-basil-600 shrink-0" /> support@yourstore.com
              </li>
            </ul>
          </div>

          {/* Note */}
          <div className="card-elevated rounded-3xl p-6 bg-tomato-100/40">
            <h3 className="flex items-center gap-2 font-display text-base font-semibold text-tomato-600">
              <Info size={17} /> Note
            </h3>
            <p className="text-sm text-ink-soft mt-2">
              After submitting your order, our team will contact you to confirm
              the order and provide further details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ icon: Icon, step, title }) {
  return (
    <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-basil-700">
      <Icon size={18} className="text-basil-600" />
      {step}. {title}
    </h2>
  );
}

function Field({ label, required, wrapperClassName = "", ...inputProps }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm min-w-0 ${wrapperClassName}`}>
      <span className="font-medium text-ink-soft">
        {label} {required && <span className="text-tomato-500">*</span>}
      </span>
      <input
        {...inputProps}
        required={required}
        className="w-full min-w-0 px-4 py-2.5 rounded-full bg-cream shadow-soft focus:shadow-soft-lg outline-none transition-shadow text-ink"
      />
    </label>
  );
}
