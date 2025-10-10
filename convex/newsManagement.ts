import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to get all news articles
export const getAllNews = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("news")
      .order("desc")
      .collect();
  },
});

// Query to get published news articles (for public view)
export const getPublishedNews = query({
  args: {
    category: v.optional(v.union(
      v.literal("company_news"),
      v.literal("industry_insights"),
      v.literal("success_stories"),
      v.literal("product_updates"),
      v.literal("tips_guides"),
      v.literal("announcements")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("news")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc");

    let results = await query.collect();

    // Filter by category if provided
    if (args.category) {
      results = results.filter((article) => article.category === args.category);
    }

    // Sort by publishedAt
    results.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return dateB - dateA;
    });

    // Apply limit if provided
    if (args.limit) {
      results = results.slice(0, args.limit);
    }

    return results;
  },
});

// Query to get featured news articles
export const getFeaturedNews = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db
      .query("news")
      .withIndex("by_isFeatured", (q) => q.eq("isFeatured", true))
      .filter((q) => q.eq(q.field("status"), "published"))
      .collect();

    // Sort by publishedAt
    results.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return dateB - dateA;
    });

    // Apply limit if provided
    if (args.limit) {
      results = results.slice(0, args.limit);
    }

    return results;
  },
});

// Query to get news by slug (for single article view)
export const getNewsBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("news")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Query to get news by category
export const getNewsByCategory = query({
  args: { 
    category: v.union(
      v.literal("company_news"),
      v.literal("industry_insights"),
      v.literal("success_stories"),
      v.literal("product_updates"),
      v.literal("tips_guides"),
      v.literal("announcements")
    )
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("news")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();

    // Sort by publishedAt for published articles, createdAt for others
    results.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return dateB - dateA;
    });

    return results;
  },
});

// Query to get news statistics
export const getNewsStatistics = query({
  args: {},
  handler: async (ctx) => {
    const allNews = await ctx.db.query("news").collect();
    
    const stats = {
      total: allNews.length,
      byStatus: {
        draft: allNews.filter(n => n.status === "draft").length,
        published: allNews.filter(n => n.status === "published").length,
        archived: allNews.filter(n => n.status === "archived").length,
      },
      byCategory: {
        company_news: allNews.filter(n => n.category === "company_news").length,
        industry_insights: allNews.filter(n => n.category === "industry_insights").length,
        success_stories: allNews.filter(n => n.category === "success_stories").length,
        product_updates: allNews.filter(n => n.category === "product_updates").length,
        tips_guides: allNews.filter(n => n.category === "tips_guides").length,
        announcements: allNews.filter(n => n.category === "announcements").length,
      },
      totalViews: allNews.reduce((sum, n) => sum + n.views, 0),
      totalLikes: allNews.reduce((sum, n) => sum + n.likes, 0),
      featured: allNews.filter(n => n.isFeatured).length,
    };

    return stats;
  },
});

// Mutation to create a news article
export const createNews = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    featuredImage: v.optional(v.id("_storage")),
    images: v.optional(v.array(v.id("_storage"))),
    category: v.union(
      v.literal("company_news"),
      v.literal("industry_insights"),
      v.literal("success_stories"),
      v.literal("product_updates"),
      v.literal("tips_guides"),
      v.literal("announcements")
    ),
    tags: v.array(v.string()),
    authorId: v.optional(v.string()),
    authorName: v.string(),
    authorAvatar: v.optional(v.id("_storage")),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    )),
    publishedAt: v.optional(v.number()),
    scheduledFor: v.optional(v.number()),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    metaKeywords: v.optional(v.array(v.string())),
    isFeatured: v.optional(v.boolean()),
    allowComments: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const newsId = await ctx.db.insert("news", {
      title: args.title,
      slug: args.slug,
      excerpt: args.excerpt,
      content: args.content,
      featuredImage: args.featuredImage,
      images: args.images || [],
      category: args.category,
      tags: args.tags,
      authorId: args.authorId,
      authorName: args.authorName,
      authorAvatar: args.authorAvatar,
      status: args.status || "draft",
      publishedAt: args.status === "published" ? (args.publishedAt || now) : undefined,
      scheduledFor: args.scheduledFor,
      metaTitle: args.metaTitle,
      metaDescription: args.metaDescription,
      metaKeywords: args.metaKeywords || [],
      views: 0,
      likes: 0,
      isFeatured: args.isFeatured || false,
      allowComments: args.allowComments !== undefined ? args.allowComments : true,
      createdAt: now,
      updatedAt: now,
    });

    return newsId;
  },
});

