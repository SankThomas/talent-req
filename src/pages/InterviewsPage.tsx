import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  Plus,
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  Code2,
  Search,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Select } from "@/components/ui/Form";
import { PageLoader, EmptyState } from "@/components/ui/Loading";
import { formatDate, formatTime } from "@/lib/utils";
import type { InterviewType, InterviewStatus } from "@/types";

const typeIcons: Record<InterviewType, typeof Video> = {
  video: Video,
  phone: Phone,
  in_person: MapPin,
  technical: Code2,
};

export function InterviewsPage() {
  const { toast } = useToast();
  const interviews = useQuery(api.interviews.getAll, {});
  const applications = useQuery(api.applications.getAll, {});
  const teamMembers = useQuery(api.users.getAllTeamMembers, {});
  const createInterview = useMutation(api.interviews.create);
  const updateStatus = useMutation(api.interviews.updateStatus);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    applicationId: "" as string,
    scheduledDate: "",
    scheduledTime: "10:00",
    durationMinutes: "60",
    type: "video" as InterviewType,
    location: "",
    notes: "",
    interviewerId: "",
  });

  const loading =
    interviews === undefined ||
    applications === undefined ||
    teamMembers === undefined;
  if (loading) return <PageLoader />;

  const filtered = interviews.filter((iv) => {
    const name = iv.candidate?.fullName?.toLowerCase() ?? "";
    const jobTitle = iv.job?.title?.toLowerCase() ?? "";
    return (
      name.includes(search.toLowerCase()) ||
      jobTitle.includes(search.toLowerCase())
    );
  });

  const handleSave = async () => {
    if (!form.applicationId || !form.scheduledDate) {
      toast({ type: "error", title: "Please select a candidate and date" });
      return;
    }
    const app = applications.find((a) => a._id === form.applicationId);
    if (!app) return;

    setSaving(true);
    try {
      await createInterview({
        applicationId: app._id,
        candidateId: app.candidateId,
        jobId: app.jobId,
        interviewerId: form.interviewerId || undefined,
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
        durationMinutes: parseInt(form.durationMinutes) || 60,
        type: form.type,
        location: form.location || undefined,
        notes: form.notes || undefined,
      });
      toast({ type: "success", title: "Interview scheduled" });
      setModalOpen(false);
      setForm({
        applicationId: "",
        scheduledDate: "",
        scheduledTime: "10:00",
        durationMinutes: "60",
        type: "video",
        location: "",
        notes: "",
        interviewerId: "",
      });
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to schedule interview",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
    setSaving(false);
  };

  const handleStatusChange = async (
    id: Id<"interviews">,
    status: InterviewStatus,
  ) => {
    try {
      await updateStatus({ id, status });
      toast({ type: "success", title: "Status updated" });
    } catch {
      toast({ type: "error", title: "Failed to update status" });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Interviews</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule and track candidate interviews
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary"
          disabled={applications.length === 0}
        >
          <Plus className="h-4 w-4" /> Schedule Interview
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search interviews..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-8 w-8 text-muted-foreground" />}
          title="No interviews scheduled"
          description={
            applications.length === 0
              ? "Add candidates to jobs first, then schedule interviews."
              : "Click 'Schedule Interview' to set one up."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((iv) => {
            const TypeIcon = typeIcons[iv.type];
            return (
              <div
                key={iv._id}
                className="card-base p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
              >
                <Link
                  to={`/candidates/${iv.candidateId}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <Avatar
                    name={iv.candidate?.fullName ?? "Unknown"}
                    src={iv.candidate?.profileImageUrl}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground hover:text-primary truncate">
                      {iv.candidate?.fullName}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {iv.job?.title}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-foreground">
                      {formatDate(iv.scheduledDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-foreground">
                      {formatTime(iv.scheduledTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <TypeIcon className="h-4 w-4" />
                    <span className="text-foreground capitalize">
                      {iv.type.replace("_", " ")}
                    </span>
                  </div>
                  <Select
                    value={iv.status}
                    onChange={(v) =>
                      handleStatusChange(iv._id, v as InterviewStatus)
                    }
                    options={[
                      { value: "scheduled", label: "Scheduled" },
                      { value: "completed", label: "Completed" },
                      { value: "cancelled", label: "Cancelled" },
                      { value: "no_show", label: "No Show" },
                    ]}
                    className="w-32 h-9"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule Interview"
        description="Set up an interview for a candidate"
        size="md"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="label-text">Candidate / Application</label>
            <Select
              value={form.applicationId}
              onChange={(v) => setForm({ ...form, applicationId: v })}
              placeholder="Select application"
              options={applications.map((a) => ({
                value: a._id,
                label: `${a.candidate?.fullName} — ${a.job?.title}`,
              }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Date</label>
              <input
                type="date"
                value={form.scheduledDate}
                onChange={(e) =>
                  setForm({ ...form, scheduledDate: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">Time</label>
              <input
                type="time"
                value={form.scheduledTime}
                onChange={(e) =>
                  setForm({ ...form, scheduledTime: e.target.value })
                }
                className="input-field"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Duration (min)</label>
              <input
                type="number"
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm({ ...form, durationMinutes: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">Type</label>
              <Select
                value={form.type}
                onChange={(v) => setForm({ ...form, type: v as InterviewType })}
                options={[
                  { value: "video", label: "Video Call" },
                  { value: "phone", label: "Phone" },
                  { value: "in_person", label: "In Person" },
                  { value: "technical", label: "Technical" },
                ]}
              />
            </div>
          </div>
          <div>
            <label className="label-text">Interviewer</label>
            <Select
              value={form.interviewerId}
              onChange={(v) => setForm({ ...form, interviewerId: v })}
              placeholder="Select interviewer"
              options={teamMembers.map((t) => ({
                value: t.userId,
                label: t.fullName,
              }))}
            />
          </div>
          <div>
            <label className="label-text">Location / Meeting Link</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="input-field"
              placeholder="Zoom link, office address, etc."
            />
          </div>
          <div>
            <label className="label-text">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="textarea-field"
              rows={2}
              placeholder="Interview notes..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setModalOpen(false)} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? "Scheduling..." : "Schedule"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
