import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FlaskConical,
  Info,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "../../../@/components/ui/button";
import { useTheme } from "./ThemeContext";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [operatorName, setOperatorName] = useState("Budi Santoso");

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { name: "Inferensi", icon: FlaskConical, href: "/simulation" },
    { name: "Tentang", icon: Info, href: "/about" },
    { name: "Profil", icon: User, href: "/profile" },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync operator name from localStorage
  useEffect(() => {
    const checkProfile = () => {
      const savedData = localStorage.getItem("steelsense_profile");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.name) {
            setOperatorName(parsed.name);
          }
        } catch (e) {
          // ignore
        }
      }
    };
    checkProfile();
    window.addEventListener("storage", checkProfile);
    const interval = setInterval(checkProfile, 2000);
    return () => {
      window.removeEventListener("storage", checkProfile);
      clearInterval(interval);
    };
  }, []);

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden shadow-md"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out lg:static ${isCollapsed ? "w-20" : "w-64"
          } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border/60">
          {!isCollapsed && <span className="text-xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">SteelSense</span>}
          {isCollapsed && <span className="mx-auto text-xl font-bold text-primary">S</span>}
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-2 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:opacity-95"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    } ${isCollapsed ? "justify-center" : "justify-start"}`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={`h-5 w-5 ${isCollapsed ? "mr-0" : "mr-3"}`} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Theme Toggle & Operator Info) */}
        <div className="p-4 border-t border-sidebar-border/60 space-y-4">
          {/* Theme Toggle Button */}
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
            {!isCollapsed && (
              <span className="text-xs font-semibold text-muted-foreground">Mode {theme === "light" ? "Terang" : "Gelap"}</span>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-300 cursor-pointer border-sidebar-border/60"
              title={`Beralih ke Mode ${theme === "light" ? "Gelap" : "Terang"}`}
            >
              {theme === "light" ? (
                <Sun className="h-4 w-4 text-amber-500 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-400" />
              )}
            </Button>
          </div>

          {/* Quick Profile Summary */}
          <Link
            to="/profile"
            className={`flex items-center rounded-lg p-1.5 transition-colors hover:bg-sidebar-accent text-left ${isCollapsed ? "justify-center" : "gap-3"
              }`}
          >
            <div className="h-8 w-8 rounded-full bg-linear-to-tr from-sidebar-primary to-sidebar-primary/70 flex items-center justify-center text-sidebar-primary-foreground text-xs font-extrabold shrink-0 border border-sidebar-border/30">
              {getInitials(operatorName)}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-sidebar-foreground truncate">{operatorName}</p>
                <p className="text-[10px] text-muted-foreground truncate">Operator Shift</p>
              </div>
            )}
          </Link>
        </div>

        <div className="absolute -right-4 top-6 hidden lg:block">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full shadow-md bg-background border-border hover:bg-accent"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}