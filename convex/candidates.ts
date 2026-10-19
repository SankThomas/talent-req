import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("candidates").collect();
  },
});

export const getById = query({
  args: { id: v.id("candidates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    fullName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    currentCompany: v.optional(v.string()),
    currentPosition: v.optional(v.string()),
    location: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    experienceYears: v.optional(v.number()),
    linkedinUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    return await ctx.db.insert("candidates", {
      fullName: args.fullName,
      email: args.email,
      phone: args.phone,
      currentCompany: args.currentCompany,
      currentPosition: args.currentPosition,
      location: args.location,
      skills: args.skills,
      experienceYears: args.experienceYears,
      linkedinUrl: args.linkedinUrl,
      websiteUrl: args.websiteUrl,
      notes: args.notes,
      source: args.source ?? "direct",
      createdBy: userId ?? undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("candidates"),
    fullName: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("candidates") },
  handler: async (ctx, args) => {
    const apps = await ctx.db
      .query("applications")
      .withIndex("by_candidate", (q) => q.eq("candidateId", args.id))
      .collect();
    for (const app of apps) {
      const interviews = await ctx.db
        .query("interviews")
        .withIndex("by_candidate", (q) => q.eq("candidateId", args.id))
        .collect();
      for (const iv of interviews) {
        await ctx.db.delete(iv._id);
      }
      await ctx.db.delete(app._id);
    }
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_candidate", (q) => q.eq("candidateId", args.id))
      .collect();
    for (const c of comments) {
      await ctx.db.delete(c._id);
    }
    await ctx.db.delete(args.id);
  },
});

export const setProfileImage = mutation({
  args: {
    id: v.id("candidates"),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.url === undefined) {
      await ctx.db.patch(args.id, { profileImageUrl: undefined });
    } else {
      await ctx.db.patch(args.id, { profileImageUrl: args.url });
    }
  },
});

export const setResumeUrl = mutation({
  args: {
    id: v.id("candidates"),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.url === undefined) {
      await ctx.db.patch(args.id, { resumeUrl: undefined });
    } else {
      await ctx.db.patch(args.id, { resumeUrl: args.url });
    }
  },
});
