import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Users, Mail, Phone, Briefcase, Shield } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { PageLoader, EmptyState } from "@/components/ui/Loading";
import { ROLE_LABELS } from "@/types";

export function TeamPage() {
  const members = useQuery(api.users.getAllTeamMembers, {});

  if (members === undefined) return <PageLoader />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Team</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your recruiting team members and their roles
        </p>
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8 text-muted-foreground" />}
          title="No team members"
          description="Team members will appear here once they sign up."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <div key={m._id} className="card-base p-5">
              <div className="flex items-start gap-3">
                <Avatar name={m.fullName} src={m.avatarUrl} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">
                    {m.fullName}
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <Badge variant="primary">{ROLE_LABELS[m.role]}</Badge>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{m.email}</span>
                </div>
                {m.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{m.phone}</span>
                  </div>
                )}
                {m.department && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>{m.department}</span>
                  </div>
                )}
              </div>
              {m.bio && (
                <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
                  {m.bio}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
