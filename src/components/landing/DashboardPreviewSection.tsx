import React from "react";
import { motion } from "motion/react";
import { PieChart, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";

const DashboardPreviewSection: React.FC = () => {
  return (
    <section className="py-24 bg-slate-900 border-y border-slate-800 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6"
          >
            Insights That Drive <br className="hidden md:block" />
            <span className="text-cyan-400">Institutional Governance</span>
          </motion.h2>
          <p className="text-lg text-slate-400">
            A comprehensive, high-fidelity view of your entire hardware
            landscape, allowing you to make data-driven decisions at scale.
          </p>
        </div>

        <div className="relative p-2 rounded-[2.5rem] bg-gradient-to-b from-slate-700/50 to-transparent border border-white/5 shadow-2xl overflow-hidden">
          <div className="bg-slate-950/80 backdrop-blur-3xl rounded-[2.25rem] p-10 flex flex-col items-center">
            <div className="w-full grid lg:grid-cols-4 gap-8">
              {/* Fake Widget 1 - Status Distribution */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col gap-6"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-cyan-400" />
                    Status Distribution
                  </h4>
                </div>
                <div className="flex-1 flex items-center justify-center relative">
                  <div className="w-24 h-24 rounded-full border-8 border-cyan-500/20 border-t-cyan-500 animate-[spin_10s_linear_infinite]"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                    78%
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">ASSIGNED</span>
                    <span className="text-white font-medium">1,240</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">REGISTERED</span>
                    <span className="text-white font-medium">412</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">IN_REPAIR</span>
                    <span className="text-rose-400 font-medium">23</span>
                  </div>
                </div>
              </motion.div>

              {/* Fake Widget 2 - Category Breakdown */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col gap-6"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    Top Asset Categories
                  </h4>
                  <span className="text-[10px] text-cyan-500 font-medium bg-cyan-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest border border-cyan-500/20">
                    Live Data
                  </span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Computing Devices", val: "75%", total: "842" },
                    { label: "Peripheral Hardware", val: "45%", total: "521" },
                    { label: "Branch Tech", val: "25%", total: "318" },
                  ].map((row, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs uppercase tracking-wider">
                        <span className="text-slate-500 font-medium">
                          {row.label}
                        </span>
                        <span className="text-slate-300 font-semibold">
                          {row.total}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: row.val }}
                          className="h-full bg-cyan-600 rounded-full"
                          transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                        ></motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Fake Widget 3 - Flagged Risky Assets */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col gap-6"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    Critical Alerts
                  </h4>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-tighter">
                        Aging Asset
                      </div>
                      <div className="text-xs font-semibold text-white">
                        ATM Scanner v4 - Main Branch
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-tighter">
                        Unassigned
                      </div>
                      <div className="text-xs font-semibold text-white">
                        MacBook Pro - IT Pool #42
                      </div>
                    </div>
                  </div>
                </div>
                <button className="mt-auto text-center py-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors border border-cyan-500/20 rounded-lg hover:bg-cyan-500/5">
                  VIEW ALL RISK ALERTS
                </button>
              </motion.div>
            </div>

            {/* Visual bottom mockup indicator */}
            <div className="mt-12 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreviewSection;
