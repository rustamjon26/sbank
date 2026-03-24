import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import AssetDetail from "./pages/AssetDetail";
import Employees from "./pages/Employees";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import QRScanView from "./pages/QRScanView";
import type { ReactNode } from "react";

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: "Home",
    path: "/",
    element: <Landing />,
    visible: false,
  },
  {
    name: "Login",
    path: "/login",
    element: <Login />,
    visible: false,
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    name: "Assets",
    path: "/assets",
    element: <Assets />,
  },
  {
    name: "Asset Detail",
    path: "/assets/:id",
    element: <AssetDetail />,
    visible: false,
  },
  {
    name: "Employees",
    path: "/employees",
    element: <Employees />,
  },
  {
    name: "Admin",
    path: "/admin",
    element: <Admin />,
    visible: false,
  },
  {
    name: "Not Found",
    path: "*",
    element: <NotFound />,
    visible: false,
  },
  {
    name: "Public Asset View",
    path: "/asset/public/:id",
    element: <QRScanView />,
    visible: false,
  },
];

export default routes;
