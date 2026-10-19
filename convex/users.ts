import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("teamMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const createOrUpdateProfile = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("recruiter"),
      v.literal("hiring_manager"),
    ),
    phone: v.optional(v.string()),
    department: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("teamMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        fullName: args.fullName,
        email: args.email,
        role: args.role,
        phone: args.phone,
        department: args.department,
        bio: args.bio,
        avatarUrl: args.avatarUrl,
      });
      return existing._id;
    }

    return await ctx.db.insert("teamMembers", {
      userId,
      fullName: args.fullName,
      email: args.email,
      role: args.role,
      phone: args.phone,
      department: args.department,
      bio: args.bio,
      avatarUrl: args.avatarUrl,
    });
  },
});

export const updateProfile = mutation({
  args: {
    fullName: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("recruiter"),
      v.literal("hiring_manager"),
    ),
    phone: v.optional(v.string()),
    department: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("teamMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!existing) throw new Error("Profile not found");

    await ctx.db.patch(existing._id, {
      fullName: args.fullName,
      role: args.role,
      phone: args.phone,
      department: args.department,
      bio: args.bio,
    });
  },
});

export const getAllTeamMembers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("teamMembers").collect();
  },
});

export const getUserId = action({
  args: {},
  handler: async (ctx) => {
    return await auth.getUserId(ctx);
  },
});
