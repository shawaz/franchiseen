"use client";

import React from "react";

interface BrandOwnerDashboardProps {
  convexUser?: any;
  business?: any;
  franchises?: any[];
  brandSlug?: string;
}

export default function BrandOwnerDashboard({ convexUser, business, franchises = [], brandSlug }: BrandOwnerDashboardProps) {
  // Static UI with placeholder data
  const stats = [
    { label: "Total Franchises", value: franchises.length || 3 },
    { label: "Active Campaigns", value: 2 },
    { label: "Total Investors", value: 128 },
    { label: "Projected ROI", value: "8.5%" },
  ];

  const sampleFranchises = franchises.length ? franchises : [
    { id: "f1", name: "Downtown Cafe", status: "Funding", progress: 65, raised: 120000, goal: 200000 },
    { id: "f2", name: "Marina Kiosk", status: "Launching", progress: 40, raised: 60000, goal: 150000 },
    { id: "f3", name: "Mall Outlet", status: "Live", progress: 100, raised: 300000, goal: 300000 },
  ];

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
          {sampleFranchises.map((f) => (
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
                  <p className="text-sm font-medium">AED {f.raised.toLocaleString()} / {f.goal.toLocaleString()}</p>
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
