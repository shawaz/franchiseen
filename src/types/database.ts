// Database entity types based on Convex schema
import type { Doc, Id } from "../../convex/_generated/dataModel";

// Core entity types from Convex
export type Franchiser = Doc<"franchiser">;
export type Franchise = Doc<"franchises">;
export type Investment = Doc<"investments">;
export type FranchiseLocation = Doc<"franchiserLocations">;
export type FranchiseProduct = Doc<"franchiserProducts">;
export type FranchiseShare = Doc<"franchiseShares">;
export type Invoice = Doc<"invoices">;
export type AdminUser = Doc<"adminUsers">;
export type AdminTeam = Doc<"adminTeam">;
export type Property = Doc<"properties">;
export type Lead = Doc<"leads">;
export type Country = Doc<"countries">;
export type City = Doc<"cities">;
export type Industry = Doc<"industries">;
export type Category = Doc<"categories">;
export type ProductCategory = Doc<"productCategories">;

// ID types for all entities
export type FranchiserId = Id<"franchiser">;
export type FranchiseId = Id<"franchises">;
export type InvestmentId = Id<"investments">;
export type FranchiseLocationId = Id<"franchiserLocations">;
export type FranchiseProductId = Id<"franchiserProducts">;
export type FranchiseShareId = Id<"franchiseShares">;
export type InvoiceId = Id<"invoices">;
export type AdminUserId = Id<"adminUsers">;
export type AdminTeamId = Id<"adminTeam">;
export type PropertyId = Id<"properties">;
export type LeadId = Id<"leads">;
export type CountryId = Id<"countries">;
export type CityId = Id<"cities">;
export type IndustryId = Id<"industries">;
export type CategoryId = Id<"categories">;
export type ProductCategoryId = Id<"productCategories">;

// Status and stage enums
export type FranchiserStatus = "draft" | "pending" | "approved" | "rejected";
export type FranchiseStatus = "pending" | "approved" | "active" | "suspended" | "terminated";
export type FranchiseStage = "funding" | "launching" | "ongoing" | "closed";
export type InvestmentStatus = "draft" | "active" | "completed" | "cancelled";
export type ShareStatus = "pending" | "confirmed" | "failed";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type AdminRole = "super_admin" | "admin" | "manager" | "member";
export type AdminUserStatus = "active" | "inactive" | "suspended";
export type PropertyStage = "listing" | "requested" | "blocked" | "rented" | "sold";
export type LeadStatus = "prospects" | "started" | "contacted" | "meeting" | "onboarded" | "rejected";
export type PropertyType = "commercial" | "retail" | "office" | "warehouse" | "mixed_use";
export type Priority = "low" | "medium" | "high" | "urgent";

// Contact information types
export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  company?: string;
}

export type LandlordContact = ContactInfo;

export type FranchiseeContact = ContactInfo;

// Location types
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface AddressInfo {
  address: string;
  coordinates: Coordinates;
  buildingName?: string;
  doorNumber?: string;
}

// Lease terms
export interface LeaseTerms {
  startDate: number;
  endDate: number;
  monthlyRent: number;
  securityDeposit: number;
  maintenanceResponsibility: string;
  renewalTerms?: string;
}

// Contact history
export interface ContactHistoryEntry {
  date: number;
  type: "call" | "email" | "meeting" | "inspection";
  notes: string;
  contactedBy: string;
  outcome?: string;
}

// Invoice items
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Admin department types
export type AdminDepartment = 
  | "management"
  | "operations"
  | "finance"
  | "people"
  | "marketing"
  | "sales"
  | "support"
  | "software";
