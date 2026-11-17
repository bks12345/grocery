import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { getContent, DEFAULT_CONTENT } from "../services/contentService";

export default function FAQ() {
  const [content, setContent] = useState(DEFAULT_CONTENT.faq);
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getContent("faq").then((res) => {
      if (!cancelled && res) {
        setContent((prev) => ({ ...prev, ...res }));
      }
    });

    const handleContentUpdate = (e) => {
      if (e.detail?.key === "faq" && e.detail.data) {
        setContent((prev) => ({ ...prev, ...e.detail.data }));
      }
    };

    window.addEventListener("daalbhat:content-updated", handleContentUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("daalbhat:content-updated", handleContentUpdate);
    };
  }, []);

  const faqs = content.items || DEFAULT_CONTENT.faq.items;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">
          {content.title || "Frequently Asked Questions"}
        </h1>
        <p className="text-ink-soft mt-2">
          {content.subtitle || "Can't find what you're looking for?"}{" "}
          <Link to="/contact" className="text-basil-600 hover:text-basil-700 font-medium">
            {content.contactLinkText || "Contact us"}
          </Link>
          .
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-10">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={faq.question || i} className="card-elevated rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-medium text-ink">{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-ink-soft transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <p className="px-5 pb-5 text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

