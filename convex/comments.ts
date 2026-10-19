import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const getByCandidate = query({
  args: { candidateId: v.id("candidates") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_candidate", (q) => q.eq("candidateId", args.candidateId))
      .collect();
    const sorted = comments.sort((a, b) => a._creationTime - b._creationTime);
    const result = [];
    for (const c of sorted) {
      let author = null;
      if (c.authorId) {
        author = await ctx.db
          .query("teamMembers")
          .withIndex("by_userId", (q) => q.eq("userId", c.authorId!))
          .unique();
      }
      result.push({ ...c, author });
    }
    return result;
  },
});

export const addComment = mutation({
  args: {
    candidateId: v.id("candidates"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    return await ctx.db.insert("comments", {
      candidateId: args.candidateId,
      authorId: userId ?? undefined,
      body: args.body,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
