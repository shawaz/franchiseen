import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Lock, 
  Trash2, 
  Check, 
  X, 
  Edit, 
  Camera, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,

} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

// Types for KYC documents
type KYCStatus = 'verified' | 'pending' | 'rejected' | 'not-submitted';

interface KYCDocument {
  id: string;
  type: string;
  status: KYCStatus;
  verifiedOn?: string;
  details: string;
}

interface UserData {
  name: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  isKYCVerified: boolean;
  twoFactorEnabled: boolean;
  hasActiveShares: boolean;
  profileImage: string;
  kycDocuments: KYCDocument[];
}

export default function SettingsTab() {
  // User data - in a real app, this would come from a context or API
  const [userData, setUserData] = useState<UserData>({
    name: 'Shawaz Sharif',
    username: 'shawaz',
    email: 'shawaz@franchiseen.com',
    phone: '+91 888 444 9055',
    address: '123 Main St, Apt 4B, New York, NY 10001',
    isKYCVerified: true,
    twoFactorEnabled: false,
    hasActiveShares: true, // Flag to check if user has active shares
    profileImage: '/avatar/avatar-m-5.png',
    kycDocuments: [
      { 
        id: 'id-proof', 
        type: 'ID Proof', 
        status: 'verified', 
        verifiedOn: '2024-09-10',
        details: 'Passport (*****1234)' 
      },
      { 
        id: 'address-proof', 
        type: 'Address Proof', 
        status: 'verified',
        verifiedOn: '2024-09-10',
        details: 'Utility Bill' 
      },
      { 
        id: 'selfie', 
        type: 'Selfie Verification', 
        status: 'verified',
        verifiedOn: '2024-09-10',
        details: 'Liveness check passed' 
      },
      { 
        id: 'tax-info', 
        type: 'Tax Information', 
        status: 'verified',
        verifiedOn: '2024-09-10',
        details: 'W-9 Form' 
      }
    ]
  });
  
  // State for form editing
  const [editingField, setEditingField] = useState<keyof UserData | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Additional user details
  const [userDetails] = useState({
    panNumber: '1234567890',
    citizenshipNumber: '1234567890123',
  });

  // Handle avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const result = event.target?.result;
        if (result && typeof result === 'string') {
          setUserData(prev => ({
            ...prev,
            profileImage: result
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle edit toggle
  const handleEditToggle = (field: keyof UserData) => {
    setEditingField(field);
    setEditValue(userData[field] as string);
  };

  // Handle save
  const handleSave = () => {
    if (editingField && editValue) {
      setUserData(prev => ({
        ...prev,
        [editingField]: editValue
      }));
    }
    setEditingField(null);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingField(null);
  };

  // Toggle two-factor authentication
  const toggleTwoFactorAuth = () => {
    setUserData(prev => ({
      ...prev,
      twoFactorEnabled: !prev.twoFactorEnabled
    }));
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="border-stone-200 dark:border-stone-700 py-4">
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative group">
              <Avatar className="h-20 w-20 border-2 border-white dark:border-stone-800 shadow-sm">
                <AvatarImage src={userData.profileImage} alt={userData.name} />
                <AvatarFallback className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xl font-medium">
                  {userData.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-1 -right-1 p-2 bg-white dark:bg-stone-800  border-2 border-white dark:border-stone-800 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700/50"
              >
                <Camera className="h-4 w-4 text-stone-700 dark:text-stone-300" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <div className="w-full">
            <div className="text-center justify-between flex w-full sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-semibold text-stone-900 dark:text-white">{userData.name}</h3>
                <div className="flex items-center text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 ">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-500 dark:text-stone-400">
                      @
                    </div>
                    <Input
                      id="username"
                      name="username"
                      value={editingField === 'username' ? editValue : userData.username}
                      onChange={(e) => setEditValue(e.target.value)}
                      disabled={editingField !== 'username'}
                      className="pl-7 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700"
                    />
                  </div>
                  {editingField === 'username' ? (
                    <div className="flex gap-1">
                      <Button 
                        type="button"
                        size="icon" 
                        variant="outline" 
                        className="h-9 w-9" 
                        onClick={handleSave}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="button"
                        size="icon" 
                        variant="outline" 
                        className="h-9 w-9" 
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      type="button"
                      size="icon" 
                      variant="outline" 
                      className="h-9 w-9 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700/50"
                      onClick={() => handleEditToggle('username')}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
            </div>
            <p className="text-xs text-stone-400 dark:text-stone-500">
                Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs text-stone-400 dark:text-stone-500">
                Citizen of: India
              </p>
            </div>
            
          </div>

          <Separator className="my-2" />

          <div className="space-y-4">

            <div className="space-y-2">
              <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Full Name
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                  <p className="text-sm font-medium text-stone-900 dark:text-white">{userData.name}</p>
                </div>
                <Button variant="outline" className="text-xs">
                  Update KYC
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                <Mail className="h-4 w-4 text-stone-500" />
                Email Address
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                  <p className="text-sm font-medium text-stone-900 dark:text-white">{userData.email}</p>
                </div>
                <Button variant="outline" className="text-xs">
                  Update KYC
                </Button>
              </div>
            </div>

            {/* Permanent Account Number */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                <CreditCard className="h-4 w-4 text-stone-500" />
                Permanent Account Number (PAN)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  value={userDetails.panNumber}
                  readOnly
                  className="bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700"
                />
                <Button variant="outline" className="text-xs">
                  Update KYC
                </Button>
              </div>
            </div>

            {/* Citizenship Number */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                <FileText className="h-4 w-4 text-stone-500" />
                Citizenship Number
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  value={userDetails.citizenshipNumber}
                  readOnly
                  className="bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700"
                />
                <Button variant="outline" className="text-xs">
                  Update KYC
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                <Phone className="h-4 w-4 text-stone-500" />
                Phone Number
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                  <p className="text-sm font-medium text-stone-900 dark:text-white">{userData.phone}</p>
                </div>
                <Button variant="outline" className="text-xs">
                  Update KYC
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                <MapPin className="h-4 w-4 text-stone-500" />
                Address
              </Label>
              <div className="flex items-center gap-2 ">
                <div className="flex-1 px-3 py-2 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                  <p className="text-sm text-stone-900 dark:text-white">{userData.address}</p>
                </div>
                <Button variant="outline" className="text-xs">
                  Update KYC
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-stone-50 dark:bg-stone-800/30 ">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <Lock className="h-4 w-4 text-stone-600 dark:text-stone-300" />
                Two-Factor Authentication
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {userData.twoFactorEnabled 
                  ? 'Two-factor authentication is currently enabled for your account.' 
                  : 'Add an extra layer of security to your account by enabling two-factor authentication.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="two-factor" 
                  checked={userData.twoFactorEnabled}
                  onCheckedChange={toggleTwoFactorAuth}
                />
                <Label htmlFor="two-factor" className="font-normal">
                  {userData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
              {userData.twoFactorEnabled && (
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              )}
            </div>
          </div>
          
          <div className="p-4 border  bg-stone-50 dark:bg-stone-800/30 dark:border-stone-700">
            <h4 className="font-medium mb-3">Recent Security Activity</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-1.5  bg-green-100 dark:bg-green-900/30 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-sm font-medium">Login from new device</span>
                    <span className="text-xs text-stone-500">2 hours ago</span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Chrome on macOS, New York, NY, USA
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5  bg-blue-100 dark:bg-blue-900/30 mt-0.5">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-sm font-medium">Password updated</span>
                    <span className="text-xs text-stone-500">1 week ago</span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Your account password was changed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-red-100 py-6 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-red-700 dark:text-red-400">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Account Deletion
            </div>
          </CardTitle>
          <CardDescription className="text-red-600/80 dark:text-red-400/80">
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userData.hasActiveShares ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 ">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-amber-800 dark:text-amber-200">Account Deletion Not Available</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    You must sell or transfer all your franchise shares before you can delete your account. 
                    This is to ensure proper handling of your investments and compliance with financial regulations.
                  </p>
                  <div className="mt-3 flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" size="sm" className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30">
                      View My Shares
                    </Button>
                    <Button variant="outline" size="sm" className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30">
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <p className="text-sm text-stone-700 dark:text-stone-300">
                  Before you proceed, please note:
                </p>
                <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-400 list-disc list-inside">
                  <li>All your personal data will be permanently deleted</li>
                  <li>This action cannot be undone</li>
                  <li>You will lose access to all your investments and transaction history</li>
                  <li>Any pending transactions will be canceled</li>
                </ul>
              </div>
              
              <div className="pt-4 mt-4 border-t border-red-100 dark:border-red-900/20">
                <Button 
                  variant="destructive" 
                  className="gap-2 w-full sm:w-auto"
                  onClick={() => {/* Handle delete account */}}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete My Account Permanently
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
