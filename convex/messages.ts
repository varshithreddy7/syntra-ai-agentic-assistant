import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chart", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();

    return messages;
  }
})

export const send = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string()
  },
  handler: async (ctx,args) => {
    const messageId = await ctx.db.insert("messages",{
      chatId: args.chatId,
      content: args.content, // Store content as-is
      role: "user",
      createdAt: Date.now(),
    });

    return messageId;
  }
});

export const store = mutation({
  args:{
    chatId: v.id("chats"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"))
  },
  handler: async (ctx, args) =>{
    // Clean and properly store content - handle all types of escapes
    const cleanContent = args.content
      .replace(/\\n/g, "\n")  // Convert escaped newlines back to actual newlines
      .replace(/\\\\/g, "\\") // Convert double backslashes to single
      .replace(/\\/g, "")     // Remove any remaining single backslashes
      .replace(/\\"/g, '"')   // Convert escaped quotes
      .replace(/\\'/g, "'")   // Convert escaped single quotes
      .replace(/\\t/g, "\t")  // Convert escaped tabs
      .replace(/\\r/g, "\r"); // Convert escaped carriage returns
    
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: cleanContent,
      role: args.role,
      createdAt: Date.now()
    })
    return messageId;
  }
});

export const getLastMessage = query({
  args: {
    chatId: v.id("chats")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Fetch the last message for this chat
    const lastMessage = await ctx.db
      .query("messages")
      .withIndex("by_chart", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .first();

    return lastMessage;
  }
});