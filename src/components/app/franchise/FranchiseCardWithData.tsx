"use client";

import { useFranchiseFundraisingData } from "@/hooks/useFranchises";
import { useConvexImageUrl } from "@/hooks/useConvexImageUrl";
import { useCategoryById, useIndustryById } from "@/hooks/useMasterData";
import { useFranchiseWallet } from "@/hooks/useFranchiseWallet";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
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

const FranchiseCardWithData: React.FC<FranchiseCardWithDataProps> = ({ franchise }) => {
  // Get fundraising data for this specific franchise
  const fundraisingData = useFranchiseFundraisingData(franchise.title); // franchise.title is the franchiseSlug
  
  // Get franchise wallet data for launching and ongoing stages
  const { wallet: franchiseWallet } = useFranchiseWallet({ franchiseId: franchise._id });
  
  // Get franchise token data
  const franchiseToken = useQuery(api.tokenManagement.getFranchiseToken, { 
    franchiseId: franchise._id as Id<"franchises"> 
  });
  
  // Get proper image URLs using Convex hooks
  const logoUrl = useConvexImageUrl(franchise.franchiser?.logoUrl as Id<"_storage"> | undefined);
  const coverImageUrl = useConvexImageUrl(franchise.franchiser?.interiorImages?.[0] as Id<"_storage"> | undefined);
  
  // Get category and industry names by ID
  const categoryData = useCategoryById(franchise.franchiser?.category as Id<"categories"> | undefined);
  const industryData = useIndustryById(franchise.franchiser?.industry as Id<"industries"> | undefined);


  // Calculate stage-specific data
  const totalBudget = franchise.investment?.totalInvestment || 500000;
  
  // For funding stage, use raised amount from fundraising data
  // For launching/ongoing stages, use franchise wallet balance
  let currentWalletBalance = 0;
  if (franchise.stage === 'funding') {
    // Use raised amount for funding stage
    currentWalletBalance = fundraisingData?.totalInvested || 0;
  } else {
    // Use franchise wallet balance for launching/ongoing stages
    currentWalletBalance = (franchiseWallet as { usdBalance?: number } | null)?.usdBalance || 0;
  }
  const totalShares = franchiseToken?.totalSupply || franchise.investment?.sharesIssued || 100000;
  const sharesRemaining = totalShares - (fundraisingData?.sharesIssued || 0);
  const estimatedMonthlyRevenue = (franchise.franchiser as { estimatedMonthlyRevenue?: number } | undefined)?.estimatedMonthlyRevenue || 0;
  const currentMonthlyRevenue = (franchiseWallet as { monthlyRevenue?: number } | null)?.monthlyRevenue || 0;

  // Update franchise data with real fundraising information
  const franchiseWithData: FranchiseDisplayData = {
    ...franchise,
    fundingGoal: fundraisingData?.totalInvestment || franchise.investment?.totalInvestment || franchise.fundingGoal || 500000,
    fundingProgress: fundraisingData?.invested || 0,
    investorsCount: (franchise as { investorsCount?: number }).investorsCount || fundraisingData?.shares?.length || 0,
    // Add start and end dates for launching stage
    startDate: franchise.stage === 'launching' ? new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString() : undefined,
    endDate: franchise.stage === 'launching' ? new Date(Date.now() + (75 * 24 * 60 * 60 * 1000)).toISOString() : undefined,
    // Add token and revenue data
    tokenName: franchiseToken?.tokenName || `${franchise.title} Tokens`,
    tokenSymbol: franchiseToken?.tokenSymbol || 'FRANCHISE',
    totalBudget,
    currentWalletBalance,
    totalShares,
    sharesRemaining,
    estimatedMonthlyRevenue,
    currentMonthlyRevenue,
  };

  // Determine card type based on actual franchise stage, not user's selected tab
  const getCardType = (stage: string | undefined): "fund" | "launch" | "live" => {
    switch (stage) {
      case 'funding':
        return 'fund';
      case 'launching':
        return 'launch';
      case 'ongoing':
      case 'closed':
        return 'live';
      default:
        return 'fund'; // Default to fund for unknown stages
    }
  };

  return (
    <FranchiseCard
      key={franchiseWithData._id.toString()}
      id={franchiseWithData._id.toString()}
      type={getCardType(franchiseWithData.stage)}
      stage={franchiseWithData.stage}
      logo={logoUrl || "/logo/logo-4.svg"}
      title={franchiseWithData.tokenName || franchise.franchiser?.name || franchiseWithData.title}
      industry={franchise.franchiser?.industry || franchiseWithData.industry || "Unknown Industry"}
      industryName={industryData?.name || franchise.franchiser?.industry || franchiseWithData.industry || "Unknown Industry"}
      category={franchise.franchiser?.category || franchiseWithData.category || "Unknown Category"}
      categoryName={categoryData?.name || franchise.franchiser?.category || franchiseWithData.category || "Unknown Category"}
      price={franchiseToken?.sharePrice || 1.00}
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
      currentBalance={franchiseWithData.currentWalletBalance}
      totalBudget={franchiseWithData.totalBudget}
      totalShares={franchiseWithData.totalShares}
      sharesRemaining={franchiseWithData.sharesRemaining}
      estimatedMonthlyRevenue={franchiseWithData.estimatedMonthlyRevenue}
      currentMonthlyRevenue={franchiseWithData.currentMonthlyRevenue}
      brandSlug={franchise.franchiser?.slug}
      franchiseSlug={franchiseWithData.title}
      address={franchiseWithData.location || "Address not available"}
      buildingName={franchiseWithData.buildingName}
      doorNumber={franchiseWithData.doorNumber}
    />
  );
};

export default FranchiseCardWithData;
