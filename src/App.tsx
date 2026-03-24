import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import IntersectObserver from "@/components/common/IntersectObserver";
import { Toaster } from "@/components/ui/sonner";
import AppLayout from "@/components/layouts/AppLayout";
import { SupabaseConfigError } from "@/components/common/SupabaseConfigError";

import routes from "./routes";

import { AuthProvider } from "@/contexts/AuthContext";
import { RouteGuard } from "@/components/common/RouteGuard";

const App: React.FC = () => {
  // Check if Supabase is configured
  const isSupabaseConfigured =
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_URL.includes("placeholder");

  if (!isSupabaseConfigured) {
    return <SupabaseConfigError />;
  }

  return (
    <Router>
      <AuthProvider>
        <RouteGuard>
          <IntersectObserver />
          <Routes>
            {routes.map((route, index) => {
              if (
                route.path === "/" ||
                route.path === "/login" ||
                route.path.startsWith("/asset/public")
              ) {
                return (
                  <Route
                    key={index}
                    path={route.path}
                    element={route.element}
                  />
                );
              }

              // All other pages use AppLayout
              return (
                <Route
                  key={index}
                  path={route.path}
                  element={<AppLayout>{route.element}</AppLayout>}
                />
              );
            })}
          </Routes>
          <Toaster />
        </RouteGuard>
      </AuthProvider>
    </Router>
  );
};

export default App;
