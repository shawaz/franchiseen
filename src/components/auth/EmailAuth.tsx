"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { hashOTP } from "@/utils/crypto";

interface EmailAuthProps {
  onBack?: () => void;
}

export function EmailAuth({ onBack }: EmailAuthProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const { setUserEmail } = useAuth();
  const sendOTP = useAction(api.authActions.sendOTP);
  const verifyOTP = useMutation(api.auth.verifyOTP);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await sendOTP({ email });
      setOtpSent(true);
    } catch (error) {
      console.error("Sign in error:", error);
      // Show user-friendly error message
      setError("Account not found. Please sign up first.");
      console.log("Error state set:", "Account not found. Please sign up first.");
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
      await verifyOTP({ email, code: otpCode, hashedCode });
      // Success - store user session and redirect
      localStorage.setItem("userEmail", email);
      localStorage.setItem("isAuthenticated", "true");
      setUserEmail(email);
      window.location.href = "/";
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError("");

    try {
      await sendOTP({ email });
      setError("");
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError("Failed to resend verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  if (showSignup) {
    // Dynamic import to avoid circular dependency
    const SignupForm = React.lazy(() => import("./SignupForm").then(module => ({ default: module.SignupForm })));
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <SignupForm onBack={() => setShowSignup(false)} />
      </React.Suspense>
    );
  }

  if (otpSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Check your email</CardTitle>
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
              Verify Code
            </Button>

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
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOtpSent(false)}
                disabled={isLoading}
                className="text-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Sign in to Franchiseen</CardTitle>
        <CardDescription>
          Enter your email to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignIn} className="space-y-4">
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
            Sign In
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowSignup(true)}
              className="text-sm"
            >
              Don&apos;t have an account? Sign up
            </Button>
          </div>

          {onBack && (
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                className="text-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
