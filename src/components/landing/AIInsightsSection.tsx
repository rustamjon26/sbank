import React from "react";
import { motion } from "motion/react";
import {
  BrainCircuit,
  Sparkles,
  TrendingDown,
  Target,
  Zap,
  BarChart3,
} from "lucide-react";

const AIInsightsSection: React.FC = () => {
  const insights = [
    {
      icon: TrendingDown,
      title: "Failure Risk Prediction",
      description:
        "AI analyzes repair history and hardware age to predict which assets are most likely to fail in the next quarter.",
      color: "blue",
    },
    {
      icon: Target,
      title: "Smart Audit Prioritization",
      description:
        "Automatically surface high-value or high-risk assets that haven't been scanned in 90+ days for immediate audit.",
      color: "cyan",
    },
    {
      icon: Zap,
      title: "Anomaly Detection",
      description:
        "Detect unusual asset patterns such as frequent reassignments or excessive repair requests for specific hardware models.",
      color: "indigo",
    },
    {
      icon: BarChart3,
      title: "Operational Forecasting",
      description:
        "Get data-driven recommendations for hardware procurement based on historical lifecycle data and branch needs.",
      color: "purple",
    },
  ];

  return (
    <section
      id="ai-insights"
      className="py-24 bg-[#020617] relative overflow-hidden"
    >
      {/* Futuristic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative p-1 rounded-3xl bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-transparent border border-blue-500/10 shadow-2xl"
            >
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-[22px] p-8 overflow-hidden min-h-[400px] flex flex-col justify-center">
                {/* Visual AI Brain abstraction */}
                <div className="absolute -right-20 -bottom-20 w-80 h-80 opacity-20 flex items-center justify-center">
                  <BrainCircuit className="w-full h-full text-cyan-400 animate-pulse" />
                </div>

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
                    <Sparkles className="w-3 h-3" />
                    Advanced Feature
                  </div>

                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                    Intelligence that <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                      Predicts Risk
                    </span>
                  </h2>

                  <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                    Move from reactive management to proactive governance. Our
                    AI engine identifies patterns human auditors miss, surfacing
                    risks before they impact your operations.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:w-1/2 grid sm:grid-cols-2 gap-4">
            {insights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-cyan-500/40 transition-all hover:bg-slate-900/80 group"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-slate-800 border border-slate-700 group-hover:bg-slate-800 transition-colors`}
                >
                  <insight.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {insight.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {insight.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIInsightsSection;
