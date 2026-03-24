import React from "react";
import { motion } from "motion/react";
import { PlusCircle, UserCheck, ShieldCheck, PieChart } from "lucide-react";

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: PlusCircle,
      title: "Register Assets",
      description:
        "Quickly enter asset details, serial numbers, and photos. Our system generates unique identifiers for every piece of hardware.",
    },
    {
      icon: UserCheck,
      title: "Assign Responsibility",
      description:
        "Bind assets to specific employees, branches, or departments. Establish clear accountability from day one.",
    },
    {
      icon: ShieldCheck,
      title: "Monitor & Scan",
      description:
        "Use QR codes for instant physical verification. Track status changes through an immutable audit trail.",
    },
    {
      icon: PieChart,
      title: "Analyze & Audit",
      description:
        "Generate deep reports on branch performance, aging assets, and compliance readiness through automated insights.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white relative">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 font-serif">
            Streamlined Asset <span className="text-cyan-600">Governance</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Our 4-step workflow is designed to fit seamlessly into bank
            operations, ensuring no asset is left unmanaged.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 hidden lg:block"></div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 mb-6 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-500 transition-all duration-300 shadow-sm shadow-slate-200">
                    <step.icon className="w-8 h-8" />
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 text-xs font-bold border border-cyan-200">
                      {idx + 1}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed px-4">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
