import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const apps = await ctx.db.query("applications").collect();
    const result = [];
    for (const app of apps) {
      const candidate = await ctx.db.get(app.candidateId);
      const job = await ctx.db.get(app.jobId);
      result.push({ ...app, candidate, job });
    }
    return result;
  },
});

export const getByCandidate = query({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    const apps = await ctx.db
      .query("applications")
      .withIndex("by_candidate", (q) => q.eq("candidateId", args.candidateId))
      .collect();
    const result = [];
    for (const app of apps) {
      const job = await ctx.db.get(app.jobId);
      result.push({ ...app, job });
    }
    return result;
  },
});

export const create = mutation({
  args: {
    candidateId: v.id("candidates"),
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("applications")
      .withIndex("by_candidate", (q) => q.eq("candidateId", args.candidateId))
      .filter((q) => q.eq(q.field("jobId"), args.jobId))
      .unique();

    if (existing) {
      throw new Error("This candidate already applied to this job.");
    }

    return await ctx.db.insert("applications", {
      candidateId: args.candidateId,
      jobId: args.jobId,
      stage: "applied",
      rating: 0,
    });
  },
});

export const updateStage = mutation({
  args: {
    id: v.id("applications"),
    stage: v.union(
      v.literal("applied"),
      v.literal("screening"),
      v.literal("interview"),
      v.literal("offer"),
      v.literal("hired"),
      v.literal("rejected"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { stage: args.stage });
  },
});

export const remove = mutation({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
