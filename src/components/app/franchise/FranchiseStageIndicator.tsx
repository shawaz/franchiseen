"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Rocket, 
  Activity, 
  XCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface FranchiseStageIndicatorProps {
  stage: 'funding' | 'launching' | 'ongoing' | 'closed';
  className?: string;
}

const stageConfig = {
  funding: {
    label: 'Funding',
    description: 'Raising capital and building investor base',
    icon: DollarSign,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-600 dark:text-yellow-400'
  },
  launching: {
    label: 'Launching',
    description: 'Setting up operations and preparing for launch',
    icon: Rocket,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  ongoing: {
    label: 'Ongoing',
    description: 'Franchise is operational and running',
    icon: Activity,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  closed: {
    label: 'Closed',
    description: 'Franchise operations have been terminated',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    borderColor: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400'
  }
};

export default function FranchiseStageIndicator({ stage, className = '' }: FranchiseStageIndicatorProps) {
  const config = stageConfig[stage];
  const Icon = config.icon;

  return (
    <Card className={`${config.borderColor} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${config.color}`}>
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg">{config.label}</h3>
              <Badge variant="outline" className={config.color}>
                {stage}
              </Badge>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              {config.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Stage progress component showing all stages
export function FranchiseStageProgress({ currentStage, className = '' }: { currentStage: string; className?: string }) {
  const stages = [
    { key: 'funding', label: 'Funding', icon: DollarSign },
    { key: 'launching', label: 'Launching', icon: Rocket },
    { key: 'ongoing', label: 'Ongoing', icon: Activity },
    { key: 'closed', label: 'Closed', icon: XCircle }
  ];

  const currentIndex = stages.findIndex(s => s.key === currentStage);

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="font-semibold text-lg">Franchise Progress</h3>
      <div className="flex items-center space-x-2">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div key={stage.key} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                ${isCompleted 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-stone-100 border-stone-300 text-stone-400 dark:bg-stone-800 dark:border-stone-600'
                }
              `}>
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : isCurrent ? (
                  <Clock className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <div className="ml-2">
                <div className={`text-sm font-medium ${
                  isCompleted || isCurrent 
                    ? 'text-stone-900 dark:text-stone-100' 
                    : 'text-stone-500 dark:text-stone-400'
                }`}>
                  {stage.label}
                </div>
              </div>
              {index < stages.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  isCompleted ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-600'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
