import React from "react";

const LandingSimple: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Development Mode</h1>
      <p className="text-slate-400 max-w-md">
        The AssetFlow Bank landing page is temporarily in simple mode during
        build troubleshooting.
      </p>
      <a
        href="/login"
        className="mt-8 px-6 py-2 bg-cyan-600 rounded-full font-bold"
      >
        Sign In
      </a>
    </div>
  );
};

export default LandingSimple;
