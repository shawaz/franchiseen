import HomeContent from "./HomeContent";
import type { FranchiseDisplayData } from "@/types/ui";

// Re-export for backward compatibility
export type Franchise = FranchiseDisplayData;

export default function Home() {
  return <HomeContent />;
}
