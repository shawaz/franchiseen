"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, User } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useFileUpload } from "@/hooks/useFileUpload";
import { PrivateKeyDisplay } from "./PrivateKeyDisplay";

export function SignupCompletion() {
  console.log("SignupCompletion component rendered");
  console.log("localStorage signupUserId:", localStorage.getItem("signupUserId"));
  console.log("localStorage isAuthenticated:", localStorage.getItem("isAuthenticated"));
  
  const [step, setStep] = useState<"profile" | "wallet">("profile");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedWallet, setGeneratedWallet] = useState<{
    walletAddress: string;
    privateKey: string;
  } | null>(null);

  const createUserProfile = useMutation(api.userManagement.createUserProfile);
  const { uploadFile } = useFileUpload();
  
  // Load countries from master data
  const countries = useQuery(api.masterData.getAllCountries);

  // Get the stored userId from localStorage
  const [userId, setUserId] = useState<Id<"users"> | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("signupUserId");
    if (storedUserId) {
      setUserId(storedUserId as Id<"users">);
    }
  }, []);

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
        setStep("wallet");
      } else {
        // Fallback if no wallet data
        localStorage.removeItem("signupUserId");
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
    // Clean up signup data and redirect to account page
    localStorage.removeItem("signupUserId");
    window.location.href = "/account";
  };

  if (step === "wallet" && generatedWallet) {
    return (
      <PrivateKeyDisplay
        walletAddress={generatedWallet.walletAddress}
        privateKey={generatedWallet.privateKey}
        onContinue={handleWalletContinue}
      />
    );
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
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
    </div>
  );
}
