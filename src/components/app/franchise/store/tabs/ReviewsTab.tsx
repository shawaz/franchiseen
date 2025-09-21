import * as React from 'react';
import { useState } from 'react';
import { Star, User, MessageSquare, Clock, CheckCircle, ThumbsUp, ChevronDown, Search } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type VisitType = 'dine-in' | 'delivery' | 'takeaway';

interface ReviewReply {
  text: string;
  date: string;
  managerName: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  images?: string[];
  verified: boolean;
  visitType?: VisitType;
  visitDate?: string;
  helpfulCount?: number;
  reply?: ReviewReply;
}

interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface ReviewsTabProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
}


const ReviewsTab: React.FC<ReviewsTabProps> = ({ 
  reviews, 
  averageRating, 
  totalReviews}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // Filter reviews based on active filter and search query
  const filteredReviews = reviews.filter((review: Review) => {
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'with_media' && review.images && review.images.length > 0) ||
      (activeFilter === 'verified' && review.verified) ||
      (activeFilter === 'replied' && review.reply);
    
    const matchesSearch = searchQuery === '' || 
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });


  // Function to render visit type badge
  const renderVisitType = (type?: VisitType): React.JSX.Element | null => {
    if (!type) return null;
    
    const typeConfig = {
      'dine-in': { label: 'Dine-in', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      'delivery': { label: 'Delivery', bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      'takeaway': { label: 'Takeaway', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' }
    };

    const config = typeConfig[type] || { label: type, bg: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg}`}>
        {config.label}
      </span>
    );
  };

  // Function to handle reply submission
  const handleReplySubmit = (reviewId: string): void => {
    // In a real app, this would submit to your backend
    console.log(`Replying to review ${reviewId}:`, replyText);
    setShowReplyForm(null);
    setReplyText('');
  };

  // Function to handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setActiveFilter(e.target.value);
  };

  // Function to handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  // Function to toggle reply form
  const toggleReplyForm = (reviewId: string): void => {
    setShowReplyForm(showReplyForm === reviewId ? null : reviewId);
  };

  // Function to handle help button click
  const handleHelpfulClick = (reviewId: string): void => {
    // In a real app, this would update the helpful count in the backend
    console.log(`Marked review ${reviewId} as helpful`);
  };

  // Function to handle report button click
  const handleReportClick = (reviewId: string): void => {
    // In a real app, this would trigger a report dialog
    console.log(`Reported review ${reviewId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Feedback</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            See what customers are saying about this location
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search reviews..."
              className="pl-10 w-48 md:w-64"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              value={activeFilter}
              onChange={handleFilterChange}
            >
              <option value="all">All Reviews</option>
              <option value="with_media">With Media</option>
              <option value="verified">Verified Purchases</option>
              <option value="replied">With Replies</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Rating Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          {/* Average Rating */}
          <div >
            <div className="text-5xl font-bold text-amber-600 dark:text-amber-500">
              {averageRating.toFixed(1)}
            </div>
           
            
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {((rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
              const sizeClasses = {
                sm: 'h-3 w-3',
                md: 'h-4 w-4',
                lg: 'h-5 w-5'
              };

              return (
                <div className="flex items-center mb-3">
                  {Array(5).fill(0).map((_, i) => (
                    <Star
                      key={i}
                      className={`${sizeClasses[size]} ${i < rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300 dark:text-gray-600'}`} />
                  ))}
                  <span className="ml-2  text-sm text-gray-500 dark:text-gray-400">
                    {rating.toFixed(1)}
                  </span>
                </div>
              );
            })(Math.round(averageRating), 'lg')}
              Based on {totalReviews} reviews
            </p>

          {/* Rating Distribution */}
          {/* <div className="md:col-span-2 space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating as keyof typeof ratingDistribution] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="w-8 text-sm font-medium text-gray-900 dark:text-white">{rating} star</span>
                  <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm text-gray-500 dark:text-gray-400">
                    {count}
                  </span>
                </div>
              );
            })}
          </div> */}
        </div>
      </Card>

      {/* Review List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {filteredReviews.length} {filteredReviews.length === 1 ? 'Review' : 'Reviews'}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
            <select className="text-sm bg-transparent border-0 focus:ring-2 focus:ring-amber-500 rounded-md">
              <option>Most Recent</option>
              <option>Highest Rated</option>
              <option>Lowest Rated</option>
              <option>Most Helpful</option>
            </select>
          </div>
        </div>

        {filteredReviews.map((review) => (
          <Card key={review.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              {/* Review Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {review.userAvatar ? (
                      <Image
                        src={review.userAvatar}
                        alt={review.userName}
                        width={48}
                        height={48}
                        className="rounded-full h-12 w-12 object-cover border-2 border-amber-100 dark:border-amber-900/50"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <User className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                        {review.userName}
                      </h4>
                      {review.verified && (
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {review.visitType && renderVisitType(review.visitType)}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {((rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
                        const sizeClasses = {
                          sm: 'h-3 w-3',
                          md: 'h-4 w-4',
                          lg: 'h-5 w-5'
                        };

                        return (
                          <div className="flex items-center">
                            {Array(5).fill(0).map((_, i) => (
                              <Star
                                key={i}
                                className={`${sizeClasses[size]} ${i < rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300 dark:text-gray-600'}`} />
                            ))}
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                              {rating.toFixed(1)}
                            </span>
                          </div>
                        );
                      })(review.rating, 'sm')}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        • {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {review.visitDate && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {review.visitDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </button>
              </div>

              {/* Review Content */}
              <div className="pl-16 space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {review.comment}
                </p>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {review.images.map((image, index) => (
                      <div key={index} className="relative h-24 w-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <Image
                          src={image}
                          alt={`Review image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Review Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-4">
                    <button 
                      className="flex items-center text-sm text-gray-500 hover:text-amber-600 dark:hover:text-amber-400"
                      onClick={() => handleHelpfulClick(review.id)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      <span>Helpful ({review.helpfulCount || 0})</span>
                    </button>
                    <button 
                      className="flex items-center text-sm text-gray-500 hover:text-amber-600 dark:hover:text-amber-400"
                      onClick={() => toggleReplyForm(review.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>Reply</span>
                    </button>
                  </div>
                  <button 
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => handleReportClick(review.id)}
                  >
                    Report
                  </button>
                </div>

                {/* Reply Form */}
                {showReplyForm === review.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label htmlFor={`reply-${review.id}`} className="sr-only">Write a reply</label>
                        <div className="flex space-x-2">
                          <Input
                            id={`reply-${review.id}`}
                            placeholder="Write a reply..."
                            className="flex-1"
                            value={replyText}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReplyText(e.target.value)}
                          />
                          <Button 
                            type="button" 
                            onClick={() => handleReplySubmit(review.id)}
                            disabled={!replyText.trim()}
                          >
                            Send
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manager's Reply */}
                {review.reply && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {review.reply.managerName}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(review.reply.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Manager
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {review.reply.text}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}

        {/* No Results */}
        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No reviews found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? 'Try adjusting your search or filter' : 'Be the first to leave a review'}
            </p>
            <div className="mt-6">
              <Button>Write a Review</Button>
            </div>
          </div>
        )}

        {/* Pagination */}
      </div>

    </div>
  );
};

export default ReviewsTab;
