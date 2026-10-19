import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const interviews = await ctx.db
      .query("interviews")
      .withIndex("by_date")
      .collect();
    const sorted = interviews.sort((a, b) =>
      a.scheduledDate.localeCompare(b.scheduledDate),
    );
    const result = [];
    for (const iv of sorted) {
      const candidate = await ctx.db.get(iv.candidateId);
      const job = await ctx.db.get(iv.jobId);
      result.push({ ...iv, candidate, job });
    }
    return result;
  },
});

export const getByCandidate = query({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    const interviews = await ctx.db
      .query("interviews")
      .withIndex("by_candidate", (q) => q.eq("candidateId", args.candidateId))
      .collect();
    const result = [];
    for (const iv of interviews) {
      const job = await ctx.db.get(iv.jobId);
      result.push({ ...iv, job });
    }
    return result;
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const interviewId = await ctx.db.insert("interviews", {
      applicationId: args.applicationId,
      candidateId: args.candidateId,
      jobId: args.jobId,
      interviewerId: args.interviewerId,
      scheduledDate: args.scheduledDate,
      scheduledTime: args.scheduledTime,
      durationMinutes: args.durationMinutes,
      type: args.type,
      location: args.location,
      notes: args.notes,
      status: "scheduled",
    });

    if (args.interviewerId) {
      await ctx.db.insert("notifications", {
        userId: args.interviewerId,
        title: "New interview scheduled",
        body: `Interview on ${args.scheduledDate} at ${args.scheduledTime}`,
        type: "interview",
        read: false,
        link: "/interviews",
      });
    }

    return interviewId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("interviews"),
    status: v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const remove = mutation({
  args: { id: v.id("interviews") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
