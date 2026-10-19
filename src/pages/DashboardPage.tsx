import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Briefcase,
  Users,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import { PageLoader } from "@/components/ui/Loading";
import { Avatar } from "@/components/ui/Avatar";
import { StageBadge } from "@/components/ui/Badge";
import { formatDate, formatTime } from "@/lib/utils";
import type { Job, Candidate, Application, Interview } from "@/types";
import { STAGE_LABELS } from "@/types";

const STAGE_COLORS_MAP: Record<string, string> = {
  applied: "#3b82f6",
  screening: "#06b6d4",
  interview: "#f59e0b",
  offer: "#22c55e",
  hired: "#10b981",
  rejected: "#ef4444",
};

export const DashboardPage = () => {
  const [loading, setLoading] = useState(false); // Remember to change this to "true"
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);

  if (loading) return <PageLoader />;

  const openJobs = jobs.filter((j) => j.status === "open").length;
  const hiredCount = applications.filter((a) => a.stage === "hired").length;
  const activeCandidates = applications.filter(
    (a) => a.stage !== "hired" && a.stage !== "rejected",
  ).length;
  const upcomingInterviews = interviews.filter(
    (i) => i.status === "scheduled",
  ).length;

  const stats = [
    {
      label: "Open Positions",
      value: openJobs,
      icon: Briefcase,
      change: "+2",
      up: true,
    },
    {
      label: "Active Candidates",
      value: activeCandidates,
      icon: Users,
      change: "+12",
      up: true,
    },
    {
      label: "Hires This Month",
      value: hiredCount,
      icon: TrendingUp,
      change: "+3",
      up: true,
    },
    {
      label: "Upcoming Interviews",
      value: upcomingInterviews,
      icon: Calendar,
      change: "-1",
      up: false,
    },
  ];

  const stageData = Object.entries(STAGE_LABELS).map(([key, label]) => ({
    name: label,
    value: applications.filter((a) => a.stage === key).length,
    key,
  }));

  const hiringTrend = [
    { month: "May", hires: 2, applications: 15 },
    { month: "Jun", hires: 4, applications: 22 },
    { month: "Jul", hires: 3, applications: 18 },
    { month: "Aug", hires: 5, applications: 28 },
    { month: "Sep", hires: 6, applications: 32 },
    { month: "Oct", hires: hiredCount, applications: applications.length },
  ];

  const departmentData = Array.from(new Set(jobs.map((j) => j.department))).map(
    (dept) => ({
      name: dept,
      jobs: jobs.filter((j) => j.department === dept).length,
    }),
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Recruiting overview and key metrics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? "text-success" : "text-destructive"}`}
              >
                {stat.up ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card-base p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Hiring Trends
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={hiringTrend}>
              <defs>
                <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 14% 18%)" />
              <XAxis dataKey="month" stroke="hsl(215 14% 55%)" fontSize={12} />
              <YAxis stroke="hsl(215 14% 55%)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222 22% 10%)",
                  border: "1px solid hsl(222 14% 18%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="applications"
                stroke="#06b6d4"
                fill="url(#colorApps)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="hires"
                stroke="#3b82f6"
                fill="url(#colorHires)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-base p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Pipeline Distribution
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={stageData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {stageData.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={STAGE_COLORS_MAP[entry.key] ?? "#64748b"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222 22% 10%)",
                  border: "1px solid hsl(222 14% 18%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {stageData.map((s) => (
              <div
                key={s.key}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: STAGE_COLORS_MAP[s.key] }}
                />
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card-base p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Jobs by Department
          </h2>
          {departmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={departmentData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(222 14% 18%)"
                />
                <XAxis dataKey="name" stroke="hsl(215 14% 55%)" fontSize={11} />
                <YAxis stroke="hsl(215 14% 55%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222 22% 10%)",
                    border: "1px solid hsl(222 14% 18%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="jobs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No jobs yet
            </p>
          )}
        </div>

        <div className="card-base p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">
              Upcoming Interviews
            </h2>
            <Link
              to="/interviews"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {interviews.length > 0 ? (
            <div className="space-y-3">
              {interviews.slice(0, 5).map((iv) => (
                <div key={iv._id} className="flex items-center gap-3">
                  <Avatar
                    name={iv.candidate?.fullName ?? "Unknown"}
                    src={iv.candidate?.profileImageUrl}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {iv.candidate?.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {iv.job?.title}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-foreground">
                      {formatDate(iv.scheduledDate)}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-0.5 justify-end">
                      <Clock className="h-3 w-3" />
                      {formatTime(iv.scheduledTime)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No interviews scheduled
            </p>
          )}
        </div>

        <div className="card-base p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">
              Recent Applications
            </h2>
            <Link
              to="/pipeline"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {applications.length > 0 ? (
            <div className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <Link
                  to={`/candidates/${app.candidateId}`}
                  key={app._id}
                  className="flex items-center gap-3 hover:bg-secondary/50 -mx-2 px-2 py-1 rounded-lg transition-colors"
                >
                  <Avatar
                    name={app.candidate?.fullName ?? "Unknown"}
                    src={app.candidate?.profileImageUrl}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {app.candidate?.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {app.job?.title}
                    </p>
                  </div>
                  <StageBadge stage={app.stage} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No applications yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
