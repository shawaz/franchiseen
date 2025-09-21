import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function TransactionsTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Wallet Transactions</h3>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                  {i % 2 === 0 ? (
                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {i % 2 === 0 ? 'Received' : 'Sent'} Payment
                  </p>
                  <p className="text-sm text-stone-500">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${i % 2 === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                  {i % 2 === 0 ? '+' : '-'}${(i * 100).toLocaleString()}
                </p>
                <p className="text-sm text-stone-500">
                  {i % 2 === 0 ? 'From' : 'To'}: 0x1234...5678
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
