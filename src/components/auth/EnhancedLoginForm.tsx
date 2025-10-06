"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail } from "lucide-react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { hashOTP } from "@/utils/crypto";

interface EnhancedLoginFormProps {
  className?: string;
  onBack?: () => void;
  onSuccess?: () => void;
}

export function EnhancedLoginForm({ 
  className, 
  onSuccess,
  ...props 
}: EnhancedLoginFormProps & React.ComponentProps<"div">) {
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
      setError("Account not found. Please sign up first.");
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
      onSuccess?.();
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
      <Card className="w-full border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center mb-6">
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
                <Alert variant="destructive">
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
      <Card className="overflow-hidden p-0 w-full border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          <form onSubmit={handleSignIn}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center mb-6">
                <h1 className="text-2xl font-bold">Welcome to Franchiseen</h1>
                <p className="text-muted-foreground text-balance">
                  Enter your email to continue
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
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </Field>

              
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <button 
                  type="button"
                  onClick={() => setShowSignup(true)}
                  className="underline underline-offset-2 hover:no-underline"
                >
                  Sign up
                </button>
              </FieldDescription>
              <FieldSeparator />


            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      
      <FieldDescription className="text-center text-xs">
        By clicking continue, you agree to our{" "} <br />
        <a href="#" className="underline underline-offset-2 hover:no-underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-2 hover:no-underline">
          Privacy Policy
        </a>.
      </FieldDescription>
    </div>
  );
}
