import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  Plus,
  Briefcase,
  MapPin,
  Pencil,
  Trash2,
  Search,
  Users,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { PageLoader, EmptyState } from "@/components/ui/Loading";
import { Select } from "@/components/ui/Form";
import { formatDate } from "@/lib/utils";
import type { EmploymentType, JobStatus } from "@/types";

const emptyForm = {
  title: "",
  department: "",
  location: "",
  employmentType: "full-time" as EmploymentType,
  status: "open" as JobStatus,
  description: "",
  requirements: "",
  salaryMin: "" as string | number,
  salaryMax: "" as string | number,
};

const statusVariants: Record<
  JobStatus,
  "primary" | "success" | "warning" | "muted" | "error"
> = {
  open: "success",
  closed: "error",
  draft: "muted",
  on_hold: "warning",
};

export const JobsPage = () => {
  const { toast } = useToast();
  const jobs = useQuery(api.jobs.getAll, {});
  const createJob = useMutation(api.jobs.create);
  const updateJob = useMutation(api.jobs.update);
  const deleteJob = useMutation(api.jobs.remove);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"jobs"> | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<Id<"jobs"> | null>(null);

  const loading = jobs === undefined;
  if (loading) return <PageLoader />;

  const filtered = jobs.filter((j) => {
    const matchesSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.department.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || j.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (job: typeof jobs[0]) => {
    setEditingId(job._id);
    setForm({
      title: job.title,
      department: job.department,
      location: job.location ?? '',
      employmentType: job.employmentType,
      status: job.status,
      description: job.description ?? '',
      requirements: job.requirements ?? '',
      salaryMin: job.salaryMin ?? '',
      salaryMax: job.salaryMax ?? '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.department.trim()) {
      toast({ type: 'error', title: 'Title and department are required' });
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title,
      department: form.department,
      location: form.location || undefined,
      employmentType: form.employmentType,
      status: form.status,
      description: form.description || undefined,
      requirements: form.requirements || undefined,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
    };
    try {
      if (editingId) {
        await updateJob({ id: editingId, ...payload });
        toast({ type: 'success', title: 'Job updated' });
      } else {
        await createJob(payload);
        toast({ type: 'success', title: 'Job created' });
      }
      setModalOpen(false);
    } catch (err) {
      toast({ type: 'error', title: 'Failed to save job', description: err instanceof Error ? err.message : 'Unknown error' });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteJob({ id: deleteId });
      toast({ type: 'success', title: 'Job deleted' });
    } catch {
      toast({ type: 'error', title: 'Failed to delete job' });
    }
    setDeleteId(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Job Postings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage open positions and job descriptions
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> New Job
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <Select
          value={filterStatus}
          onChange={setFilterStatus}
          placeholder="All statuses"
          options={[
            { value: "open", label: "Open" },
            { value: "closed", label: "Closed" },
            { value: "draft", label: "Draft" },
            { value: "on_hold", label: "On Hold" },
          ]}
          className="sm:w-40"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-8 w-8 text-muted-foreground" />}
          title="No jobs found"
          description="Create your first job posting to start attracting candidates."
          action={
            <button onClick={openCreate} className="btn-primary">
              <Plus className="h-4 w-4" /> New Job
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((job: any) => (
            <div key={job._id} className="card-base p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <Badge variant={statusVariants[job.status]}>
                  {job.status.replace("_", " ")}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground text-base mb-1">
                {job.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {job.department}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {job.location && (
                  <span className="badge-muted">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </span>
                )}
                <span className="badge-muted">
                  {job.employmentType.replace("-", " ")}
                </span>
              </div>
              {job.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {job.description}
                </p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> applicants
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(new Date(job._creationTime).toISOString())}
                </span>
              </div>
              <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(job)}
                  className="btn-ghost flex-1 text-xs"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeleteId(job._id)}
                  className="btn-ghost text-destructive text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Job" : "Create Job Posting"}
        description={
          editingId
            ? "Update job details"
            : "Add a new position to your pipeline"
        }
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label-text">Job Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              placeholder="Senior Frontend Engineer"
            />
          </div>
          <div>
            <label className="label-text">Department</label>
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="input-field"
              placeholder="Engineering"
            />
          </div>
          <div>
            <label className="label-text">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="input-field"
              placeholder="Remote / San Francisco"
            />
          </div>
          <div>
            <label className="label-text">Employment Type</label>
            <Select
              value={form.employmentType}
              onChange={(v) =>
                setForm({ ...form, employmentType: v as EmploymentType })
              }
              options={[
                { value: "full-time", label: "Full Time" },
                { value: "part-time", label: "Part Time" },
                { value: "contract", label: "Contract" },
                { value: "internship", label: "Internship" },
              ]}
            />
          </div>
          <div>
            <label className="label-text">Status</label>
            <Select
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v as JobStatus })}
              options={[
                { value: "open", label: "Open" },
                { value: "closed", label: "Closed" },
                { value: "draft", label: "Draft" },
                { value: "on_hold", label: "On Hold" },
              ]}
            />
          </div>
          <div>
            <label className="label-text">Salary Min ($)</label>
            <input
              type="number"
              value={form.salaryMin}
              onChange={(e) =>
                setForm({
                  ...form,
                  salaryMin: e.target.value ? parseInt(e.target.value) : "",
                })
              }
              className="input-field"
              placeholder="80000"
            />
          </div>
          <div>
            <label className="label-text">Salary Max ($)</label>
            <input
              type="number"
              value={form.salaryMax}
              onChange={(e) =>
                setForm({
                  ...form,
                  salaryMax: e.target.value ? parseInt(e.target.value) : "",
                })
              }
              className="input-field"
              placeholder="120000"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label-text">Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="textarea-field"
              rows={4}
              placeholder="Job description..."
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label-text">Requirements</label>
            <textarea
              value={form.requirements}
              onChange={(e) =>
                setForm({ ...form, requirements: e.target.value })
              }
              className="textarea-field"
              rows={3}
              placeholder="Required skills and qualifications..."
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
            {saving ? "Saving..." : editingId ? "Update Job" : "Create Job"}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Job"
        message="Are you sure you want to delete this job posting? All associated applications will also be removed."
      />
    </div>
  );
};
