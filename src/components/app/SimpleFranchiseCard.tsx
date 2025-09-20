"use client";

import Image from "next/image";
import { Heart, MapPin, TrendingUp } from "lucide-react";
import { useState } from "react";

export interface SimpleFranchiseCardProps {
  title: string;
  location: string;
  price: number;
  image: string;
  rating?: number;
  returnRate?: number;
  type?: "fund" | "launch" | "live";
}

const SimpleFranchiseCard: React.FC<SimpleFranchiseCardProps> = ({
  title,
  location,
  price,
  image,
  rating = 4.5,
  returnRate = 8.5,
  type = "fund",
}) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = () => {
    switch (type) {
      case 'fund':
        return 'bg-blue-100 text-blue-800';
      case 'launch':
        return 'bg-yellow-100 text-yellow-800';
      case 'live':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = () => {
    switch (type) {
      case 'fund':
        return 'Funding';
      case 'launch':
        return 'Launching';
      case 'live':
        return 'Live';
      default:
        return 'Active';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      {/* Image Section */}
      <div className="relative aspect-video bg-gray-100">
        <Image
          src={image || '/placeholder-franchise.jpg'}
          alt={title}
          fill
          className="object-cover"
        />
        <button
          onClick={handleLikeClick}
          className={`absolute top-3 right-3 p-2 rounded-full ${
            isLiked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700'
          }`}
          aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>
        <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
          {getStatusLabel()}
        </span>
        <span className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center">
          ★ {rating.toFixed(1)}
        </span>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-2 pr-2">{title}</h3>
          <div className="text-right">
            <p className="text-lg font-bold">{formatPrice(price)}</p>
            <p className="text-xs text-gray-500">per share</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          {location}
        </p>

        <div className="flex items-center text-sm text-gray-600 mb-3">
          <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
          <span>{returnRate}% projected return</span>
        </div>

        <button className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
};

export default SimpleFranchiseCard;
