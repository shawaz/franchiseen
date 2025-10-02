"use client";

import { useFranchiseFundraisingData } from "@/hooks/useFranchises";
import { useConvexImageUrl } from "@/hooks/useConvexImageUrl";
import { useCategoryById } from "@/hooks/useMasterData";
import FranchiseCard from "./FranchiseCard";
import type { FranchiseDisplayData } from "@/types/ui";
import { Id } from "../../../../convex/_generated/dataModel";

interface FranchiseCardWithDataProps {
  franchise: FranchiseDisplayData & {
    franchiser?: {
      logoUrl?: string;
      interiorImages?: string[];
      industry?: string;
      category?: string;
      name?: string;
      slug?: string;
    };
    investment?: {
      totalInvestment?: number;
      totalInvested?: number;
      sharesIssued?: number;
      sharesPurchased?: number;
      sharePrice?: number;
    };
  };
  activeTab: "fund" | "launch" | "live";
}

const FranchiseCardWithData: React.FC<FranchiseCardWithDataProps> = ({ franchise, activeTab }) => {
  // Get fundraising data for this specific franchise
  const fundraisingData = useFranchiseFundraisingData(franchise._id.toString());
  
  // Get proper image URLs using Convex hooks
  const logoUrl = useConvexImageUrl(franchise.franchiser?.logoUrl as Id<"_storage"> | undefined);
  const coverImageUrl = useConvexImageUrl(franchise.franchiser?.interiorImages?.[0] as Id<"_storage"> | undefined);
  
  // Get category name by ID
  const categoryData = useCategoryById(franchise.franchiser?.category as Id<"categories"> | undefined);

  // Update franchise data with real fundraising information
  const franchiseWithData: FranchiseDisplayData = {
    ...franchise,
    fundingGoal: fundraisingData?.totalInvestment || franchise.investment?.totalInvestment || franchise.fundingGoal || 500000,
    fundingProgress: fundraisingData?.invested || 0,
    investorsCount: fundraisingData?.shares?.length || 0,
  };

  return (
    <FranchiseCard
      key={franchiseWithData._id.toString()}
      id={franchiseWithData._id.toString()}
      type={activeTab}
      stage={franchiseWithData.stage}
      logo={logoUrl || "/logo/logo-4.svg"}
      title={franchise.franchiser?.name || franchiseWithData.title}
      industry={franchise.franchiser?.industry || franchiseWithData.industry || "Unknown Industry"}
      category={categoryData?.name || franchiseWithData.category || "Unknown Category"}
      price={franchise.investment?.sharePrice || franchiseWithData.price}
      image={coverImageUrl || "/images/placeholder-franchise.jpg"}
      size={franchiseWithData.squareFeet}
      returnRate={franchiseWithData.returnRate || 8}
      investorsCount={franchiseWithData.investorsCount || 0}
      totalInvestment={fundraisingData?.totalInvestment || franchise.investment?.totalInvestment || franchise.fundingGoal || 500000}
      totalInvested={fundraisingData?.totalInvested || franchise.investment?.totalInvested || 0}
      sharesIssued={fundraisingData?.totalShares || franchise.investment?.sharesIssued || 100000}
      sharesPurchased={fundraisingData?.sharesPurchased || franchise.investment?.sharesPurchased || 0}
      fundingGoal={franchiseWithData.fundingGoal || 500000}
      fundingProgress={franchiseWithData.fundingProgress || 0}
      startDate={franchiseWithData.startDate}
      endDate={franchiseWithData.endDate}
      launchProgress={franchiseWithData.launchProgress}
      currentBalance={franchiseWithData.currentBalance}
      totalBudget={franchiseWithData.totalBudget}
      activeOutlets={franchiseWithData.activeOutlets}
      brandSlug={franchise.franchiser?.slug}
      franchiseSlug={franchiseWithData.title}
    />
  );
};

export default FranchiseCardWithData;
