import HomeContent from "./HomeContent";

// Define the Franchise interface
export interface Franchise {
  _id: string | number;
  logo: string;
  title: string;
  location: string;
  price: number;
  images: string[];
  rating?: number;
  bedrooms?: number;
  bathrooms?: number;
  size?: string | number;
  squareFeet?: number;
  description?: string;
  type: "fund" | "launch" | "live";
  availableFrom?: string;
  returnRate?: string | number;
  investorsCount?: number;
  fundingGoal?: number;
  fundingProgress?: number;
  minimumInvestment?: number;
  yearBuilt?: number;
  startDate?: string;
  endDate?: string;
  launchProgress?: number;
  currentBalance?: number;
  totalBudget?: number;
  activeOutlets?: number;
  projectedAnnualYield?: number;
}

export default function Home() {
  return <HomeContent />;
}
