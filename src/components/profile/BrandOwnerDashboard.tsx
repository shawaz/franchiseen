"use client";

interface Business {
  id: string;
  name: string;
  description?: string;
}

interface BaseFranchise {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive' | 'pending';
}

interface FranchiseWithStats extends BaseFranchise {
  progress: number;
  raised: number;
  goal: number;
}

type Franchise = BaseFranchise | FranchiseWithStats;

// Type guard to check if a franchise has stats
function hasStats(franchise: Franchise): franchise is FranchiseWithStats {
  return 'progress' in franchise && 'raised' in franchise && 'goal' in franchise;
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
          {franchises.map((franchise) => (
            <div key={franchise.id} className="flex items-center justify-between border border-border rounded-md p-3">
              <div>
                <p className="font-medium">{franchise.name}</p>
                <p className="text-xs text-muted-foreground">Status: {franchise.status}</p>
              </div>
              {hasStats(franchise) ? (
                <div className="flex items-center gap-6">
                  <div className="w-40">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${franchise.progress}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{franchise.progress}% funded</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">AED {franchise.raised.toLocaleString()} / {franchise.goal.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Raised / Goal</p>
                  </div>
                  <button className="px-3 py-1.5 text-sm border border-border rounded-md">Manage</button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No funding data available</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
