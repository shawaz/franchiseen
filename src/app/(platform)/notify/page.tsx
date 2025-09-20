"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  TrendingUp,
  Building2,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";
import FooterMobile from "@/components/app/FooterMobile";

// Mock notification data - in a real app, this would come from your backend
const mockNotifications = [
  {
    id: "1",
    type: "investment_update",
    title: "Share Purchase Confirmed",
    message:
      "You successfully purchased 5 shares in McDonald's Downtown franchise",
    amount: 25000,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    franchise: {
      name: "McDonald's Downtown",
      logo: "/logo/logo-2.svg",
      location: "Downtown Business District",
    },
    actionUrl: "/business/123/franchise/456",
  },
  {
    id: "2",
    type: "status_update",
    title: "Franchise Status Changed",
    message:
      "Starbucks Mall Plaza has moved from 'Fundraising' to 'Launching' phase",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    read: false,
    franchise: {
      name: "Starbucks Mall Plaza",
      logo: "/logo/logo-2.svg",
      location: "Mall Plaza Shopping Center",
    },
    status: "Launching",
    actionUrl: "/business/124/franchise/457",
  },
  {
    id: "3",
    type: "new_opportunity",
    title: "New Franchise Available",
    message: "KFC Express Highway location is now accepting investments",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    read: true,
    franchise: {
      name: "KFC Express Highway",
      logo: "/logo/logo-2.svg",
      location: "Highway Commercial Zone",
    },
    minInvestment: 10000,
    actionUrl: "/business/125/franchise/458",
  },
  {
    id: "4",
    type: "deal_notification",
    title: "Secondary Market Deal",
    message:
      "John Doe is selling 3 shares in Pizza Hut Central at ₹4,800 per share",
    amount: 14400,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    read: true,
    franchise: {
      name: "Pizza Hut Central",
      logo: "/logo/logo-2.svg",
      location: "Central Business District",
    },
    seller: {
      name: "John Doe",
      avatar: "/logo/logo-2.svg",
    },
    actionUrl: "/deals/789",
  },
  {
    id: "5",
    type: "milestone",
    title: "Franchise Milestone Achieved",
    message: "Subway Metro Station has reached 80% funding milestone",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    read: true,
    franchise: {
      name: "Subway Metro Station",
      logo: "/logo/logo-2.svg",
      location: "Metro Station Complex",
    },
    progress: 80,
    actionUrl: "/business/126/franchise/459",
  },
  {
    id: "6",
    type: "dividend",
    title: "Dividend Payment Received",
    message: "You received dividend payment from Domino's Tech Park",
    amount: 1200,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    franchise: {
      name: "Domino's Tech Park",
      logo: "/logo/logo-2.svg",
      location: "Technology Park",
    },
    actionUrl: "/profile/dashboard/wallet",
  },
];

const notificationTypes = [
  { key: "all", label: "All", count: mockNotifications.length },
  {
    key: "investment_update",
    label: "Investments",
    count: mockNotifications.filter((n) => n.type === "investment_update")
      .length,
  },
  {
    key: "status_update",
    label: "Status Updates",
    count: mockNotifications.filter((n) => n.type === "status_update").length,
  },
  {
    key: "new_opportunity",
    label: "Opportunities",
    count: mockNotifications.filter((n) => n.type === "new_opportunity").length,
  },
  {
    key: "deal_notification",
    label: "Deals",
    count: mockNotifications.filter((n) => n.type === "deal_notification")
      .length,
  },
  {
    key: "milestone",
    label: "Milestones",
    count: mockNotifications.filter((n) => n.type === "milestone").length,
  },
  {
    key: "dividend",
    label: "Dividends",
    count: mockNotifications.filter((n) => n.type === "dividend").length,
  },
];

function NotifyPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [notifications, setNotifications] = useState(mockNotifications);

  const filteredNotifications =
    selectedFilter === "all"
      ? notifications
      : notifications.filter((n) => n.type === selectedFilter);

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "investment_update":
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case "status_update":
        return <TrendingUp className="h-5 w-5 text-stone-600" />;
      case "new_opportunity":
        return <Building2 className="h-5 w-5 text-purple-600" />;
      case "deal_notification":
        return <Users className="h-5 w-5 text-orange-600" />;
      case "milestone":
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case "dividend":
        return <DollarSign className="h-5 w-5 text-yellow-600" />;
      default:
        return <Bell className="h-5 w-5 text-stone-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Fundraising":
        return "bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-200";
      case "Launching":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Live":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-stone-100 text-stone-800 dark:bg-stone-900 dark:text-stone-200";
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="pb-20 md:pb-8 min-h-screen ">
        {/* Mobile-optimized Header */}
        <div className="sticky top-[60px] mt-4 md:mt-0 md:px-6 z-10 bg-stone-50 dark:bg-stone-900 md:py-4 md:border-b border-stone-200 dark:border-stone-700 mb-6">
          <div className="flex flex-col space-y-4">


            {/* Mobile-optimized Filter Tabs */}
            <div
              className="overflow-x-auto"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="flex gap-2 min-w-max">
                {notificationTypes.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setSelectedFilter(type.key)}
                    className={`flex items-center gap-2 px-4 py-2.5  text-sm font-medium transition-all whitespace-nowrap ${
                      selectedFilter === type.key
                        ? "bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-50 shadow-sm"
                        : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-600"
                    }`}
                  >
                    <span>{type.label}</span>
                    {type.count > 0 && (
                      <span
                        className={`px-2 py-0.5 text-xs  font-medium ${
                          selectedFilter === type.key
                            ? "bg-white/50 text-stone-800 dark:text-stone-100"
                            : "bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400"
                        }`}
                      >
                        {type.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800  flex items-center justify-center mb-6">
                <Bell className="h-10 w-10 text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2 text-center">
                No notifications
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-center max-w-sm">
                {selectedFilter === "all"
                  ? "You're all caught up! Check back later for updates on your franchise investments."
                  : `No ${notificationTypes.find((t) => t.key === selectedFilter)?.label.toLowerCase()} notifications yet.`}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-lg active:scale-[0.98] cursor-pointer border-0 shadow-sm ${
                  !notification.read
                    ? "bg-gradient-to-r from-stone-50 to-stone-200 dark:from-stone-950/30 dark:to-indigo-950/30 border-l-4 border-l-primary"
                    : "bg-white dark:bg-stone-800"
                }`}
                onClick={() => {
                  markAsRead(notification.id);
                  // In a real app, you would navigate to the action URL
                  // window.location.href = notification.actionUrl;
                }}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Enhanced Icon */}
                    <div className="flex-shrink-0">
                      <div
                        className={`p-2.5 rounded-xl ${
                          !notification.read
                            ? "bg-primary/10 ring-2 ring-primary/20"
                            : "bg-stone-100 dark:bg-stone-700"
                        }`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Title and Message */}
                          <div className="mb-3">
                            <h3 className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100 mb-1 leading-tight">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                              {notification.message}
                            </p>
                          </div>

                          {/* Franchise Info - Mobile Optimized */}
                          <div className="flex items-center gap-2 mb-3 p-2 bg-stone-50 dark:bg-stone-700/50 rounded-lg">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-stone-600 flex items-center justify-center shadow-sm">
                              <Building2 className="h-4 w-4 text-stone-600 dark:text-stone-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                                {notification.franchise.name}
                              </p>
                              <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                                {notification.franchise.location}
                              </p>
                            </div>
                          </div>

                          {/* Additional Info - Mobile Stack */}
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <span className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                              <Clock className="h-3.5 w-3.5" />
                              {formatTimeAgo(notification.timestamp)}
                            </span>

                            {notification.amount && (
                              <span className="flex items-center gap-1.5 font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 ">
                                <DollarSign className="h-3.5 w-3.5" />₹
                                {notification.amount.toLocaleString()}
                              </span>
                            )}

                            {notification.status && (
                              <Badge
                                className={`text-xs font-medium ${getStatusBadgeColor(notification.status)}`}
                              >
                                {notification.status}
                              </Badge>
                            )}

                            {notification.progress && (
                              <span className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-900/20 px-2 py-1  font-medium">
                                <TrendingUp className="h-3.5 w-3.5" />
                                {notification.progress}%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-3 h-3 bg-primary  shadow-sm ring-2 ring-white dark:ring-stone-800"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Suggested Notifications Section - Mobile Optimized */}
        <div className="mt-8 sm:mt-12 pb-6">
          <div className="text-center mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
              What to Expect
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto">
              Stay informed about your franchise investments with these
              notification types
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-950/30 dark:to-stone-900/30">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-stone-600 rounded-xl">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                    Investment Updates
                  </h3>
                </div>
                <ul className="space-y-2.5 text-sm text-stone-700 dark:text-stone-300">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-stone-600  mt-2 flex-shrink-0"></div>
                    Share purchase confirmations
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-stone-600  mt-2 flex-shrink-0"></div>
                    Investment milestone achievements
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-stone-600  mt-2 flex-shrink-0"></div>
                    Portfolio performance updates
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-stone-600  mt-2 flex-shrink-0"></div>
                    Dividend payment notifications
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-purple-600 rounded-xl">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                    Franchise Status
                  </h3>
                </div>
                <ul className="space-y-2.5 text-sm text-stone-700 dark:text-stone-300">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                    Status changes (Fundraising → Live)
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                    Construction progress updates
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                    Opening date announcements
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                    Operational milestones
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-orange-600 rounded-xl">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                    Market Activity
                  </h3>
                </div>
                <ul className="space-y-2.5 text-sm text-stone-700 dark:text-stone-300">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                    Secondary market deals
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                    Share price changes
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                    New investor joins
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                    Trading volume alerts
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-green-600 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                    Opportunities
                  </h3>
                </div>
                <ul className="space-y-2.5 text-sm text-stone-700 dark:text-stone-300">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    New franchise listings
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    Limited-time investment offers
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    Recommended investments
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    Early access opportunities
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}

export default NotifyPage;
