import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "../../ui/card";

const BusinessCard: React.FC<{
  business: {
    id: string;
    name: string;
    logo_url: string;
    industry: string;
    category: string;
    costPerArea?: number;
    min_area?: number;
  };
}> = ({ business }) => {
  

  return (
    <Card className="p-6 ">
      <Link href={`/business/${business.id}/franchise`} className="block">
        <div className="flex justify-center items-center gap-4 mb-5">
          <div className="relative overflow-hidden h-14 w-14 border border-stone-200 dark:border-stone-800/50">
            <Image
              src={business?.logo_url || "/logo/logo-2.svg"}
              alt="Business Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex-1 items-center">
            <h1 className="text-xl font-bold">
              {business?.name || "Business Name"}
            </h1>
            <div className="text-gray-500 dark:text-stone-400 text-sm mt-1">
              {business.category}
              {/* {business.category} • {business.industry} */}
            </div>
          </div>
        </div>

        <div className="mt-5 gap-3 flex justify-evenly">
          <div className="space-y-1 py-2 border w-full text-center">
            <p className="font-bold">
              {"-"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Funding</p>
          </div>
          <div className="space-y-1 py-2 border w-full text-center">
            <p className="font-bold">
              {"-"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Launching
            </p>
          </div>
          <div className="space-y-1 py-2 border w-full text-center">
            <p className="font-bold">
              {"-"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
          </div>
        </div>

      </Link>
    </Card>
  );
};

export default BusinessCard;
