"use client";

import React from "react";

interface Business {
  id: string;
  name: string;
  description?: string;
  logo?: string;
}

interface Franchise {
  id: string;
  name: string;
  location?: string;
  status: 'active' | 'inactive' | 'pending' | string;
  image?: string;
  progress: number;
  raised: number;
  goal: number;
}

interface BrandOwnerDashboardProps {
  business?: Business | null;
  franchises?: Franchise[];
}

export default function BrandOwnerDashboard({ business, franchises = [] }: BrandOwnerDashboardProps) {
  // Static UI with placeholder data
  const stats = [
    { label: "Total Franchises", value: franchises.length || 3 },
    { label: "Active Campaigns", value: 2 },
    { label: "Total Investors", value: 128 },
    { label: "Projected ROI", value: "8.5%" },
  ];

  const sampleFranchises: Franchise[] = [
    { 
      id: '1', 
      name: 'Dubai Mall Outlet', 
      location: 'Dubai',
      status: 'active', 
      progress: 65, 
      raised: 65000, 
      goal: 100000,
      image: '/franchise/retail-1.png'
    },
    { 
      id: '2', 
      name: 'Marina Branch', 
      location: 'Dubai Marina',
      status: 'pending', 
      progress: 30, 
      raised: 15000, 
      goal: 50000,
      image: '/franchise/retail-2.png'
    },
  ];

  const franchisesToDisplay = franchises && franchises.length > 0 ? franchises : sampleFranchises;

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{business?.name || "Brand Owner Dashboard"}</h1>
          <p className="text-muted-foreground">Overview of your brand performance</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Create Franchise</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-border rounded-lg p-4 bg-card">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="border border-border rounded-lg p-4 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Franchises</h2>
          <button className="text-sm text-primary">View All</button>
        </div>

        <div className="space-y-3">
          {franchisesToDisplay.map((f) => (
            <div key={f.id} className="flex items-center justify-between border border-border rounded-md p-3">
              <div>
                <p className="font-medium">{f.name}</p>
                <p className="text-xs text-muted-foreground">Status: {f.status}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-40">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${f.progress}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{f.progress}% funded</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {f.raised?.toLocaleString() || '0'} AED raised of {f.goal?.toLocaleString() || '0'} AED
                  </div>
                  <p className="text-xs text-muted-foreground">Raised / Goal</p>
                </div>
                <button className="px-3 py-1.5 text-sm border border-border rounded-md">Manage</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
