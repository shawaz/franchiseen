"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, Upload, User } from "lucide-react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
// import { useConvexImageUrl } from "@/hooks/useConvexImageUrl";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useAuth } from "@/contexts/AuthContext";
import { hashOTP } from "@/utils/crypto";
import { PrivateKeyDisplay } from "./PrivateKeyDisplay";

interface SignupFormProps {
  onBack?: () => void;
}

export function SignupForm({ onBack }: SignupFormProps) {
  const [step, setStep] = useState<"email" | "profile" | "wallet">("email");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [generatedWallet, setGeneratedWallet] = useState<{
    walletAddress: string;
    privateKey: Uint8Array;
  } | null>(null);

  const { setUserEmail } = useAuth();
  const sendOTP = useAction(api.authActions.sendSignupOTP);
  const verifyOTP = useMutation(api.auth.verifyOTP);
  const createUserProfile = useMutation(api.userManagement.createUserProfile);
  // const isUsernameAvailable = useQuery(api.userManagement.isUsernameAvailable, { username });
  const { uploadFile } = useFileUpload();
  // const getImageUrl = useConvexImageUrl();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await sendOTP({ email });
      setOtpSent(true);
    } catch (error) {
      console.error("Signup error:", error);
      setError("Failed to create account. Please try again.");
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
      setUserId(result.userId);
      setStep("profile");
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Username availability check will be handled server-side

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
        avatar: avatarStorageId,
      });

      // Store wallet information and show private key display
      if (result.walletAddress && result.privateKey) {
        setGeneratedWallet({
          walletAddress: result.walletAddress,
          privateKey: new Uint8Array(result.privateKey)
        });
        setStep("wallet");
      } else {
        // Fallback if no wallet data
        localStorage.setItem("userEmail", email);
        localStorage.setItem("isAuthenticated", "true");
        setUserEmail(email);
        window.location.href = "/account";
      }
    } catch (error) {
      console.error("Profile creation error:", error);
      setError("Failed to create profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletContinue = () => {
    // Store user session and redirect to account page
    localStorage.setItem("userEmail", email);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userWalletAddress", generatedWallet!.walletAddress);
    localStorage.setItem("userPrivateKey", JSON.stringify(Array.from(generatedWallet!.privateKey)));
    setUserEmail(email);
    window.location.href = "/account";
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a rounded/cropped version of the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set canvas size to 200x200 for a square crop
        canvas.width = 200;
        canvas.height = 200;
        
        if (ctx) {
          // Create circular clipping path
          ctx.beginPath();
          ctx.arc(100, 100, 100, 0, Math.PI * 2);
          ctx.clip();
          
          // Calculate crop dimensions to maintain aspect ratio
          const size = Math.min(img.width, img.height);
          const x = (img.width - size) / 2;
          const y = (img.height - size) / 2;
          
          // Draw the cropped and scaled image
          ctx.drawImage(img, x, y, size, size, 0, 0, 200, 200);
          
          // Convert canvas to blob
          canvas.toBlob((blob) => {
            if (blob) {
              // Create a new file from the blob
              const croppedFile = new File([blob], file.name, { type: 'image/png' });
              setAvatar(croppedFile);
              
              // Set preview URL
              const url = URL.createObjectURL(blob);
              setAvatarUrl(url);
            }
          }, 'image/png', 0.9);
        }
      };
      
      img.src = URL.createObjectURL(file);
    }
  };

  if (step === "email") {
    if (otpSent) {
      return (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Verify your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a verification code to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOtpVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Enter your email to get started
        </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>

            {onBack && (
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onBack}
                  className="text-sm"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    );
  }

  // Render profile step
  if (step === "profile") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Complete your profile</CardTitle>
          <CardDescription>
            Tell us a bit about yourself to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileCreation} className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('avatar')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Avatar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Render wallet step if we have generated wallet data
  if (step === "wallet") {
    if (generatedWallet === null) {
      return (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Loading Wallet...</CardTitle>
            <CardDescription>Please wait while we generate your wallet</CardDescription>
          </CardHeader>
        </Card>
      );
    }
    
    return (
      <PrivateKeyDisplay
        privateKey={generatedWallet!.privateKey}
        walletAddress={generatedWallet!.walletAddress}
        onContinue={handleWalletContinue}
      />
    );
  }

  return null;
}
