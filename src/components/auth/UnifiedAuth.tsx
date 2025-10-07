"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Mail, Upload, User, Copy, Check, Download } from "lucide-react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";
import { useFileUpload } from "@/hooks/useFileUpload";
import { hashOTP } from "@/utils/crypto";
import { Separator } from "../ui/separator";
import jsPDF from "jspdf";

interface UnifiedAuthProps {
  className?: string;
  onSuccess?: () => void;
}

export function UnifiedAuth({ 
  className, 
  onSuccess,
  ...props 
}: UnifiedAuthProps & React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Profile creation state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  
  // Wallet state
  const [generatedWallet, setGeneratedWallet] = useState<{
    walletAddress: string;
    privateKey: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Flow state
  const [currentStep, setCurrentStep] = useState<"email" | "otp" | "profile" | "wallet">("email");
  const [userId, setUserId] = useState<Id<"users"> | null>(null);

  // Debug current step changes
  React.useEffect(() => {
    console.log("Current step changed to:", currentStep);
  }, [currentStep]);

  const { setUserEmail } = useAuth();
  const sendOTP = useAction(api.authActions.sendOTP);
  const sendSignupOTP = useAction(api.authActions.sendSignupOTP);
  const verifyOTP = useMutation(api.auth.verifyOTP);
  const createUserProfile = useMutation(api.userManagement.createUserProfile);
  const { uploadFile } = useFileUpload();
  
  // Load countries from master data
  const countries = useQuery(api.masterData.getAllCountries);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isSignUp) {
        await sendSignupOTP({ email });
        setCurrentStep("otp");
      } else {
        await sendOTP({ email });
        setCurrentStep("otp");
      }
    } catch (error) {
      console.error("Auth error:", error);
      if (isSignUp) {
        // Show more specific error message for debugging
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setError(`Failed to create account: ${errorMessage}. Please try again.`);
      } else {
        // Better error handling for account not found
        setError("No account found with this email. Would you like to create one instead?");
        // Automatically switch to sign-up mode for better UX
        setTimeout(() => {
          setIsSignUp(true);
          setError("");
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const hashedCode = await hashOTP(otpCode);
      const result = await verifyOTP({ email, code: otpCode, hashedCode });
      
      if (isSignUp) {
        // For signup, continue to profile creation
        console.log("Signup OTP verified, proceeding to profile creation");
        console.log("Result:", result);
        setUserId(result.userId);
        // Don't set userEmail in AuthContext yet to avoid triggering profile query
        // localStorage.setItem("userEmail", email);
        localStorage.setItem("isAuthenticated", "true");
        // setUserEmail(email);
        console.log("Setting current step to profile");
        setCurrentStep("profile");
      } else {
        // For login, proceed normally
      localStorage.setItem("userEmail", email);
      localStorage.setItem("isAuthenticated", "true");
      setUserEmail(email);
      onSuccess?.();
      // Don't redirect automatically - let the parent component handle navigation
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Invalid verification code. Please check the code and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (isSignUp) {
        await sendSignupOTP({ email });
      } else {
        await sendOTP({ email });
      }
      setError("");
      // Show a success message briefly
      setError("Verification code sent! Check your email.");
      setTimeout(() => setError(""), 3000);
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError("Failed to resend verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleProfileCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let avatarStorageId = undefined;
      if (avatar) {
        avatarStorageId = await uploadFile(avatar);
      }

      if (!userId) {
        throw new Error("User ID not found. Please try signing up again.");
      }

      const result = await createUserProfile({
        userId,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).getTime() : undefined,
        country: country || undefined,
        avatar: avatarStorageId,
      });

      // Store wallet information and show private key display
      if (result.walletAddress && result.privateKey) {
        setGeneratedWallet({
          walletAddress: result.walletAddress,
          privateKey: result.privateKey
        });
        setCurrentStep("wallet");
      } else {
        // Fallback if no wallet data
        localStorage.removeItem("signupUserId");
        onSuccess?.();
        // Don't redirect automatically - let the parent component handle navigation
      }
    } catch (error) {
      console.error("Profile creation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(`Failed to create profile: ${errorMessage}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletContinue = () => {
    // Set userEmail in AuthContext now that profile is complete
    localStorage.setItem("userEmail", email);
    setUserEmail(email);
    // Clean up signup data and let parent handle navigation
    localStorage.removeItem("signupUserId");
    onSuccess?.();
    // Don't redirect automatically - let the parent component handle navigation
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const downloadWalletFile = () => {
    if (!generatedWallet || !email) return;
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set font
    doc.setFont('helvetica');
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(40, 167, 69); // Green color
    doc.text('Franchiseen Wallet Information', 20, 30);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Keep this information secure and private', 20, 40);
    
    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 45, 190, 45);
    
    // Account Information
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Account Information', 20, 60);
    
    doc.setFontSize(10);
    doc.text(`Email: ${email}`, 20, 75);
    doc.text(`Created: ${new Date().toLocaleDateString()}`, 20, 85);
    doc.text(`Platform: Franchiseen`, 20, 95);
    
    // Wallet Address
    doc.setFontSize(14);
    doc.text('Wallet Address', 20, 115);
    
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    const walletAddress = generatedWallet.walletAddress;
    const maxWidth = 170;
    const splitWalletAddress = doc.splitTextToSize(walletAddress, maxWidth);
    doc.text(splitWalletAddress, 20, 130);
    
    // Private Key - Important Warning
    doc.setFontSize(14);
    doc.setTextColor(220, 53, 69); // Red color
    doc.text('Private Key (KEEP SECRET!)', 20, 155);
    
    doc.setFontSize(8);
    doc.setTextColor(220, 53, 69);
    doc.text('⚠️ CRITICAL: Never share this private key with anyone!', 20, 165);
    doc.text('Store this securely and never lose it - it cannot be recovered!', 20, 175);
    
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    const privateKey = generatedWallet.privateKey;
    const splitPrivateKey = doc.splitTextToSize(privateKey, maxWidth);
    doc.text(splitPrivateKey, 20, 190);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Generated by Franchiseen Platform', 20, 280);
    doc.text('This document contains sensitive information - keep it secure!', 20, 285);
    
    // Save the PDF
    const fileName = `franchiseen-wallet-${email.split('@')[0]}-${Date.now()}.pdf`;
    doc.save(fileName);
  };

  // Profile Creation Step
  if (currentStep === "profile") {
    console.log("Rendering profile creation step");
    console.log("Current step:", currentStep);
    console.log("User ID:", userId);
    return (
      <Card className="w-full max-w-md bg-background border shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xl">Complete Your Profile</CardTitle>
          <CardDescription className="text-muted-foreground">
            Almost there! Please provide some additional information to complete your account setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileCreation} className="space-y-4">
            <FieldGroup>
              {/* Avatar Upload */}
              <Field>
                <FieldLabel>Profile Picture (Optional)</FieldLabel>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt="Profile" />
                    ) : (
                      <AvatarFallback>
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="flex items-center gap-2 px-3 py-2 border border-input rounded-md cursor-pointer hover:bg-accent"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </label>
                  </div>
                </div>
              </Field>

              {/* First Name */}
              <Field>
                <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </Field>

              {/* Last Name */}
              <Field>
                <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </Field>

              {/* Date of Birth */}
              <Field>
                <FieldLabel htmlFor="dateOfBirth">Date of Birth (Optional)</FieldLabel>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </Field>

              {/* Country */}
              <Field>
                <FieldLabel htmlFor="country">Country (Optional)</FieldLabel>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries?.map((country) => (
                      <SelectItem key={country._id} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete Setup
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Wallet Display Step
  if (currentStep === "wallet" && generatedWallet) {
    return (
      <Card className="w-full max-w-lg bg-background border shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎉</span>
          </div>
          <CardTitle className="text-green-600 dark:text-green-400 text-xl">Account Created Successfully!</CardTitle>
          <CardDescription className="text-muted-foreground">
            Your Solana wallet has been generated. Please save your private key securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <FieldLabel className="text-sm font-medium text-foreground mb-2 block">Wallet Address</FieldLabel>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border">
                <code className="flex-1 text-sm font-mono break-all text-foreground">{generatedWallet.walletAddress}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generatedWallet.walletAddress, 'address')}
                  className="shrink-0"
                >
                  {copiedField === 'address' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <FieldLabel className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 block">Private Key (Keep Secret!)</FieldLabel>
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
                <code className="flex-1 text-sm font-mono break-all text-red-700 dark:text-red-300">{generatedWallet.privateKey}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generatedWallet.privateKey, 'privateKey')}
                  className="shrink-0"
                >
                  {copiedField === 'privateKey' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <Alert variant="destructive" className="border-red-200 dark:border-red-800">
            <AlertDescription className="text-red-700 dark:text-red-300">
              <strong>⚠️ Important:</strong> Save your private key securely. We cannot recover it if lost. 
              Never share it with anyone.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={downloadWalletFile} 
              variant="outline" 
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Wallet PDF
            </Button>
            
            <Button onClick={handleWalletContinue} className="w-full">
              Continue to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // OTP Verification Step
  if (currentStep === "otp") {
    return (
        <Card className="w-full border-0 shadow-none bg-transparent">
          <CardContent className="p-0">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Check your email</h1>
                <p className="text-muted-foreground text-balance">
                  We&apos;ve sent a verification code to <strong>{email}</strong>
                </p>
              </div>
              
              <form onSubmit={handleOtpVerification} className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="otp">Verification Code</FieldLabel>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    required
                  />
                </Field>
                
                {error && (
                  <Alert variant={error.includes("Verification code sent") ? "default" : "destructive"}>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Field>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify Code
                  </Button>
                </Field>

                <div className="text-center space-y-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-sm"
                  >
                    Didn&apos;t receive the code? Resend
                  </Button>
                </div>
              </form>
            </FieldGroup>
          </CardContent>
        </Card>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card className="overflow-hidden p-0 border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome to Franchiseen</h1>
                <p className="text-muted-foreground text-balance">
                  Enter your email to {isSignUp ? 'register' : 'sign in'}
                </p>
              </div>
              
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              
             

              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Button>
              </Field>

              {error && (
                <Alert variant={error.includes("No account found") ? "default" : "destructive"}>
                  <AlertDescription className="flex flex-col gap-2">
                    {error}
                    {error.includes("No account found") && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsSignUp(true);
                            setError("");
                          }}
                          className="text-xs"
                        >
                          Create Account
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setError("")}
                          className="text-xs"
                        >
                          Try Different Email
                        </Button>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}


              <FieldDescription className="text-center">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button 
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    setEmail("");
                  }}
                  className="underline underline-offset-2 hover:no-underline"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </FieldDescription>
              <Separator className="my-0" />
              <FieldDescription className="text-center text-xs">
                By {isSignUp ? 'creating an account' : 'continuing'}, you agree to our{" "} <br />
                <a href="#" className="underline underline-offset-2 hover:no-underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline underline-offset-2 hover:no-underline">
                  Privacy Policy
                </a>.
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      
     
    </div>
  );
}
