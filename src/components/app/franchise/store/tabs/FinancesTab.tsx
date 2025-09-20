import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function FinancesTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Finances</h2>
      </div>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Budget Allocation</h3>
        <div className="space-y-4">
          {[
            { category: 'Franchisee Fee', amount: 20000, used: 0 },
            { category: 'Setup Cost', amount: 30000, used: 0 },
            { category: 'Working Capital', amount: 10000, used: 0 },
            { category: 'Salaries', amount: 10000, used: 0 },
            { category: 'Rent', amount: 5000, used: 0 },
            { category: 'Maintenance', amount: 2000, used: 0 },
          ].map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{item.category}</span>
                <span>${item.used.toLocaleString()} / ${item.amount.toLocaleString()}</span>
              </div>
              <Progress value={(item.used / item.amount) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
