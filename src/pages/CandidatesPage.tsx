import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Plus, Search, Users, Mail } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { PageLoader, EmptyState } from "@/components/ui/Loading";
import { formatDate } from "@/lib/utils";

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  currentCompany: "",
  currentPosition: "",
  location: "",
  skills: "",
  experienceYears: "",
  linkedinUrl: "",
  websiteUrl: "",
  notes: "",
};

export const CandidatesPage = () => {
  const { toast } = useToast();
  const candidates = useQuery(api.candidates.getAll, {});
  const createCandidate = useMutation(api.candidates.create);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  if (candidates === undefined) return <PageLoader />;

  const filtered = candidates.filter((c) => c.fullName.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()) || c.skills?.some((s: any) => s.toLowerCase().includes(search.toLowerCase()))); 

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      toast({ type: "error", title: "Name is required" });
      return;
    }
    setSaving(true);
    const skills = form.skills.split(",").map((s) => s.trim()).filter(Boolean);

    try {
      await createCandidate({
        fullName: form.fullName,
        email: form.email || undefined,
        phone: form.phone || undefined,
        currentCompany: form.currentCompany || undefined,
        currentPosition: form.currentPosition || undefined,
        location: form.location || undefined,
        skills: skills.length > 0 ? skills : undefined,
        experienceYears: form.experienceYears
          ? parseInt(form.experienceYears)
          : undefined,
        linkedinUrl: form.linkedinUrl || undefined,
        websiteUrl: form.websiteUrl || undefined,
        notes: form.notes || undefined,
        source: "direct",
      });
      toast({ type: "success", title: "Candidate added" });
      setModalOpen(false);
      setForm(emptyForm);
    } catch (err) {
      toast({ type: "error", title: "Failed to add candidate", description: err instanceof Error ? err.message: "Unknown error occurred" });
    }
    setSaving(false);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Candidates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and manage your talent pool
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Add candidate
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search by name, email, or skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8 text-muted-foreground" />}
          title="No candidates found"
          description="Add your first candidate to start building your talent pool."
          action={
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> Add Candidate
            </button>
          }
        />
      ) : (
        <div className="card-base overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-border bg-secondary/30">
              <tr>
                <th className="table-cell font-semibold">Candidate</th>
                <th className="font-semibold hidden md:table-cell">
                  Current Role
                </th>
                <th className="font-semibold hidden lg:table-cell">Skills</th>
                <th className="font-semibold hidden sm:table-cell">Added</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filtered.map((c: any) => (
                <tr
                  key={c._id}
                  className="hover:bg-secondary/30 transition-colors"
                >
                  <td className="table-cell">
                    <Link
                      to={`/candidates/${c._id}`}
                      className="flex items-center gap-3"
                    >
                      <Avatar
                        name={c.fullName}
                        src={c.profileImageUrl}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-foreground hover:text-primary">
                          {c.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          {c.email && (
                            <>
                              <Mail className="h-3 w-3" /> {c.email}
                            </>
                          )}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="hidden md:table-cell">
                    <p className="text-sm text-foreground">
                      {c.currentPosition ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.currentCompany ?? ""}
                    </p>
                  </td>
                  <td className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(c.skills ?? []).slice(0, 3).map((s: any) => (
                        <span key={s} className="badge-muted">
                          {s}
                        </span>
                      ))}
                      {(c.skills ?? []).length > 3 && (
                        <span className="badge-muted">
                          +{(c.skills ?? []).length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell text-muted-foreground">
                    {formatDate(new Date(c._creationTime).toISOString())}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Candidate"
        description="Create a new candidate profile"
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label-text">Full Name *</label>
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="input-field"
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label className="label-text">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
              placeholder="jane@email.com"
            />
          </div>
          <div>
            <label className="label-text">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field"
              placeholder="+1 555-0100"
            />
          </div>
          <div>
            <label className="label-text">Current Company</label>
            <input
              value={form.currentCompany}
              onChange={(e) =>
                setForm({ ...form, currentCompany: e.target.value })
              }
              className="input-field"
              placeholder="Acme Inc."
            />
          </div>
          <div>
            <label className="label-text">Current Position</label>
            <input
              value={form.currentPosition}
              onChange={(e) =>
                setForm({ ...form, currentPosition: e.target.value })
              }
              className="input-field"
              placeholder="Senior Engineer"
            />
          </div>
          <div>
            <label className="label-text">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="input-field"
              placeholder="San Francisco, CA"
            />
          </div>
          <div>
            <label className="label-text">Experience (years)</label>
            <input
              type="number"
              value={form.experienceYears}
              onChange={(e) =>
                setForm({ ...form, experienceYears: e.target.value })
              }
              className="input-field"
              placeholder="5"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label-text">Skills (comma-separated)</label>
            <input
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              className="input-field"
              placeholder="React, TypeScript, Node.js"
            />
          </div>
          <div>
            <label className="label-text">LinkedIn URL</label>
            <input
              value={form.linkedinUrl}
              onChange={(e) =>
                setForm({ ...form, linkedinUrl: e.target.value })
              }
              className="input-field"
              placeholder="linkedin.com/in/janesmith"
            />
          </div>
          <div>
            <label className="label-text">Website</label>
            <input
              value={form.websiteUrl}
              onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
              className="input-field"
              placeholder="janesmith.dev"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label-text">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="textarea-field"
              rows={3}
              placeholder="Internal notes about the candidate..."
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
            {saving ? "Adding..." : "Add Candidate"}
          </button>
        </div>
      </Modal>
    </div>
  );
};
