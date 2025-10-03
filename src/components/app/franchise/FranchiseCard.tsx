"use client";

import Image from "next/image";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FranchiseCardProps } from "@/types/ui";

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
  price,
  image,
  investorsCount,
  totalInvestment,
  totalInvested,
  fundingProgress,
  startDate,
  endDate,
  launchProgress,
  currentBalance,
  totalBudget,
  id,
  brandSlug,
  franchiseSlug,
  address,
  buildingName,
  doorNumber,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();

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

  const calculateLaunchProgress = () => {
    if (launchProgress !== undefined) return launchProgress;
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();

    if (now < start) return 0;
    if (now > end) return 100;

    return Math.round(((now - start) / (end - start)) * 100);
  };

  const renderCardContent = () => {
    switch (type) {
      case "fund":
        const investmentProgress = totalInvestment ? ((totalInvested || 0) / totalInvestment) * 100 : 0;
        
        return (
          <>
            <div className="flex justify-between items-center mt-2">
              <p className="font-semibold">{formatCurrency(totalInvestment || 0)}</p>
              <div className="text-sm text-blue-600 font-medium">
                {Math.round(investmentProgress)}% Invested
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 h-2 ">
                <div
                  className="bg-blue-500 h-2 "
                  style={{
                    width: `${investmentProgress}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>{formatCurrency(totalInvested || 0)} raised</span>
                <span>{formatCurrency((totalInvestment || 0) - (totalInvested || 0))} remaining</span>
              </div>
            </div>
          </>
        );
      case "launch":
        const progressPercent = calculateLaunchProgress();
        return (
          <>
            <div className="flex justify-between items-center mt-2">
              <p className="font-semibold">{formatCurrency(price)}</p>
              <div className="text-sm text-yellow-600 font-medium">
                {progressPercent}% Complete
              </div>
            </div>
            {startDate && endDate && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 h-2 ">
                  <div
                    className="bg-yellow-500 h-2  transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs  mt-1">
                  <span>Start: {formatDate(startDate)}</span>
                  <span>End: {formatDate(endDate)}</span>
                </div>
              </div>
            )}
            {/* <div className="mt-2">
              <span className="inline-block px-2 py-1  text-xs font-medium bg-blue-100 text-blue-800">
                Launching
              </span>
            </div> */}
          </>
        );
      case "live":
        const budgetProgress =
          ((currentBalance || 150000) / (totalBudget || 300000)) * 100;
        return (
          <>
            <div className="flex justify-between items-center mt-2">
              <p className="font-semibold">{formatCurrency(price)}</p>
              <div className="text-sm text-green-600 font-medium">
                {formatCurrency(price)} MRR
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-neutral-600 h-2 ">
                <div
                  className="bg-green-500 h-2 "
                  style={{ width: `${budgetProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>{formatCurrency(fundingProgress || 0)} Remaining</span>
                <span>{investorsCount} Franchisee</span>
              </div>
            </div>
            {/* <div className="mt-2">
              <span className="inline-block px-2 py-1  text-xs font-medium bg-purple-100 text-purple-800">
                Outlets
              </span>
            </div> */}
          </>
        );
    }
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

            {/* Stage Badge */}
          {stage && (
            <div className="mt-2 absolute  left-4 top-3">
              <span className={`inline-block px-4 uppercase font-bold py-2 text-xs font-medium rounded-full ${
                stage === 'funding' 
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                  : stage === 'launching'
                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                  : stage === 'ongoing'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
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
            className="absolute top-4 right-4 p-2  bg-background/80"
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