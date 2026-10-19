import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { User, Save, Mail, Phone, Briefcase } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/Avatar";
import { Select } from "@/components/ui/Form";
import type { UserRole } from "@/types";
import { ROLE_LABELS } from "@/types";

export function SettingsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const updateProfile = useMutation(api.users.updateProfile);
  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [department, setDepartment] = useState(profile?.department ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [role, setRole] = useState<UserRole>(profile?.role ?? "recruiter");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile({
        fullName,
        role,
        phone: phone || undefined,
        department: department || undefined,
        bio: bio || undefined,
      });
      toast({ type: "success", title: "Settings saved" });
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to save",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Manage your profile and preferences
      </p>

      <div className="card-base p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <Avatar
            name={fullName || "User"}
            src={profile?.avatarUrl}
            size="lg"
          />
          <div>
            <h2 className="font-semibold text-foreground">
              {fullName || "Your name"}
            </h2>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <label className="label-text">Role</label>
            <Select
              value={role}
              onChange={(v) => setRole(v as UserRole)}
              options={Object.entries(ROLE_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </div>
          <div>
            <label className="label-text">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field pl-10"
                placeholder="+1 555-0100"
              />
            </div>
          </div>
          <div>
            <label className="label-text">Department</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="input-field pl-10"
                placeholder="Talent Acquisition"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="label-text">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="textarea-field"
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="card-base p-6">
        <h3 className="font-semibold text-foreground mb-3">
          Email Notifications
        </h3>
        <div className="space-y-3">
          {[
            {
              label: "New applications",
              desc: "Get notified when a candidate applies",
            },
            {
              label: "Interview reminders",
              desc: "Reminders before scheduled interviews",
            },
            {
              label: "Candidate stage changes",
              desc: "When a candidate moves stages in the pipeline",
            },
            {
              label: "Weekly summary",
              desc: "Recruiting activity summary every Monday",
            },
          ].map((item) => (
            <label
              key={item.label}
              className="flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 accent-primary"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
