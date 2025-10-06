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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail } from "lucide-react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { hashOTP } from "@/utils/crypto";
import { Separator } from "../ui/separator";

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
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const { setUserEmail } = useAuth();
  const sendOTP = useAction(api.authActions.sendOTP);
  const sendSignupOTP = useAction(api.authActions.sendSignupOTP);
  const verifyOTP = useMutation(api.auth.verifyOTP);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isSignUp) {
        await sendSignupOTP({ email });
      } else {
        await sendOTP({ email });
      }
      setOtpSent(true);
    } catch (error) {
      console.error("Auth error:", error);
      if (isSignUp) {
        setError("Failed to create account. Please try again.");
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
      await verifyOTP({ email, code: otpCode, hashedCode });
      // Success - store user session and redirect
      localStorage.setItem("userEmail", email);
      localStorage.setItem("isAuthenticated", "true");
      setUserEmail(email);
      onSuccess?.();
      window.location.href = "/";
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

  if (otpSent) {
    return (
      <>
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
        
      </>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card className="overflow-hidden p-0 w-full border-0 shadow-none bg-transparent">
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
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      
      <Separator className="my-4" />
      
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
    </div>
  );
}
