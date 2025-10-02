"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMutation } from 'convex/react';
import { api } from '../../../../../../../convex/_generated/api';
import { Upload, Download, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ImportResult {
  success: boolean;
  leadId?: string;
  email: string;
  error?: string;
}

interface ImportBatch {
  totalProcessed: number;
  successful: number;
  failed: number;
  results: ImportResult[];
}

export default function LeadsImportPage() {
  const [importData, setImportData] = useState('');
  const [importResults, setImportResults] = useState<ImportBatch | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMethod, setImportMethod] = useState<'json' | 'csv'>('json');

  const importLeads = useMutation(api.leadsManagement.importLeadsFromFranchiseBazar);

  const handleImport = async () => {
    if (!importData.trim()) {
      toast.error('Please provide import data');
      return;
    }

    setIsImporting(true);
    try {
      let leadsData;
      
      if (importMethod === 'json') {
        leadsData = JSON.parse(importData);
      } else {
        // Handle CSV parsing (basic implementation)
        const lines = importData.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        leadsData = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const lead: Record<string, string> = {};
          headers.forEach((header, index) => {
            lead[header] = values[index] || '';
          });
          return lead;
        });
      }

      if (!Array.isArray(leadsData)) {
        throw new Error('Data must be an array of lead objects');
      }

      const importBatchId = `franchisebazar_${Date.now()}`;
      const result = await importLeads({
        leads: leadsData,
        importBatchId,
      });

      setImportResults(result);
      
      if (result.successful > 0) {
        toast.success(`Successfully imported ${result.successful} leads`);
      }
      if (result.failed > 0) {
        toast.error(`${result.failed} leads failed to import`);
      }
    } catch (error) {
      toast.error('Failed to import leads. Please check the data format.');
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = {
      leads: [
        {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+1234567890",
          company: "ABC Corporation",
          website: "https://abccorp.com",
          industry: "Food & Beverage",
          businessType: "Restaurant",
          investmentRange: "$50,000 - $100,000",
          preferredLocation: "New York, NY",
          timeline: "3-6 months",
          notes: "Interested in fast-casual dining franchise"
        },
        {
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          phone: "+1987654321",
          company: "XYZ Enterprises",
          website: "https://xyzent.com",
          industry: "Retail",
          businessType: "Clothing Store",
          investmentRange: "$25,000 - $50,000",
          preferredLocation: "Los Angeles, CA",
          timeline: "1-3 months",
          notes: "Looking for retail franchise opportunity"
        }
      ]
    };

    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leads-import-template.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearResults = () => {
    setImportResults(null);
    setImportData('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Import Leads</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Import leads from FranchiseBazar.com and other sources
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>
      </div>

      {/* Import Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Import Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={importMethod === 'json' ? 'default' : 'outline'}
              onClick={() => setImportMethod('json')}
            >
              <FileText className="h-4 w-4 mr-2" />
              JSON Format
            </Button>
            <Button
              variant={importMethod === 'csv' ? 'default' : 'outline'}
              onClick={() => setImportMethod('csv')}
            >
              <FileText className="h-4 w-4 mr-2" />
              CSV Format
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Import Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Make sure your data includes at least firstName, lastName, and email fields. 
              Duplicate emails will be skipped during import.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Required Fields:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• firstName (string)</li>
                <li>• lastName (string)</li>
                <li>• email (string)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Optional Fields:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• phone, company, website</li>
                <li>• industry, businessType</li>
                <li>• investmentRange, preferredLocation</li>
                <li>• timeline, notes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Form */}
      <Card>
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="importData">
              {importMethod === 'json' ? 'JSON Data' : 'CSV Data'}
            </Label>
            <Textarea
              id="importData"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              rows={15}
              placeholder={
                importMethod === 'json' 
                  ? 'Paste your JSON data here...' 
                  : 'Paste your CSV data here...'
              }
              className="font-mono text-sm"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {importData.split('\n').length} lines of data
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearResults}>
                Clear
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={isImporting || !importData.trim()}
              >
                {isImporting ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Leads
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Results */}
      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{importResults.totalProcessed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Processed</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{importResults.successful}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
              </div>
            </div>

            {importResults.results.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Detailed Results:</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {importResults.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">{result.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            Success
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                            Failed
                          </Badge>
                        )}
                        {result.error && (
                          <span className="text-xs text-red-600">{result.error}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* FranchiseBazar Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle>FranchiseBazar.com Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              How to get leads from FranchiseBazar.com:
            </h4>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
              <li>Log into your FranchiseBazar.com account</li>
              <li>Navigate to your leads or inquiries section</li>
              <li>Export the data in JSON or CSV format</li>
              <li>Copy and paste the data into the import form above</li>
              <li>Click &ldquo;Import Leads&rdquo; to add them to your system</li>
            </ol>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Benefits:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Centralized lead management</li>
                <li>• Automated status tracking</li>
                <li>• Advanced analytics and reporting</li>
                <li>• Team collaboration features</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Lead status progression</li>
                <li>• Source tracking and attribution</li>
                <li>• Follow-up reminders</li>
                <li>• Performance metrics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
