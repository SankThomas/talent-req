import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  teamMembers: defineTable({
    userId: v.string(),
    fullName: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("recruiter"),
      v.literal("hiring_manager"),
    ),
    avatarUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    department: v.optional(v.string()),
    bio: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  jobs: defineTable({
    title: v.string(),
    department: v.string(),
    location: v.optional(v.string()),
    employmentType: v.union(
      v.literal("full-time"),
      v.literal("part-time"),
      v.literal("contract"),
      v.literal("internship"),
    ),
    status: v.union(
      v.literal("open"),
      v.literal("closed"),
      v.literal("draft"),
      v.literal("on_hold"),
    ),
    description: v.optional(v.string()),
    requirements: v.optional(v.string()),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    createdBy: v.optional(v.string()),
  }).index("by_status", ["status"]),

  candidates: defineTable({
    fullName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    currentCompany: v.optional(v.string()),
    currentPosition: v.optional(v.string()),
    location: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    experienceYears: v.optional(v.number()),
    resumeUrl: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    source: v.string(),
    createdBy: v.optional(v.string()),
  }).index("by_email", ["email"]),

  applications: defineTable({
    candidateId: v.id("candidates"),
    jobId: v.id("jobs"),
    stage: v.union(
      v.literal("applied"),
      v.literal("screening"),
      v.literal("interview"),
      v.literal("offer"),
      v.literal("hired"),
      v.literal("rejected"),
    ),
    rating: v.optional(v.number()),
    coverLetter: v.optional(v.string()),
  })
    .index("by_candidate", ["candidateId"])
    .index("by_job", ["jobId"])
    .index("by_stage", ["stage"]),

  interviews: defineTable({
    applicationId: v.id("applications"),
    candidateId: v.id("candidates"),
    jobId: v.id("jobs"),
    interviewerId: v.optional(v.string()),
    scheduledDate: v.string(),
    scheduledTime: v.string(),
    durationMinutes: v.number(),
    type: v.union(
      v.literal("video"),
      v.literal("phone"),
      v.literal("in_person"),
      v.literal("technical"),
    ),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show"),
    ),
  })
    .index("by_application", ["applicationId"])
    .index("by_candidate", ["candidateId"])
    .index("by_date", ["scheduledDate"]),

  comments: defineTable({
    candidateId: v.optional(v.id("candidates")),
    jobId: v.optional(v.id("jobs")),
    authorId: v.optional(v.string()),
    body: v.string(),
  })
    .index("by_candidate", ["candidateId"])
    .index("by_job", ["jobId"]),

  notifications: defineTable({
    userId: v.optional(v.string()),
    title: v.string(),
    body: v.optional(v.string()),
    type: v.string(),
    read: v.boolean(),
    link: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});