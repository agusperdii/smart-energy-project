import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FlaskConical,
  Info,
  User,
  ChevronLeft,
  ChevronRight,
  Menu
} from "lucide-react";
import { Button } from "../../../@/components/ui/button";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { name: "Simulasi", icon: FlaskConical, href: "/simulation" },
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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300 ease-in-out lg:static ${isCollapsed ? "w-20" : "w-64"
          } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {!isCollapsed && <span className="text-xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">Energizer</span>}
          {isCollapsed && <span className="mx-auto text-xl font-bold text-primary">E</span>}
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
                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/95"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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