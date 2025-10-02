// Main types export file
export * from "./database";
export * from "./investment";
export * from "./franchise";
export * from "./ui";
export * from "./api";

// Re-export commonly used types for convenience (only aliases to avoid duplicates)
export type {
  InvestmentData as Investment,
} from "./investment";
