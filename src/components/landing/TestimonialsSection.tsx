import React from "react";
import { motion } from "motion/react";
import { Quote, Star } from "lucide-react";

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      quote:
        "AssetFlow Bank has completely transformed how we handle hardware across our 45 branches. The QR-based identification alone saved us dozens of hours during our last internal audit.",
      author: "Robert Chen",
      role: "Head of IT Operations",
      bank: "Metropolitan Federal Bank",
    },
    {
      quote:
        "The ability to assign assets directly to departments and see the full lifecycle history has cleared up years of accountability gaps. It's the most professional asset tool I've used.",
      author: "Sarah Jenkins",
      role: "Internal Audit Lead",
      bank: "Global Trust Finance",
    },
    {
      quote:
        "Before AssetFlow, we struggled with 'ghost assets' that were still on the books but nowhere to be found. Now, we have 100% visibility into every terminal and scanner in the branch.",
      author: "Mark Thompson",
      role: "Branch Technology Manager",
      bank: "Commonwealth Union",
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Trusted by <span className="text-cyan-600">Banking Leaders</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            See how financial institutions are achieving operational resilience
            with our unified asset governance platform.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow"
            >
              <div>
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-cyan-500 text-cyan-500"
                    />
                  ))}
                </div>
                <Quote className="w-10 h-10 text-cyan-500/20 mb-4" />
                <p className="text-slate-700 leading-relaxed italic mb-8">
                  "{t.quote}"
                </p>
              </div>
              <div className="flex items-center gap-4 border-t border-slate-200 pt-6">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 leading-tight">
                    {t.author}
                  </h4>
                  <p className="text-xs text-slate-500">{t.role}</p>
                  <p className="text-[10px] uppercase font-bold text-cyan-600 tracking-wider mt-0.5">
                    {t.bank}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
