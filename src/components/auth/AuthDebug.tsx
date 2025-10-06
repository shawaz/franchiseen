"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export function AuthDebug() {
  const { userProfile, isAuthenticated, userEmail } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<{
    userEmail: string | null;
    isAuthenticated: string | null;
    signupUserId: string | null;
  }>({
    userEmail: null,
    isAuthenticated: null,
    signupUserId: null,
  });

  useEffect(() => {
    const updateLocalStorageData = () => {
      setLocalStorageData({
        userEmail: localStorage.getItem("userEmail"),
        isAuthenticated: localStorage.getItem("isAuthenticated"),
        signupUserId: localStorage.getItem("signupUserId"),
      });
    };

    updateLocalStorageData();
    
    // Update every second to see changes
    const interval = setInterval(updateLocalStorageData, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Auth Debug Info</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>
            <strong>AuthContext:</strong>
            <ul className="ml-4">
              <li>isAuthenticated: {String(isAuthenticated)}</li>
              <li>userEmail: {userEmail || "null"}</li>
              <li>userProfile: {userProfile ? "exists" : "null"}</li>
              <li>userProfile loading: {userProfile === undefined ? "true" : "false"}</li>
            </ul>
          </div>
          
          <div>
            <strong>localStorage:</strong>
            <ul className="ml-4">
              <li>userEmail: {localStorageData.userEmail || "null"}</li>
              <li>isAuthenticated: {localStorageData.isAuthenticated || "null"}</li>
              <li>signupUserId: {localStorageData.signupUserId || "null"}</li>
            </ul>
          </div>
          
          <div>
            <strong>Should show signup completion:</strong>
            <div className="ml-4">
              {localStorageData.signupUserId && 
               localStorageData.isAuthenticated === "true" && 
               userProfile === null ? "YES" : "NO"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
