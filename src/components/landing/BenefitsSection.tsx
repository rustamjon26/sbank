import React from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Users,
  Search,
  Clock,
} from "lucide-react";

const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Reduced Asset Loss",
      description:
        "Minimize the financial impact of lost hardware through precise tracking and employee accountability.",
    },
    {
      icon: Users,
      title: "Better Accountability",
      description:
        "Establish a clear line of responsibility for every terminal, laptop, and scanner in the branch.",
    },
    {
      icon: Clock,
      title: "Faster Audit Cycles",
      description:
        "Reduce the time spent on manual inventory checks by up to 70% with QR-based digital verification.",
    },
    {
      icon: Search,
      title: "Operational Transparency",
      description:
        "Instant visibility into asset status and location across all branches from a single dashboard.",
    },
    {
      icon: CheckCircle2,
      title: "Lower Manual Effort",
      description:
        "Automate reporting and alerts, freeing up IT staff to focus on high-value technical initiatives.",
    },
    {
      icon: ShieldCheck,
      title: "Compliance Readiness",
      description:
        "Maintain a perfect audit trail that satisfies internal and external regulatory requirements.",
    },
  ];

  return (
    <section className="py-24 bg-slate-50 relative">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16 px-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 font-serif">
            Why Modern Banks Choose <br className="hidden md:block" />
            <span className="text-cyan-600">AssetFlow Bank</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Our platform goes beyond simple inventory management to provide a
            robust framework for institutional asset governance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600 mb-6 border border-cyan-100">
                <benefit.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
