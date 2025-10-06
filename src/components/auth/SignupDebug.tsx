"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";
import { hashOTP } from "@/utils/crypto";

export function SignupDebug() {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");

  const { setUserEmail } = useAuth();
  const sendSignupOTP = useAction(api.authActions.sendSignupOTP);
  const verifyOTP = useMutation(api.auth.verifyOTP);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Sending signup OTP to:", email);
      const result = await sendSignupOTP({ email });
      console.log("OTP send result:", result);
      setSuccess("OTP sent successfully! Check your email.");
      setStep("otp");
    } catch (error) {
      console.error("Send OTP error:", error);
      setError(`Failed to send OTP: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Verifying OTP:", otpCode, "for email:", email);
      const hashedCode = await hashOTP(otpCode);
      console.log("Hashed OTP:", hashedCode);
      
      const result = await verifyOTP({ email, code: otpCode, hashedCode });
      console.log("OTP verification result:", result);
      
      setSuccess("OTP verified successfully! User created.");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("signupUserId", result.userId);
      setUserEmail(email);
      
      setTimeout(() => {
        window.location.href = "/account";
      }, 2000);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError(`OTP verification failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify OTP</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter the 6-digit code sent to {email}
              </label>
              <Input
                type="text"
                placeholder="123456"
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
            
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => setStep("email")}
            >
              Back to Email
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Debug Signup</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="your@email.com"
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
          
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending OTP..." : "Send Signup OTP"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