// Mutation to update a news article
export const updateNews = mutation({
  args: {
    newsId: v.id("news"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    featuredImage: v.optional(v.id("_storage")),
    images: v.optional(v.array(v.id("_storage"))),
    category: v.optional(v.union(
      v.literal("company_news"),
      v.literal("industry_insights"),
      v.literal("success_stories"),
      v.literal("product_updates"),
      v.literal("tips_guides"),
      v.literal("announcements")
    )),
    tags: v.optional(v.array(v.string())),
    authorId: v.optional(v.string()),
    authorName: v.optional(v.string()),
    authorAvatar: v.optional(v.id("_storage")),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    )),
    publishedAt: v.optional(v.number()),
    scheduledFor: v.optional(v.number()),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    metaKeywords: v.optional(v.array(v.string())),
    isFeatured: v.optional(v.boolean()),
    allowComments: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { newsId, ...updates } = args;
    const now = Date.now();

    const existingNews = await ctx.db.get(newsId);
    if (!existingNews) {
      throw new Error("News article not found");
    }

    // If status is being changed to published and publishedAt is not set, set it now
    if (updates.status === "published" && !existingNews.publishedAt && !updates.publishedAt) {
      updates.publishedAt = now;
    }

    await ctx.db.patch(newsId, {
      ...updates,
      updatedAt: now,
    });

    return newsId;
  },
});

// Mutation to update news status
export const updateNewsStatus = mutation({
  args: {
    newsId: v.id("news"),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existingNews = await ctx.db.get(args.newsId);
    
    if (!existingNews) {
      throw new Error("News article not found");
    }

    const updates: any = {
      status: args.status,
      updatedAt: now,
    };

    // If publishing and publishedAt is not set, set it now
    if (args.status === "published" && !existingNews.publishedAt) {
      updates.publishedAt = now;
    }

    await ctx.db.patch(args.newsId, updates);
    return args.newsId;
  },
});

// Mutation to delete a news article
export const deleteNews = mutation({
  args: {
    newsId: v.id("news"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.newsId);
  },
});

// Mutation to increment views
export const incrementViews = mutation({
  args: {
    newsId: v.id("news"),
  },
  handler: async (ctx, args) => {
    const news = await ctx.db.get(args.newsId);
    if (!news) {
      throw new Error("News article not found");
    }

    await ctx.db.patch(args.newsId, {
      views: news.views + 1,
    });
  },
});

// Mutation to increment likes
export const incrementLikes = mutation({
  args: {
    newsId: v.id("news"),
  },
  handler: async (ctx, args) => {
    const news = await ctx.db.get(args.newsId);
    if (!news) {
      throw new Error("News article not found");
    }

    await ctx.db.patch(args.newsId, {
      likes: news.likes + 1,
    });
  },
});

// Mutation to toggle featured status
export const toggleFeatured = mutation({
  args: {
    newsId: v.id("news"),
  },
  handler: async (ctx, args) => {
    const news = await ctx.db.get(args.newsId);
    if (!news) {
      throw new Error("News article not found");
    }

    await ctx.db.patch(args.newsId, {
      isFeatured: !news.isFeatured,
      updatedAt: Date.now(),
    });
  },
});

