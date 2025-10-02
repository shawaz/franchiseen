"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  DollarSign, 
  TrendingUp, 
  RefreshCw, 
  Plus,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface IncomeRecord {
  id: string;
  type: 'platform_fee' | 'setup_contract' | 'marketing' | 'subscription';
  amount: number;
  description: string;
  source: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  transactionHash?: string;
}

interface IncomeSummary {
  platformFee: number;
  setupContract: number;
  marketing: number;
  subscription: number;
  total: number;
  monthlyTotal: number;
}

export default function IncomeTable() {
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [newRecord, setNewRecord] = useState<Partial<IncomeRecord>>({
    type: 'platform_fee',
    amount: 0,
    description: '',
    source: '',
    status: 'completed'
  });

  // Load income records from localStorage
  useEffect(() => {
    loadIncomeRecords();
  }, []);

  const loadIncomeRecords = () => {
    try {
      const storedRecords = localStorage.getItem('company_income_records');
      if (storedRecords) {
        const records = JSON.parse(storedRecords);
        setIncomeRecords(records);
        console.log('Loaded income records:', records);
      }
    } catch (error) {
      console.error('Error loading income records:', error);
    }
  };

  const saveIncomeRecords = (records: IncomeRecord[]) => {
    try {
      localStorage.setItem('company_income_records', JSON.stringify(records));
      setIncomeRecords(records);
    } catch (error) {
      console.error('Error saving income records:', error);
      toast.error('Failed to save income records');
    }
  };

  const calculateSummary = (): IncomeSummary => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const summary = incomeRecords.reduce((acc, record) => {
      if (record.status === 'completed') {
        acc[record.type as keyof typeof acc] += record.amount;
        acc.total += record.amount;

        // Check if record is from current month
        const recordDate = new Date(record.timestamp);
        if (recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear) {
          acc.monthlyTotal += record.amount;
        }
      }
      return acc;
    }, {
      platformFee: 0,
      setupContract: 0,
      marketing: 0,
      subscription: 0,
      total: 0,
      monthlyTotal: 0
    });

    return summary;
  };

  const addIncomeRecord = () => {
    if (!newRecord.type || !newRecord.amount || !newRecord.description || !newRecord.source) {
      toast.error('Please fill in all required fields');
      return;
    }

    const record: IncomeRecord = {
      id: `income_${Date.now()}`,
      type: newRecord.type as IncomeRecord['type'],
      amount: newRecord.amount,
      description: newRecord.description,
      source: newRecord.source,
      timestamp: new Date().toISOString(),
      status: newRecord.status as IncomeRecord['status'] || 'completed',
      transactionHash: newRecord.transactionHash
    };

    const updatedRecords = [record, ...incomeRecords];
    saveIncomeRecords(updatedRecords);
    
    setNewRecord({
      type: 'platform_fee',
      amount: 0,
      description: '',
      source: '',
      status: 'completed'
    });
    setIsAddingRecord(false);
    toast.success('Income record added successfully');
  };

  const updateIncomeRecord = (id: string, updates: Partial<IncomeRecord>) => {
    const updatedRecords = incomeRecords.map(record =>
      record.id === id ? { ...record, ...updates } : record
    );
    saveIncomeRecords(updatedRecords);
    setEditingRecord(null);
    toast.success('Income record updated successfully');
  };

  const deleteIncomeRecord = (id: string) => {
    const updatedRecords = incomeRecords.filter(record => record.id !== id);
    saveIncomeRecords(updatedRecords);
    toast.success('Income record deleted successfully');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'platform_fee': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'setup_contract': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'marketing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'subscription': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'platform_fee': return 'Platform Fee';
      case 'setup_contract': return 'Setup Contract';
      case 'marketing': return 'Marketing';
      case 'subscription': return 'Subscription';
      default: return type;
    }
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-6">
      {/* Income Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Platform Fees
                </p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(summary.platformFee)}
                </p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Setup Contracts
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(summary.setupContract)}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Marketing
                </p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(summary.marketing)}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Subscriptions
                </p>
                <p className="text-xl font-bold text-orange-600">
                  {formatCurrency(summary.subscription)}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Total Income
                </p>
                <p className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  {formatCurrency(summary.total)}
                </p>
                <p className="text-xs text-stone-500">
                  This month: {formatCurrency(summary.monthlyTotal)}
                </p>
              </div>
              <DollarSign className="h-6 w-6 text-stone-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income Records Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Income Records
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadIncomeRecords}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => setIsAddingRecord(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add New Record Form */}
          {isAddingRecord && (
            <div className="mb-6 p-4 border border-stone-200 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-stone-900/20">
              <h3 className="font-medium mb-4">Add New Income Record</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    value={newRecord.type}
                    onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value as IncomeRecord['type'] })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="platform_fee">Platform Fee</option>
                    <option value="setup_contract">Setup Contract</option>
                    <option value="marketing">Marketing</option>
                    <option value="subscription">Subscription</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newRecord.amount || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    value={newRecord.source || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, source: e.target.value })}
                    placeholder="e.g., Nike Store Dubai"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newRecord.description || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                    placeholder="e.g., 2% platform fee"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={addIncomeRecord}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsAddingRecord(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Income Records List */}
          {incomeRecords.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
              <p className="text-stone-600 dark:text-stone-400">No income records yet</p>
              <p className="text-sm text-stone-500 dark:text-stone-500">Add your first income record to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomeRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge className={getTypeColor(record.type)}>
                      {getTypeLabel(record.type)}
                    </Badge>
                    <div>
                      <p className="font-medium">{record.description}</p>
                      <p className="text-sm text-stone-600 dark:text-stone-400">
                        From: {record.source}
                      </p>
                      {record.transactionHash && (
                        <p className="text-xs text-stone-500 font-mono">
                          TX: {record.transactionHash.slice(0, 8)}...
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        +{formatCurrency(record.amount)}
                      </p>
                      <p className="text-sm text-stone-600 dark:text-stone-400">
                        {formatDate(record.timestamp)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingRecord(record.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteIncomeRecord(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
