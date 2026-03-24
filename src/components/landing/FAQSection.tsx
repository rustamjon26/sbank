import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: "Is this suitable for multi-branch banks?",
      answer:
        "Yes, AssetFlow Bank is built with a hierarchical architecture specifically for institutions with dozens or hundreds of branches, allowing both regional and centralized visibility.",
    },
    {
      question: "Can assets be assigned to both departments and branches?",
      answer:
        "Absolutely. Our flexible ownership model allows you to bind hardware to a physical branch, a specific department within that branch, or an individual employee.",
    },
    {
      question: "Does it support QR-based identification?",
      answer:
        "Yes, the platform automatically generates unique QR codes for every asset, which can be scanned by any smartphone to instantly show ownership and audit details.",
    },
    {
      question: "Is there a full audit history for all actions?",
      answer:
        "Every status change, assignment, and scan is recorded in an immutable ledger, providing a complete 100% auditable history for compliance reviews.",
    },
    {
      question: "Can the platform highlight aging or risky assets?",
      answer:
        "Our AI engine automatically flags assets based on their age, repair frequency, and hardware type, surfacing them in a dedicated 'Risk Registry' for proactive management.",
    },
    {
      question: "Can the platform be adapted to our internal workflows?",
      answer:
        "Yes, we offer business rule validation that can be configured to match your specific asset lifecycle and approval processes.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Frequently Asked <span className="text-cyan-600">Questions</span>
          </h2>
          <p className="text-lg text-slate-600">
            Everything you need to know about implementing AssetFlow at your
            institution.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
            >
              <button
                className="w-full text-left p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
              >
                <span className="font-bold text-slate-900">{faq.question}</span>
                {activeIndex === idx ? (
                  <ChevronUp className="w-5 h-5 text-cyan-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
              <AnimatePresence>
                {activeIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-50">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
