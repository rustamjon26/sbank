import React from "react";
import { motion } from "motion/react";
import {
  ChevronRight,
  ShieldCheck,
  QrCode,
  FileSearch,
  LineChart,
  PlayCircle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const trustBadges = [
    { icon: FileSearch, text: "Full Lifecycle Tracking" },
    { icon: QrCode, text: "QR-Based Auth" },
    { icon: ShieldCheck, text: "Audit & Compliance Ready" },
    { icon: LineChart, text: "AI Risk Monitoring" },
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-slate-950">
      {/* Background visual effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[130px] translate-y-1/2 -translate-x-1/3"></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6"
            >
              <span className="flex h-2 w-2 rounded-full bg-cyan-500 blur-[2px]"></span>
              Enterprise Asset Governance
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6"
            >
              Total Visibility for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Banking Assets
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-xl"
            >
              The unified platform for financial institutions to track, audit,
              and secure office and IT assets across every branch, department,
              and employee.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-16"
            >
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full h-14 px-8 text-base font-medium transition-all shadow-lg shadow-cyan-600/20"
              >
                Request Demo
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-slate-700 text-white hover:bg-slate-800 hover:text-white rounded-full h-14 px-8 text-base font-medium"
              >
                <PlayCircle className="mr-2 h-5 w-5 text-cyan-400" />
                See How It Works
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-2 gap-4"
            >
              {trustBadges.map((badge, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-slate-300"
                >
                  <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                    <badge.icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <span className="text-sm font-medium">{badge.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center hidden lg:flex"
          >
            {/* Main glassmorphism card mimicking app UI */}
            <div className="relative w-full aspect-[4/3] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/50 overflow-hidden z-20 flex flex-col">
              {/* Fake Window Header */}
              <div className="h-10 bg-slate-950 px-4 flex items-center gap-2 border-b border-slate-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                </div>
                <div className="mx-auto bg-slate-900 rounded-md px-4 py-1 flex items-center border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono">
                    assetflow.bank/dashboard
                  </span>
                </div>
              </div>

              {/* Fake App Layout */}
              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-16 bg-slate-950 border-r border-slate-800 flex flex-col py-4 px-2 gap-4 items-center">
                  <div className="w-10 h-10 rounded-lg bg-cyan-600/20 text-cyan-500 flex items-center justify-center mb-4">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400">
                    <LineChart className="w-5 h-5" />
                  </div>
                  <div className="w-10 h-10 rounded-lg hover:bg-slate-900 flex items-center justify-center text-slate-600">
                    <FileSearch className="w-5 h-5" />
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 p-6 bg-[#04091A]">
                  <div className="flex justify-between mb-6">
                    <div className="h-6 w-32 bg-slate-800 rounded-md"></div>
                    <div className="h-6 w-24 bg-cyan-900/40 border border-cyan-800 rounded-md"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="h-24 bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                      <div className="h-3 w-16 bg-slate-800 rounded"></div>
                      <div className="h-6 w-12 bg-slate-700 rounded"></div>
                    </div>
                    <div className="h-24 bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                      <div className="h-3 w-20 bg-slate-800 rounded"></div>
                      <div className="h-6 w-16 bg-slate-700 rounded"></div>
                    </div>
                    <div className="h-24 bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                      <div className="h-3 w-16 bg-slate-800 rounded"></div>
                      <div className="h-6 w-12 bg-cyan-600 rounded"></div>
                    </div>
                  </div>
                  <div className="flex-1 h-32 bg-slate-900/50 border border-slate-800 rounded-xl"></div>
                </div>
              </div>
            </div>

            {/* Floating Elements for 3D depth */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -right-12 -top-8 bg-slate-800/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-xl z-30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Status Update</div>
                  <div className="text-sm font-semibold text-white">
                    Security Audit Passed
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{
                repeat: Infinity,
                duration: 6,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -left-12 bottom-12 bg-slate-800/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-xl z-30 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">New Asset Assigned</div>
                <div className="text-sm font-semibold text-white">
                  ThinkPad X1 to QA Dept
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
