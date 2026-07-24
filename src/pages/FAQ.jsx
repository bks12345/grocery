import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How fast is delivery?",
    answer:
      "Orders placed before 6pm are delivered the same day in most serviceable areas. Express delivery (next day) is available at checkout for a small additional fee.",
  },
  {
    question: "Is there a minimum order value?",
    answer:
      "No minimum order value. Orders over $700 qualify for free standard delivery — smaller orders have a flat $49 delivery fee.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Cash on Delivery is available now. Card and UPI/wallet payments are coming soon — you'll see the option at checkout once they're live.",
  },
  {
    question: "How do bulk/family packs work?",
    answer:
      "Bulk packs are larger quantities (like a 10kg rice bag or 5L cooking oil can) priced lower per kg than smaller packs — built for families who buy staples regularly and want to shop less often.",
  },
  {
    question: "Can I return a product?",
    answer:
      "Yes — most products can be returned within 7 days if unopened and in original condition. Perishables (fresh produce, dairy) are covered by our freshness guarantee instead; see our Return & Refund Policy for details.",
  },
  {
    question: "How do I track my order?",
    answer:
      "Log in and go to My Account → Order History to see the status of any order, from confirmed through delivered.",
  },
  {
    question: "Do you offer support if something arrives damaged?",
    answer:
      "Absolutely — contact us within 48 hours of delivery with a photo of the item, and we'll arrange a replacement or refund.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Frequently Asked Questions
        </h1>
        <p className="text-ink-soft mt-2">
          Can't find what you're looking for?{" "}
          <a href="/contact" className="text-basil-600 hover:text-basil-700 font-medium">
            Contact us
          </a>
          .
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-10">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={faq.question} className="card-elevated rounded-2xl overflow-hidden">
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
                <p className="px-5 pb-5 text-sm text-ink-soft leading-relaxed">{faq.answer}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
