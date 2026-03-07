import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const toggleFavorite = mutation({
  args: {
    userId: v.id("users"),
    franchiserId: v.id("franchiser"),
  },
  handler: async (ctx, { userId, franchiserId }) => {
    const existing = await ctx.db
      .query("userFavorites")
      .withIndex("by_user_franchiser", (q) =>
        q.eq("userId", userId).eq("franchiserId", franchiserId),
      )
      .first()

    if (existing) {
      await ctx.db.delete(existing._id)
      return { action: "removed" as const }
    }

    await ctx.db.insert("userFavorites", {
      userId,
      franchiserId,
      createdAt: Date.now(),
    })
    return { action: "added" as const }
  },
})

export const getUserFavorites = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const favorites = await ctx.db
      .query("userFavorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()

    const brandsWithFavorites = await Promise.all(
      favorites.map(async (fav) => {
        const brand = await ctx.db.get(fav.franchiserId)
        if (!brand) return null

        const logoUrl = brand.logoUrl ? await ctx.storage.getUrl(brand.logoUrl) : null

        // Get location count for display
        const locations = await ctx.db
          .query("franchiserLocations")
          .withIndex("by_franchiser", (q) => q.eq("franchiserId", brand._id))
          .collect()

        return {
          ...fav,
          brand: {
            ...brand,
            resolvedLogoUrl: logoUrl,
            locationCount: locations.length,
          },
        }
      }),
    )

    return brandsWithFavorites.filter(Boolean)
  },
})

export const isFavorite = query({
  args: {
    userId: v.id("users"),
    franchiserId: v.id("franchiser"),
  },
  handler: async (ctx, { userId, franchiserId }) => {
    const existing = await ctx.db
      .query("userFavorites")
      .withIndex("by_user_franchiser", (q) =>
        q.eq("userId", userId).eq("franchiserId", franchiserId),
      )
      .first()

    return !!existing
  },
})
