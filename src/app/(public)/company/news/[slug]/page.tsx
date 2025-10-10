"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { Calendar, User, Eye, TrendingUp, ArrowLeft, Share2, Heart } from 'lucide-react';
import { toast } from 'sonner';

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

export default function NewsArticlePage() {
  const params = useParams();
  const slug = params.slug as string;

  // Get article by slug
  const article = useQuery(api.newsManagement.getNewsBySlug, { slug });
  const relatedNews = useQuery(api.newsManagement.getPublishedNews, { 
    category: article?.category,
    limit: 3 
  }) || [];

  // Mutations
  const incrementViews = useMutation(api.newsManagement.incrementViews);
  const incrementLikes = useMutation(api.newsManagement.incrementLikes);

  // Increment views when article is loaded
  useEffect(() => {
    if (article?._id) {
      incrementViews({ newsId: article._id as Id<"news"> });
    }
  }, [article?._id, incrementViews]);

  const handleLike = async () => {
    if (article?._id) {
      try {
        await incrementLikes({ newsId: article._id as Id<"news"> });
        toast.success('Thanks for your feedback!');
      } catch {
        toast.error('Failed to like article');
      }
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Article not found</h2>
          <Link href="/company/news">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Filter out current article from related news
  const filteredRelatedNews = relatedNews.filter((item: News) => item._id !== article._id).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section with Featured Image */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/company/news">
            <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10 mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News
            </Button>
          </Link>
          
          <div className="max-w-4xl mx-auto">
            <Badge className={categoryColors[article.category] + " mb-4"}>
              {categoryLabels[article.category]}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {article.title}
            </h1>
            
            <p className="text-xl text-blue-100 mb-6">
              {article.excerpt}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>{article.authorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{formatDate(article.publishedAt || article.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                <span>{article.views} views</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span>{article.likes} likes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Article Content */}
          <Card className="mb-8">
            <CardContent className="p-8 md:p-12">
              {/* Featured Image Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg mb-8"></div>
              
              {/* Content */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap leading-relaxed">
                  {article.content}
                </div>
              </div>

              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">TAGS</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 pt-8 border-t flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={handleLike} className="gap-2">
                    <Heart className="h-4 w-4" />
                    Like ({article.likes})
                  </Button>
                  <Button variant="outline" onClick={handleShare} className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Eye className="h-4 w-4" />
                  <span>{article.views} views</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Author Info */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {article.authorName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{article.authorName}</h3>
                  <p className="text-gray-600 dark:text-gray-400">Content Author</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Articles */}
          {filteredRelatedNews.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredRelatedNews.map((relatedArticle: News) => (
                  <Card key={relatedArticle._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <Link href={`/company/news/${relatedArticle.slug}`}>
                      <div className="aspect-video bg-gradient-to-br from-gray-400 to-gray-600 relative">
                        <div className="absolute top-4 left-4">
                          <Badge className={categoryColors[relatedArticle.category]}>
                            {categoryLabels[relatedArticle.category]}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                          {relatedArticle.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {relatedArticle.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(relatedArticle.publishedAt || relatedArticle.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{relatedArticle.views}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

