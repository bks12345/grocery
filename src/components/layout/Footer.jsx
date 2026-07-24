import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaFacebookF, FaInstagram, FaXTwitter, FaYoutube } from "react-icons/fa6";

const socialLinks = [
  { label: "Facebook", icon: FaFacebookF, href: "https://facebook.com/daalbhat" },
  { label: "Instagram", icon: FaInstagram, href: "https://instagram.com/daalbhat" },
  { label: "Twitter / X", icon: FaXTwitter, href: "https://x.com/daalbhat" },
  { label: "YouTube", icon: FaYoutube, href: "https://youtube.com/@daalbhat" },
];

const footerLinks = {
  Shop: [
    { label: "All Products", to: "/shop" },
    { label: "Categories", to: "/categories" },
    { label: "Offers & Deals", to: "/offers" },
    { label: "Bulk Packs", to: "/shop?bulk=true" },
  ],
  Company: [
    { label: "About Us", to: "/about" },
    { label: "Contact Us", to: "/contact" },
    { label: "FAQ", to: "/faq" },
  ],
  Policies: [
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms & Conditions", to: "/terms" },
    { label: "Shipping Policy", to: "/shipping-policy" },
    { label: "Return & Refund Policy", to: "/return-policy" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-basil-900 text-cream/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand + newsletter */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-xl font-semibold text-cream">
                DaalBhat
              </span>
            </Link>
            <p className="text-sm text-cream/60 mt-3 max-w-xs">
              Fresh groceries and family bulk packs, delivered to your door.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-5 flex max-w-sm"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="Your email"
                className="w-full px-4 py-2 rounded-l-full text-ink text-sm outline-none newsletter"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-r-full bg-mango-400 text-basil-900 text-sm font-semibold hover:bg-mango-500 hover:shadow-glow transition-all"
              >
                Subscribe
              </button>
            </form>

            <div className="flex gap-2 mt-5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-cream/10 hover:bg-mango-400 hover:text-basil-900 transition-colors"
                >
                  <social.icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold text-cream mb-3">{heading}</h3>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-cream/60 hover:text-mango-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-cream/10 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-sm text-cream/50">
          <p>© {new Date().getFullYear()} DaalBhat. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-1.5">
              <Phone size={14} /> +91 98765 43210
            </span>
            <span className="flex items-center gap-1.5">
              <Mail size={14} /> support@daalbhat.com
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} /> 123 Market Street, Sydney
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
