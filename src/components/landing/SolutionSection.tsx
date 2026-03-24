import React from "react";
import { motion } from "motion/react";
import {
  Server,
  Users,
  RefreshCcw,
  QrCode,
  ClipboardList,
  LineChart,
} from "lucide-react";

const SolutionSection: React.FC = () => {
  const features = [
    {
      icon: Server,
      title: "Centralized Ledger",
      description:
        "A single source of truth for all IT and office hardware across the entire institution.",
    },
    {
      icon: Users,
      title: "Ownership Tracking",
      description:
        "Precise assignment of assets to specific employees, departments, or geographical branches.",
    },
    {
      icon: RefreshCcw,
      title: "Lifecycle Control",
      description:
        "Monitor status transitions from 'Registered' to 'In Repair' to eventual 'Write-Off'.",
    },
    {
      icon: QrCode,
      title: "QR Instant Lookup",
      description:
        "Scan any physical asset with a mobile device to instantly reveal its ownership and audit history.",
    },
    {
      icon: ClipboardList,
      title: "Immutable Audit Trail",
      description:
        "Every reassignment and status change is securely logged, ensuring 100% compliance readiness.",
    },
    {
      icon: LineChart,
      title: "Smart Monitoring",
      description:
        "Analytics that automatically highlight aging equipment and anomalous repair frequencies.",
    },
  ];

  return (
    <section className="py-24 bg-slate-900 text-white relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold tracking-tight mb-6"
          >
            The Ultimate Infrastructure <br className="hidden md:block" /> for
            Physical Asset Governance
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-400"
          >
            AssetFlow Bank replaces spreadsheets with a real-time,
            compliant-ready platform built explicitly to handle the scale and
            security required by modern financial institutions.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm p-8 rounded-2xl hover:bg-slate-800/60 hover:border-cyan-500/30 transition-all group"
            >
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-cyan-400 mb-6 border border-slate-700 group-hover:bg-cyan-900/40 group-hover:border-cyan-800 transition-colors">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
