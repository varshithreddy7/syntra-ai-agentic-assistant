import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createChat = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const chatId = await ctx.db.insert("chats", {
      title: args.title,
      userId,
      createdAt: Date.now(),
    });

    return chatId;
  },
});

export const deleteChat = mutation({
  args: {
    id: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const chat = await ctx.db.get(args.id);
    if (!chat || chat.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Delete all messages associated with this chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chart", (q) => q.eq("chatId", args.id))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the chat itself
    await ctx.db.delete(args.id);

    return { success: true };
  },
});

export const listChats = query({
  handler:async (ctx) =>{
    const identity = await ctx.auth.getUserIdentity();
    console.log(identity);
    if(!identity){
      throw new Error("Not authenticated")
    }
    
    const chats = await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return chats;
  },
})