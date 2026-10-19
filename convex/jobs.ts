import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("jobs").collect();
  },
});

export const getOpenJobs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    return await ctx.db.insert("jobs", {
      ...args,
      createdBy: userId ?? undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("jobs"),
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
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    const apps = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", args.id))
      .collect();
    for (const app of apps) {
      const interviews = await ctx.db
        .query("interviews")
        .withIndex("by_application", (q) => q.eq("applicationId", app._id))
        .collect();
      for (const iv of interviews) {
        await ctx.db.delete(iv._id);
      }
      await ctx.db.delete(app._id);
    }
    await ctx.db.delete(args.id);
  },
});

export const getAppCount = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const apps = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .collect();
    return apps.length;
  },
});