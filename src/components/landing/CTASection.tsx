import React from "react";
import { motion } from "motion/react";
import { ChevronRight, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/30 rounded-full blur-[160px]"></div>
      </div>

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-[3rem] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 transition-all group-hover:bg-cyan-500/10"></div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-8">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Ready for Total <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Asset Visibility?
              </span>
            </h2>

            <p className="text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
              Built for modern banks that need full asset visibility,
              audit-ready records, and structured ownership tracking.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full h-16 px-10 text-lg font-bold transition-all shadow-xl shadow-cyan-600/20"
              >
                Request Demo
                <ChevronRight className="ml-2 h-6 w-6" />
              </Button>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mt-4 sm:mt-0 px-4">
                <Mail className="w-4 h-4 text-cyan-500/60" />
                contact@assetflow.bank
              </div>
            </div>

            <p className="mt-12 text-slate-600 text-[10px] uppercase font-bold tracking-[0.2em]">
              Enterprise-Grade Visibility • Audit-Ready Records • Operational
              Resilience
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
