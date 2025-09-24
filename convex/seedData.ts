import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Sample franchise data based on the static data structure
const sampleFranchises = [
  {
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    logoUrl: "/logo/logo-1.svg",
    name: "Codelude",
    slug: "codelude",
    description: "Leading technology franchise specializing in software development and digital solutions.",
    industry: "Technology",
    category: "Software Development",
    website: "https://codelude.com",
    phone: "+1-555-0123",
    email: "info@codelude.com",
    socialMedia: {
      telegram: "https://t.me/codelude",
      instagram: "https://instagram.com/codelude",
      facebook: "https://facebook.com/codelude",
      twitter: "https://twitter.com/codelude",
      linkedin: "https://linkedin.com/company/codelude",
    },
    interiorImages: ["/franchise/retail-1.png", "/franchise/retail-2.png"],
    status: "approved" as const,
  },
  {
    walletAddress: "0x2345678901bcdef1234567890abcdef1234567890",
    logoUrl: "/logo/logo-2.svg",
    name: "Luxury Penthouse Franchise",
    slug: "luxury-penthouse",
    description: "Premium real estate franchise offering luxury penthouse properties in prime locations.",
    industry: "Real Estate",
    category: "Luxury Properties",
    website: "https://luxurypenthouse.com",
    phone: "+1-555-0124",
    email: "info@luxurypenthouse.com",
    socialMedia: {
      instagram: "https://instagram.com/luxurypenthouse",
      facebook: "https://facebook.com/luxurypenthouse",
      linkedin: "https://linkedin.com/company/luxurypenthouse",
    },
    interiorImages: ["/franchise/retail-3.png", "/franchise/retail-4.png"],
    status: "approved" as const,
  },
  {
    walletAddress: "0x3456789012cdef1234567890abcdef1234567890",
    logoUrl: "/logo/logo-3.svg",
    name: "Luxury Hotel Suites Franchise",
    slug: "luxury-hotel-suites",
    description: "High-end hospitality franchise providing luxury hotel suite experiences.",
    industry: "Hospitality",
    category: "Luxury Hotels",
    website: "https://luxuryhotelsuites.com",
    phone: "+1-555-0125",
    email: "info@luxuryhotelsuites.com",
    socialMedia: {
      instagram: "https://instagram.com/luxuryhotelsuites",
      facebook: "https://facebook.com/luxuryhotelsuites",
      linkedin: "https://linkedin.com/company/luxuryhotelsuites",
    },
    interiorImages: ["/franchise/retail-5.png", "/franchise/retail-6.png"],
    status: "approved" as const,
  },
];

const sampleLocations = [
  {
    country: "UAE",
    isNationwide: false,
    city: "Dubai",
    registrationCertificate: "cert-001",
    minArea: 1200,
    franchiseFee: 15000,
    setupCost: 30000,
    workingCapital: 10000,
    status: "active" as const,
  },
  {
    country: "USA",
    isNationwide: true,
    registrationCertificate: "cert-002",
    minArea: 2800,
    franchiseFee: 520000,
    setupCost: 100000,
    workingCapital: 50000,
    status: "active" as const,
  },
];

const sampleProducts = [
  {
    name: "Software Development Package",
    description: "Complete software development solution for franchisees",
    cost: 5000,
    price: 15000,
    images: ["/products/product-1.jpg", "/products/product-2.jpg"],
    category: "Software",
    status: "active" as const,
  },
  {
    name: "Luxury Property Management System",
    description: "Advanced property management system for luxury properties",
    cost: 10000,
    price: 25000,
    images: ["/products/product-3.jpg", "/products/product-4.jpg"],
    category: "Property Management",
    status: "active" as const,
  },
];

// Mutation to seed the database with sample data
export const seedFranchiseData = mutation({
  args: {},
  handler: async (ctx) => {
    const results = [];
    
    // Create franchisers
    for (const franchise of sampleFranchises) {
      const franchiserId = await ctx.db.insert("franchiser", {
        ...franchise,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      results.push({ type: "franchiser", id: franchiserId });
      
      // Create locations for each franchiser
      for (const location of sampleLocations) {
        const locationId = await ctx.db.insert("franchiserLocations", {
          franchiserId,
          ...location,
          createdAt: Date.now(),
        });
        results.push({ type: "location", id: locationId });
      }
      
      // Create products for each franchiser
      for (const product of sampleProducts) {
        const productId = await ctx.db.insert("franchiserProducts", {
          franchiserId,
          ...product,
          createdAt: Date.now(),
        });
        results.push({ type: "product", id: productId });
      }
    }
    
    return results;
  },
});

// Mutation to clear all franchise data (for testing)
export const clearFranchiseData = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all products first (due to foreign key constraints)
    const products = await ctx.db.query("franchiserProducts").collect();
    for (const product of products) {
      await ctx.db.delete(product._id);
    }
    
    // Delete all locations
    const locations = await ctx.db.query("franchiserLocations").collect();
    for (const location of locations) {
      await ctx.db.delete(location._id);
    }
    
    // Delete all franchisers
    const franchisers = await ctx.db.query("franchiser").collect();
    for (const franchiser of franchisers) {
      await ctx.db.delete(franchiser._id);
    }
    
    return { message: "All franchise data cleared" };
  },
});
