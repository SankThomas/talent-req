import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Globe,
  FileText,
  Upload,
  Trash2,
  MessageSquare,
  Send,
  Plus,
  Calendar,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/Avatar";
import { StageBadge, Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Loading";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Form";
import { Tabs } from "@/components/ui/Form";
import { formatDate, formatTime, timeAgo } from "@/lib/utils";
import type { InterviewStatus } from "@/types";

export function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const candidateId = id as Id<"candidates">;
  const { profile } = useAuth();
  const { toast } = useToast();

  const candidate = useQuery(api.candidates.getById, { id: candidateId });
  const applications = useQuery(api.applications.getByCandidate, {
    candidateId,
  });
  const openJobs = useQuery(api.jobs.getOpenJobs, {});
  const comments = useQuery(api.comments.getByCandidate, { candidateId });
  const interviews = useQuery(api.interviews.getByCandidate, { candidateId });

  const addComment = useMutation(api.comments.addComment);
  const removeComment = useMutation(api.comments.remove);
  const createApplication = useMutation(api.applications.create);
  const setProfileImage = useMutation(api.candidates.setProfileImage);
  const setResumeUrl = useMutation(api.candidates.setResumeUrl);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [commentBody, setCommentBody] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const loading =
    candidate === undefined ||
    applications === undefined ||
    openJobs === undefined ||
    comments === undefined ||
    interviews === undefined;

  if (loading) return <PageLoader />;
  if (!candidate) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Candidate not found.</p>
        <Link to="/candidates" className="text-primary hover:underline">
          Back to candidates
        </Link>
      </div>
    );
  }

  const handleAddComment = async () => {
    if (!commentBody.trim()) return;
    try {
      await addComment({ candidateId, body: commentBody.trim() });
      setCommentBody("");
      toast({ type: "success", title: "Comment added" });
    } catch {
      toast({ type: "error", title: "Failed to add comment" });
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    try {
      await createApplication({
        candidateId,
        jobId: selectedJob as Id<"jobs">,
      });
      toast({ type: "success", title: "Application created" });
      setApplyModalOpen(false);
      setSelectedJob("");
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to apply",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const uploadUrl = await generateUploadUrl({});
      const res = await fetch(uploadUrl, { method: "POST", body: file });
      const { storageId } = await res.json();
      const url = `${import.meta.env.VITE_CONVEX_URL}/api/storage/${storageId}`;
      await setProfileImage({ id: candidateId, url });
      toast({ type: "success", title: "Profile image updated" });
    } catch {
      toast({ type: "error", title: "Upload failed" });
    }
    setUploadingImage(false);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      const uploadUrl = await generateUploadUrl({});
      const res = await fetch(uploadUrl, { method: "POST", body: file });
      const { storageId } = await res.json();
      const url = `${import.meta.env.VITE_CONVEX_URL}/api/storage/${storageId}`;
      await setResumeUrl({ id: candidateId, url });
      toast({ type: "success", title: "Resume uploaded" });
    } catch {
      toast({ type: "error", title: "Upload failed" });
    }
    setUploadingResume(false);
  };

  const handleRemoveResume = async () => {
    try {
      await setResumeUrl({ id: candidateId, url: undefined });
      toast({ type: "success", title: "Resume removed" });
    } catch {
      toast({ type: "error", title: "Failed to remove resume" });
    }
  };

  const handleRemoveImage = async () => {
    try {
      await setProfileImage({ id: candidateId, url: undefined });
      toast({ type: "success", title: "Profile image removed" });
    } catch {
      toast({ type: "error", title: "Failed to remove image" });
    }
  };

  const handleDeleteComment = async (commentId: Id<"comments">) => {
    try {
      await removeComment({ id: commentId });
      toast({ type: "success", title: "Comment deleted" });
    } catch {
      toast({ type: "error", title: "Failed to delete comment" });
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link
        to="/candidates"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Candidates
      </Link>

      <div className="card-base p-6 mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
            <Avatar
              name={candidate.fullName}
              src={candidate.profileImageUrl}
              size="lg"
            />
            <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Upload className="h-4 w-4 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
            </label>
            {candidate.profileImageUrl && (
              <button
                onClick={handleRemoveImage}
                className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">
              {candidate.fullName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {candidate.currentPosition}
              {candidate.currentCompany
                ? ` at ${candidate.currentCompany}`
                : ""}
            </p>
            <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
              {candidate.email && (
                <a
                  href={`mailto:${candidate.email}`}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <Mail className="h-3.5 w-3.5" /> {candidate.email}
                </a>
              )}
              {candidate.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {candidate.phone}
                </span>
              )}
              {candidate.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {candidate.location}
                </span>
              )}
              {candidate.experienceYears != null && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />{" "}
                  {candidate.experienceYears} yrs exp
                </span>
              )}
              {candidate.linkedinUrl && (
                <a
                  href={candidate.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  LinkedIn
                </a>
              )}
              {candidate.websiteUrl && (
                <a
                  href={candidate.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <Globe className="h-3.5 w-3.5" /> Website
                </a>
              )}
            </div>
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {candidate.skills.map((s: any) => (
                  <span key={s} className="badge-primary">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setApplyModalOpen(true)}
            className="btn-primary self-start"
          >
            <Plus className="h-4 w-4" /> Apply to Job
          </button>
        </div>
      </div>

      <div className="mb-4">
        <Tabs
          tabs={[
            { id: "overview", label: "Overview" },
            {
              id: "applications",
              label: `Applications (${applications.length})`,
            },
            { id: "interviews", label: `Interviews (${interviews.length})` },
            { id: "comments", label: `Comments (${comments.length})` },
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card-base p-5">
            <h3 className="font-semibold text-foreground mb-3">Resume</h3>
            {candidate.resumeUrl ? (
              <div className="space-y-3">
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <FileText className="h-4 w-4" /> View Resume
                </a>
                <button
                  onClick={handleRemoveResume}
                  className="btn-ghost text-destructive text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove Resume
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary/40 transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  {uploadingResume ? "Uploading..." : "Upload resume"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleResumeUpload}
                  disabled={uploadingResume}
                />
              </label>
            )}
          </div>

          <div className="card-base p-5">
            <h3 className="font-semibold text-foreground mb-3">Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Source</dt>
                <dd className="text-foreground capitalize">
                  {candidate.source}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Added</dt>
                <dd className="text-foreground">
                  {formatDate(new Date(candidate._creationTime).toISOString())}
                </dd>
              </div>
            </dl>
          </div>

          {candidate.notes && (
            <div className="card-base p-5">
              <h3 className="font-semibold text-foreground mb-3">Notes</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {candidate.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "applications" && (
        <div className="card-base p-5">
          {applications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No applications yet. Click "Apply to Job" to add one.
            </p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="flex items-center justify-between border border-border rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {app.job?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {app.job?.department} • Applied{" "}
                      {formatDate(new Date(app._creationTime).toISOString())}
                    </p>
                  </div>
                  <StageBadge stage={app.stage} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "interviews" && (
        <div className="card-base p-5">
          {interviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No interviews scheduled.
            </p>
          ) : (
            <div className="space-y-3">
              {interviews.map((iv) => (
                <div
                  key={iv._id}
                  className="flex items-center gap-4 border border-border rounded-lg p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {iv.job?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(iv.scheduledDate)} at{" "}
                      {formatTime(iv.scheduledTime)} •{" "}
                      {iv.type.replace("_", " ")} • {iv.durationMinutes}min
                    </p>
                  </div>
                  <Badge
                    variant={
                      iv.status === "scheduled"
                        ? "primary"
                        : iv.status === "completed"
                          ? "success"
                          : "muted"
                    }
                  >
                    {iv.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "comments" && (
        <div className="card-base p-5">
          <div className="flex gap-3 mb-4">
            <Avatar
              name={profile?.fullName ?? "You"}
              src={profile?.avatarUrl}
              size="sm"
            />
            <div className="flex-1">
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Write a comment..."
                className="textarea-field"
                rows={2}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentBody.trim()}
                className="btn-primary mt-2"
              >
                <Send className="h-4 w-4" /> Post Comment
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c._id} className="flex gap-3 group">
                <Avatar
                  name={c.author?.fullName ?? "Unknown"}
                  src={c.author?.avatarUrl}
                  size="sm"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {c.author?.fullName ?? "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(new Date(c._creationTime).toISOString())}
                    </span>
                    {c.authorId === profile?.userId && (
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-foreground mt-1">{c.body}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No comments yet. Start the conversation!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        open={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Apply to Job"
        description="Select a job for this candidate"
        size="sm"
      >
        {openJobs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No open jobs available. Create a job first.
          </p>
        ) : (
          <>
            <Select
              value={selectedJob}
              onChange={setSelectedJob}
              placeholder="Select a job"
              options={openJobs.map((j) => ({
                value: j._id,
                label: `${j.title} — ${j.department}`,
              }))}
            />
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setApplyModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!selectedJob}
                className="btn-primary"
              >
                Apply
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
