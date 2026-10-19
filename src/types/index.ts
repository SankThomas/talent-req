import type { Doc, Id } from "../../convex/_generated/dataModel";

export type UserRole = "admin" | "recruiter" | "hiring_manager";
export type JobStatus = "open" | "closed" | "draft" | "on_hold";
export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship";
export type ApplicationStage =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";
export type InterviewType = "video" | "phone" | "in_person" | "technical";
export type InterviewStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show";

export type TeamMember = Doc<"teamMembers">;
export type Job = Doc<"jobs">;
export type Candidate = Doc<"candidates">;
export type Application = Doc<"applications">;
export type Interview = Doc<"interviews">;
export type Comment = Doc<"comments">;
export type Notification = Doc<"notifications">;

export interface ApplicationWithRelations extends Application {
  candidate?: Candidate;
  job?: Job;
}

export interface InterviewWithRelations extends Interview {
  candidate?: Candidate;
  job?: Job;
}

export interface CommentWithAuthor extends Comment {
  author?: TeamMember | null;
}

export const STAGE_ORDER: ApplicationStage[] = [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
];

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

export const STAGE_COLORS: Record<ApplicationStage, string> = {
  applied: "stage-applied",
  screening: "stage-screening",
  interview: "stage-interview",
  offer: "stage-offer",
  hired: "stage-hired",
  rejected: "stage-rejected",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  recruiter: "Recruiter",
  hiring_manager: "Hiring Manager",
};

export type { Id };
