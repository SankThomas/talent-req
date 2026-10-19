import { useAuth } from "@/context/AuthContext";
import { cn } from "cn";
import {
  Briefcase,
  Calendar,
  KanbanSquare,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Avatar } from "../ui/Avatar";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/candidates", label: "Candidates", icon: Users },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/interviews", label: "Interviews", icon: Calendar },
  { to: "/team", label: "Team", icon: Users },
];

export const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { profile } = useAuth();

  return (
    <>
      <div className="flex items-center gap-2 px-5 h-14 border-b border-border shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Briefcase className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground">TalentHub</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn("nav-link", isActive && "nav-link-active")
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn("nav-link", isActive && "nav-link-active")
          }
        >
          <Settings className="h-4 w-4" />
          Settings
        </NavLink>
        <div className="flex items-center gap-2 px-3 py-3 mt-1">
          <Avatar
            name={profile?.fullName ?? "User"}
            src={profile?.avatarUrl}
            size="sm"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {profile?.fullName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.email}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
