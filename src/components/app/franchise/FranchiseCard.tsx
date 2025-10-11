"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { FranchiseCardProps } from "@/types/ui";
import { Heart } from "lucide-react";
import { useState } from "react";

// Helper function to validate URLs
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const FranchiseCard: React.FC<FranchiseCardProps> = ({
  type,
  stage,
  logo,
  title,
  industry,
  industryName,
  category,
  categoryName,
  image,
  totalInvestment,
  startDate,
  endDate,
  currentBalance,
  totalBudget,
  sharesRemaining,
  estimatedMonthlyRevenue,
  currentMonthlyRevenue,
  id,
  brandSlug,
  franchiseSlug,
  address,
  buildingName,
  doorNumber,
}) => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };


  const renderCardContent = () => {
    // Always show total budget/token issued as first value
    const firstValue = totalBudget || totalInvestment || 0;
    
    // Progress bar calculation: How much has been raised vs total investment
    // For funding stage: show how much has been raised
    // For other stages: show completion status
    let progressPercentage = 0;
    
    // For all stages, show progress based on current balance vs total investment
    const raisedAmount = currentBalance || 0; // Current balance is what has been raised
    progressPercentage = (totalInvestment || 0) > 0 ? (raisedAmount / (totalInvestment || 0)) * 100 : 0;


    return (
      <>
       {/* Stage-specific data */}
       <div className="mt-3 space-y-2">
          {stage === 'funding' && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">EMR (Estimated Monthly Revenue)</span>
                <span className="font-semibold text-green-600">{formatCurrency(estimatedMonthlyRevenue || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shares Remaining</span>
                <span className="font-semibold text-blue-600">{sharesRemaining || 0}</span>
              </div>
            </>
          )}

          {stage === 'launching' && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Start Date</span>
                <span className="font-semibold">{startDate ? formatDate(startDate) : 'TBD'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">End Date</span>
                <span className="font-semibold">{endDate ? formatDate(endDate) : 'TBD'}</span>
              </div>
            </>
          )}

          {stage === 'ongoing' && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">EMR (Estimated Monthly Revenue)</span>
                <span className="font-semibold text-green-600">{formatCurrency(estimatedMonthlyRevenue || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">CMR (Current Monthly Revenue)</span>
                <span className="font-semibold text-blue-600">{formatCurrency(currentMonthlyRevenue || 0)}</span>
              </div>
            </>
          )}

          {stage === 'closed' && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status</span>
              <span className="font-semibold text-gray-600">Project Completed</span>
            </div>
          )}
        </div>
        

        {/* Progress Bar - Funding Progress */}
        <div className="mt-2">
          {/* <div className="flex justify-between text-sm mb-2">
            <span>{progressLabel}</span>
            <span>{formatCurrency(totalInvestment || 0)} Goal</span>
          </div> */}
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-2 transition-all duration-300 ${
                stage === 'funding' ? 'bg-blue-500' :
                stage === 'launching' ? 'bg-yellow-500' :
                stage === 'ongoing' ? 'bg-green-500' :
                'bg-gray-500'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          
        </div>

        {/* First value - show total budget and current balance */}
        <div className="flex justify-between items-center mt-2">
        <p className="font-semibold">{formatCurrency(currentBalance || 0)} </p>
          <p className="font-semibold">{formatCurrency(firstValue)} </p>
          {/* <div className="text-sm font-medium">
            {stage === 'funding' && <span className="text-blue-600">Funding</span>}
            {stage === 'launching' && <span className="text-yellow-600">Launching</span>}
            {stage === 'ongoing' && <span className="text-green-600">Ongoing</span>}
            {stage === 'closed' && <span className="text-gray-600">Closed</span>}
            {!stage && <span className="text-blue-600">Funding</span>}
          </div> */}
        </div>

       
      </>
    );
  };

  // Determine the navigation path based on franchise type
  const getNavigationPath = () => {
    // Use the correct [brandSlug]/[franchiseSlug] format
    if (brandSlug && franchiseSlug) {
      return `/${brandSlug}/${franchiseSlug}`;
    }
    
    // Fallback to old format if brandSlug or franchiseSlug is not available
    const baseId = id
      ? id.toString().replace(/^(fund-|launch-|live-)/, "")
      : "1";

    switch (type) {
      case "fund":
        return `/franchise/${baseId}`;
      case "launch":
        return `/franchise/launching-${baseId}`;
      case "live":
        return `/franchise/outlets-${baseId}`;
      default:
        return `/franchise/funding-${baseId}`;
    }
  };

  // Use the franchise object to avoid unused variable warning
  console.log("Rendering franchise:", franchiseSlug || title);

  return (
    <>
      <div
        className=" overflow-hidden bg-card border border-border hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => router.push(getNavigationPath())}
      >
        <div className="relative">
          {image && image.trim() !== "" && !image.startsWith("blob:") && isValidUrl(image) ? (
            <Image
              src={image}
              alt={title}
              width={400}
              height={400}
              className="w-full h-72 object-cover"
              unoptimized={image.startsWith("https://images.unsplash.com")}
            />
          ) : (
            <div className="w-full h-48 bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">Image not available</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            {stage && (
              <div className="mt-2 absolute  left-4 top-3">
                <span className={`inline-block px-4 uppercase font-bold py-2 text-xs font-medium rounded-full ${
                  stage === 'funding' 
                    ? 'bg-purple-100 text-purple-800 '
                    : stage === 'launching'
                    ? 'bg-orange-100 text-orange-800 '
                    : stage === 'ongoing'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800 '
                }`}>
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </span>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              className="absolute rounded-full border border-border cursor-pointer top-4 right-4 p-2  bg-background/80"
            >
              <Heart
                size={20}
                className={isFavorite ? "fill-destructive text-destructive" : ""}
              />
            </button>
          </div>
         
        </div>
        <div className="p-4">
          <div className="flex items-center">
            {logo && logo.trim() !== "" && isValidUrl(logo) ? (
              <Image
                src={logo}
                alt=""
                width={35}
                height={35}
                className=" mr-4"
                unoptimized
              />
            ) : (
              <div className="w-[30px] h-[30px] bg-muted rounded mr-4 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Logo</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{franchiseSlug || title}</h3>
              <p className="text-sm text-muted-foreground">
                {industryName || industry} • {categoryName || category}
              </p>
              
            </div>
            
          </div>
          <div>
          {(buildingName || doorNumber) && (
                <p className="text-sm text-muted-foreground mt-2 mb-1">
                  {buildingName && doorNumber ? (
                    ` ${buildingName}, Door ${doorNumber}`
                  ) : buildingName ? (
                    `🏢 ${buildingName}`
                  ) : (
                    `🚪 Door ${doorNumber}`
                  )}
                </p>
              )}
          {address && (
                <p className="text-sm text-muted-foreground mb-2 mt-1 truncate" title={address}>
                  {address}
                </p>
              )}
              

          </div>
          {renderCardContent()}
        </div>
      </div>

      {/* Property details now shown on property page */}
    </>
  );
};

export default FranchiseCard;