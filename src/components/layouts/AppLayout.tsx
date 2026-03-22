import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
  Building2,
  Menu,
  ShieldCheck,
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Assets", href: "/assets", icon: Package },
  { name: "Employees", href: "/employees", icon: Users },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const userInitials =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name[0]}${profile.last_name[0]}`
      : profile?.username?.[0]?.toUpperCase() || "U";
  const userName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile?.username || "User";
  const isAdmin = profile?.role === "admin";

  return (
    <SidebarProvider>
      <div className="page-shell flex min-h-screen w-full">
        <Sidebar className="hidden border-r border-sidebar-border bg-sidebar lg:block">
          <SidebarHeader className="border-b border-sidebar-border p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sidebar-primary p-2.5 text-sidebar-primary-foreground shadow-lg shadow-primary/25">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-sidebar-foreground">
                  SmartAsset AI
                </h2>
                <p className="text-xs text-sidebar-foreground/70">
                  Bank Office Control Center
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-sidebar-foreground/85">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.18em] text-sidebar-foreground/50">
                  Workspace
                </span>
                <Badge className="bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/15">
                  Live
                </Badge>
              </div>
              <p className="mt-2 text-sm font-medium">
                Asset lifecycle, audit, and risk monitoring in one dashboard.
              </p>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                  >
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === "/admin"}
                  >
                    <Link to="/admin">
                      <Settings className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border p-4">
            <div className="mb-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-sidebar-foreground/70">
              <ShieldCheck className="h-4 w-4 text-emerald-300" /> Audit trail
              active
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto w-full justify-start gap-3 rounded-2xl px-2 py-2 text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground"
                >
                  <Avatar className="h-9 w-9 border border-white/10">
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col items-start text-left">
                    <span className="truncate text-sm font-medium">
                      {userName}
                    </span>
                    <span className="text-xs capitalize text-sidebar-foreground/65">
                      {profile?.role}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-3 px-4 md:px-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 border-r p-0">
                  <div className="flex h-full flex-col bg-slate-950 text-white">
                    <div className="border-b border-white/10 p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-primary p-2.5 text-primary-foreground">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="font-semibold text-sm">
                            SmartAsset AI
                          </h2>
                          <p className="text-xs text-white/60">
                            Bank Office Control Center
                          </p>
                        </div>
                      </div>
                    </div>
                    <nav className="flex-1 space-y-1 p-4">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${location.pathname === item.href ? "bg-white text-slate-950" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${location.pathname === "/admin" ? "bg-white text-slate-950" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Admin</span>
                        </Link>
                      )}
                    </nav>
                    <div className="border-t border-white/10 p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-white/10">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {userName}
                          </div>
                          <div className="text-xs capitalize text-white/60">
                            {profile?.role}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <div className="hidden lg:block">
                <SidebarTrigger />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">SmartAsset AI</div>
                <div className="truncate text-xs text-muted-foreground">
                  Intelligent lifecycle, audit, and risk management for bank
                  office assets
                </div>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  Secure audit mode
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-9 w-9 border border-border/70 shadow-sm">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{userName}</span>
                      <span className="text-xs font-normal capitalize text-muted-foreground">
                        {profile?.role}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 w-full overflow-hidden px-4 py-6 md:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1400px]">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
