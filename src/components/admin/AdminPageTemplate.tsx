"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";

interface StatCard {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface AdminPageTemplateProps {
  title: string;
  description?: string;
  addButtonText?: string;
  onAddClick?: () => void;
  stats: StatCard[];
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: {
    label: string;
    value: string;
    options: FilterOption[];
    onValueChange: (value: string) => void;
  }[];
  children: React.ReactNode;
  className?: string;
}

export default function AdminPageTemplate({
  title,
  description,
  addButtonText = "Add New",
  onAddClick,
  stats,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters = [],
  children,
  className = "",
}: AdminPageTemplateProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {onAddClick && (
          <Button onClick={onAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            {addButtonText}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className={stat.color || "text-blue-500"}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <Card className="py-6 space-y-4 mb-16">
        <CardHeader>
          <div className="flex flex-col space-y-4">
            {/* Search and Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {filters.length > 0 && (
                <div className="flex gap-2">
                  {filters.map((filter, index) => (
                    <Select
                      key={index}
                      value={filter.value}
                      onValueChange={filter.onValueChange}
                    >
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder={`Filter by ${filter.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
