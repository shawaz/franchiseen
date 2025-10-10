"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import { Search, Calendar, User, Eye, TrendingUp, ArrowRight, Star } from 'lucide-react';

interface News {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: Id<"_storage">;
  images: Id<"_storage">[];
  category: 'company_news' | 'industry_insights' | 'success_stories' | 'product_updates' | 'tips_guides' | 'announcements';
  tags: string[];
  authorId?: string;
  authorName: string;
  authorAvatar?: Id<"_storage">;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: number;
  scheduledFor?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords: string[];
  views: number;
  likes: number;
  isFeatured: boolean;
  allowComments: boolean;
  createdAt: number;
  updatedAt: number;
}

const categoryLabels = {
  company_news: 'Company News',
  industry_insights: 'Industry Insights',
  success_stories: 'Success Stories',
  product_updates: 'Product Updates',
  tips_guides: 'Tips & Guides',
  announcements: 'Announcements',
};

const categoryColors = {
  company_news: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  industry_insights: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  success_stories: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  product_updates: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  tips_guides: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
  announcements: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState('all');

  // Get published news
  const allNews = useQuery(api.newsManagement.getPublishedNews, {}) || [];
  const featuredNews = useQuery(api.newsManagement.getFeaturedNews, { limit: 3 }) || [];

  // Filter news based on category tab
  const filteredNews = allNews.filter((article: News) => {
    const matchesTab = activeTab === 'all' || article.category === activeTab;
    return matchesTab;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Hero Section */}
      <section className="bg-stone-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              News & Insights
            </h1>
            <p className="text-xl text-stone-300 mb-8">
              Stay updated with the latest news, industry insights, and success stories from the world of franchising
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Articles */}
        {featuredNews.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              <h2 className="text-3xl font-bold">Featured Articles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredNews.map((article: News) => (
                <Card key={article._id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <Link href={`/company/news/${article.slug}`}>
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-500 relative">
                      <div className="absolute top-4 left-4">
                        <Badge className={categoryColors[article.category]}>
                          {categoryLabels[article.category]}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{article.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{article.authorName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{article.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{article.likes}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Search and Filters */}
        {/* <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-64 h-12">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="company_news">Company News</SelectItem>
                    <SelectItem value="industry_insights">Industry Insights</SelectItem>
                    <SelectItem value="success_stories">Success Stories</SelectItem>
                    <SelectItem value="product_updates">Product Updates</SelectItem>
                    <SelectItem value="tips_guides">Tips & Guides</SelectItem>
                    <SelectItem value="announcements">Announcements</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Category Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 h-auto gap-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="company_news">Company News</TabsTrigger>
            <TabsTrigger value="industry_insights">Industry Insights</TabsTrigger>
            <TabsTrigger value="success_stories">Success Stories</TabsTrigger>
            <TabsTrigger value="product_updates">Product Updates</TabsTrigger>
            <TabsTrigger value="tips_guides">Tips & Guides</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* News Grid */}
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((article: News) => (
              <Card key={article._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/company/news/${article.slug}`}>
                  <div className="aspect-video bg-gradient-to-br from-gray-400 to-gray-600 relative">
                    <div className="absolute top-4 left-4">
                      <Badge className={categoryColors[article.category]}>
                        {categoryLabels[article.category]}
                      </Badge>
                    </div>
                    {article.isFeatured && (
                      <div className="absolute top-4 right-4">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    
                    {/* Tags */}
                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{article.authorName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{article.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{article.likes}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="group">
                        Read More
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No articles found</h3>
              <p className="text-gray-500">
                Try adjusting your search or filter to find what you&apos;re looking for.
              </p>
            </div>
          </div>
        )}

        {/* Newsletter Section */}
        <section className="mt-20 mb-12">
          <Card className="bg-stone-800 text-white">
            <CardContent className="p-12">
              <div className="max-w-xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
                <p className="text-stone-300 mb-8">
                  Subscribe to our newsletter to receive the latest news, insights, and updates directly in your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-white text-gray-900 max-w-md"
                  />
                  <Button variant="secondary" size="lg">
                    Subscribe
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

