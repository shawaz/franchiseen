import { Franchise } from "@/app/(platform)/page";

export const fundingFranchises: Franchise[] = [
  {
    _id: "funding-1",
    logo: "/logo/logo-4.svg",
    title: "Codelude",
    location: "Downtown, Dubai, UAE",
    price: 15000,
    images: ["/franchise/retail-1.png"],
    rating: 4.8,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    availableFrom: "2023-06-01",
    type: "fund",
    returnRate: 8.5,
    investorsCount: 42,
    fundingGoal: 500000,
    fundingProgress: 250000,
    minimumInvestment: 15000,
  },
  // ... (rest of the fundingFranchises array)
];

export const launchingFranchises: Franchise[] = [
  {
    _id: "launching-1",
    logo: "/logo/logo-4.svg",
    title: "Luxury Penthouse Franchise",
    location: "DIFC",
    price: 520000,
    images: ["/franchise/retail-1.png"],
    rating: 4.9,
    bedrooms: 3,
    bathrooms: 3,
    squareFeet: 2800,
    yearBuilt: 2022,
    type: "launch",
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    launchProgress: 65,
  },
  // ... (rest of the launchingFranchises array)
];

export const outletsFranchises: Franchise[] = [
  {
    _id: "outlets-1",
    logo: "/logo/logo-4.svg",
    title: "Luxury Hotel Suites Franchise",
    location: "Downtown Dubai",
    price: 100000,
    images: ["/franchise/retail-1.png"],
    rating: 4.7,
    projectedAnnualYield: 12.5,
    type: "live",
    currentBalance: 150000,
    totalBudget: 300000,
    activeOutlets: 3,
  },
  // ... (rest of the outletsFranchises array)
];
