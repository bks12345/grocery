import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Leaf, Truck, Users, Heart, ArrowRight, Sparkles, Star, ShieldCheck } from "lucide-react";
import { getContent, DEFAULT_CONTENT } from "../services/contentService";

const iconMap = {
  Leaf,
  Truck,
  Users,
  Heart,
  Sparkles,
  Star,
  ShieldCheck,
};

export default function About() {
  const [content, setContent] = useState(DEFAULT_CONTENT.about);

  useEffect(() => {
    let cancelled = false;
    getContent("about").then((res) => {
      if (!cancelled && res) {
        setContent((prev) => ({ ...prev, ...res }));
      }
    });

    const handleContentUpdate = (e) => {
      if (e.detail?.key === "about" && e.detail.data) {
        setContent((prev) => ({ ...prev, ...e.detail.data }));
      }
    };

    window.addEventListener("daalbhat:content-updated", handleContentUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("daalbhat:content-updated", handleContentUpdate);
    };
  }, []);

  const values = content.values || DEFAULT_CONTENT.about.values;

  return (
    <div>
      <section className="bg-basil-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <span className="market-tag inline-flex bg-mango-400 text-basil-900 text-xs font-semibold px-3 py-1.5 rounded-full">
            {content.eyebrow || "Our story"}
          </span>
          <h1 className="mt-5 font-display text-3xl sm:text-4xl font-semibold text-basil-900">
            {content.title || "Groceries that feel like they came from your own backyard."}
          </h1>
          <p className="mt-4 text-ink-soft text-base sm:text-lg max-w-2xl mx-auto whitespace-pre-line">
            {content.story || "DaalBhat started with a simple frustration: fresh groceries shouldn't require choosing between quality, price, and convenience."}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((val, idx) => {
            const Icon = iconMap[val.icon] || Heart;
            return (
              <div key={val.title || idx} className="card-elevated rounded-3xl p-6">
                <div className="w-11 h-11 rounded-full bg-basil-50 flex items-center justify-center">
                  <Icon size={20} className="text-basil-600" />
                </div>
                <h3 className="font-display text-lg font-semibold text-ink mt-4">{val.title}</h3>
                <p className="text-sm text-ink-soft mt-2 leading-relaxed">{val.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-gradient-to-br from-basil-900 via-basil-900 to-basil-700 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-mango-400/10 blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-cream">
            {content.ctaTitle || "Ready to see the difference?"}
          </h2>
          <p className="text-cream/70 mt-3">
            {content.ctaSubtitle || "Browse fresh produce, pantry staples, and family bulk packs — delivered today."}
          </p>
          <Link
            to={content.ctaButtonLink || "/shop"}
            className="inline-flex items-center gap-2 mt-6 bg-mango-400 text-basil-900 px-6 py-3 rounded-full font-medium hover:bg-mango-500 hover:shadow-glow transition-all"
          >
            {content.ctaButtonText || "Start Shopping"} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

