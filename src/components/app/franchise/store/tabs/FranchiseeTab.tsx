import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface Franchisee {
  id: string;
  fullName: string;
  walletId: string;
  avatar: string;
  totalShares: number;
  totalInvested: number;
  isOfferActive: boolean;
  joinDate: string;
}

interface FranchiseeTabProps {
  franchisees: Franchisee[];
}

export function FranchiseeTab({ franchisees }: FranchiseeTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Franchisee</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {franchisees.map((franchisee) => (
          <Card key={franchisee.id} className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative h-12 w-12 rounded-full overflow-hidden">
                <Image
                  src={franchisee.avatar}
                  alt={franchisee.fullName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{franchisee.fullName}</h3>
                <p className="text-sm text-stone-500">
                  {franchisee.totalShares.toLocaleString()} shares • ${franchisee.totalInvested.toLocaleString()} invested
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Joined {new Date(franchisee.joinDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
