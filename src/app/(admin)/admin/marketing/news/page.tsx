"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { Plus, Search, Edit, Trash2, Eye, Calendar, Star, TrendingUp, FileText, Newspaper } from 'lucide-react';
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

export default function NewsManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddNewsDialogOpen, setIsAddNewsDialogOpen] = useState(false);
  const [isEditNewsDialogOpen, setIsEditNewsDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const [newNews, setNewNews] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'company_news' as News['category'],
    tags: [] as string[],
    tagInput: '',
    authorName: 'Admin',
    status: 'draft' as News['status'],
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [] as string[],
    keywordInput: '',
    isFeatured: false,
    allowComments: true,
  });

  // Get news data
  const news = useQuery(api.newsManagement.getAllNews) || [];
  const newsStats = useQuery(api.newsManagement.getNewsStatistics) || { 
    total: 0,
    byStatus: { draft: 0, published: 0, archived: 0 },
    byCategory: {},
    totalViews: 0,
    totalLikes: 0,
    featured: 0,
  };
  
  const createNews = useMutation(api.newsManagement.createNews);
  const updateNews = useMutation(api.newsManagement.updateNews);
  const updateNewsStatus = useMutation(api.newsManagement.updateNewsStatus);
  const deleteNews = useMutation(api.newsManagement.deleteNews);
  const toggleFeatured = useMutation(api.newsManagement.toggleFeatured);

  // Filter news
  const filteredNews = news.filter((article: News) => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  const handleAddTag = () => {
    if (newNews.tagInput.trim() && !newNews.tags.includes(newNews.tagInput.trim())) {
      setNewNews({
        ...newNews,
        tags: [...newNews.tags, newNews.tagInput.trim()],
        tagInput: '',
      });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewNews({
      ...newNews,
      tags: newNews.tags.filter(t => t !== tag),
    });
  };

  const handleAddKeyword = () => {
    if (newNews.keywordInput.trim() && !newNews.metaKeywords.includes(newNews.keywordInput.trim())) {
      setNewNews({
        ...newNews,
        metaKeywords: [...newNews.metaKeywords, newNews.keywordInput.trim()],
        keywordInput: '',
      });
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setNewNews({
      ...newNews,
      metaKeywords: newNews.metaKeywords.filter(k => k !== keyword),
    });
  };

  const handleCreateNews = async () => {
    try {
      if (!newNews.title || !newNews.excerpt || !newNews.content) {
        toast.error('Please fill in all required fields');
        return;
      }

      const slug = newNews.slug || generateSlug(newNews.title);

      await createNews({
        title: newNews.title,
        slug,
        excerpt: newNews.excerpt,
        content: newNews.content,
        category: newNews.category,
        tags: newNews.tags,
        authorName: newNews.authorName,
        status: newNews.status,
        metaTitle: newNews.metaTitle || newNews.title,
        metaDescription: newNews.metaDescription || newNews.excerpt,
        metaKeywords: newNews.metaKeywords,
        isFeatured: newNews.isFeatured,
        allowComments: newNews.allowComments,
      });

      toast.success('News article created successfully');
      setIsAddNewsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create news article');
      console.error('Error creating news:', error);
    }
  };

  const handleUpdateNews = async () => {
    if (!selectedNews) return;

    try {
      const slug = newNews.slug || generateSlug(newNews.title);

      await updateNews({
        newsId: selectedNews._id as Id<"news">,
        title: newNews.title,
        slug,
        excerpt: newNews.excerpt,
        content: newNews.content,
        category: newNews.category,
        tags: newNews.tags,
        authorName: newNews.authorName,
        status: newNews.status,
        metaTitle: newNews.metaTitle || newNews.title,
        metaDescription: newNews.metaDescription || newNews.excerpt,
        metaKeywords: newNews.metaKeywords,
        isFeatured: newNews.isFeatured,
        allowComments: newNews.allowComments,
      });

      toast.success('News article updated successfully');
      setIsEditNewsDialogOpen(false);
      setSelectedNews(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to update news article');
      console.error('Error updating news:', error);
    }
  };

  const handleStatusChange = async (newsId: string, newStatus: News['status']) => {
    try {
      await updateNewsStatus({
        newsId: newsId as Id<"news">,
        status: newStatus,
      });
      toast.success('News status updated');
    } catch (error) {
      toast.error('Failed to update news status');
      console.error('Error updating news status:', error);
    }
  };

  const handleToggleFeatured = async (newsId: string) => {
    try {
      await toggleFeatured({ newsId: newsId as Id<"news"> });
      toast.success('Featured status toggled');
    } catch (error) {
      toast.error('Failed to toggle featured status');
      console.error('Error toggling featured:', error);
    }
  };

  const handleDeleteNews = async (newsId: string) => {
    if (!confirm('Are you sure you want to delete this news article?')) return;

    try {
      await deleteNews({ newsId: newsId as Id<"news"> });
      toast.success('News article deleted successfully');
    } catch (error) {
      toast.error('Failed to delete news article');
      console.error('Error deleting news:', error);
    }
  };

  const resetForm = () => {
    setNewNews({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'company_news',
      tags: [],
      tagInput: '',
      authorName: 'Admin',
      status: 'draft',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [],
      keywordInput: '',
      isFeatured: false,
      allowComments: true,
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getNewsByStatus = (status: string) => {
    return news.filter((article: News) => article.status === status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">News Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage news articles and blog posts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddNewsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add News Article
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Articles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{newsStats.total}</p>
              </div>
              <Newspaper className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{newsStats.byStatus.published}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{newsStats.totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Featured</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{newsStats.featured}</p>
              </div>
              <Star className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Articles</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search news..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48">
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

          {/* News Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'all' ? 'All Articles' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 
                ({activeTab === 'all' ? filteredNews.length : getNewsByStatus(activeTab).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(activeTab === 'all' ? filteredNews : getNewsByStatus(activeTab)).map((article: News) => (
                    <TableRow key={article._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {article.isFeatured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                          <div>
                            <div className="font-medium">{article.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{article.excerpt}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={categoryColors[article.category]}>
                          {categoryLabels[article.category]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{article.authorName}</div>
                      </TableCell>
                      <TableCell>
                        <Select value={article.status} onValueChange={(value: News['status']) => handleStatusChange(article._id, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Eye className="h-3 w-3 text-gray-400" />
                            <span>{article.views}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <TrendingUp className="h-3 w-3 text-gray-400" />
                            <span>{article.likes}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleFeatured(article._id)}
                            className={article.isFeatured ? 'text-yellow-600' : ''}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedNews(article);
                              setNewNews({
                                title: article.title,
                                slug: article.slug,
                                excerpt: article.excerpt,
                                content: article.content,
                                category: article.category,
                                tags: article.tags,
                                tagInput: '',
                                authorName: article.authorName,
                                status: article.status,
                                metaTitle: article.metaTitle || '',
                                metaDescription: article.metaDescription || '',
                                metaKeywords: article.metaKeywords,
                                keywordInput: '',
                                isFeatured: article.isFeatured,
                                allowComments: article.allowComments,
                              });
                              setIsEditNewsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteNews(article._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add News Dialog */}
      <Dialog open={isAddNewsDialogOpen} onOpenChange={setIsAddNewsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Article</DialogTitle>
            <DialogDescription>
              Create a new news article or blog post
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newNews.title}
                onChange={(e) => setNewNews({ ...newNews, title: e.target.value, slug: generateSlug(e.target.value) })}
                placeholder="Enter article title"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={newNews.slug}
                onChange={(e) => setNewNews({ ...newNews, slug: e.target.value })}
                placeholder="url-friendly-slug"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-generated from title if left empty</p>
            </div>
            <div>
              <Label htmlFor="excerpt">Excerpt *</Label>
              <Textarea
                id="excerpt"
                value={newNews.excerpt}
                onChange={(e) => setNewNews({ ...newNews, excerpt: e.target.value })}
                rows={2}
                placeholder="Brief summary of the article"
              />
            </div>
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={newNews.content}
                onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                rows={8}
                placeholder="Full article content (supports markdown)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newNews.category} onValueChange={(value: News['category']) => setNewNews({ ...newNews, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company_news">Company News</SelectItem>
                    <SelectItem value="industry_insights">Industry Insights</SelectItem>
                    <SelectItem value="success_stories">Success Stories</SelectItem>
                    <SelectItem value="product_updates">Product Updates</SelectItem>
                    <SelectItem value="tips_guides">Tips & Guides</SelectItem>
                    <SelectItem value="announcements">Announcements</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newNews.status} onValueChange={(value: News['status']) => setNewNews({ ...newNews, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={newNews.tagInput}
                  onChange={(e) => setNewNews({ ...newNews, tagInput: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add tags"
                />
                <Button type="button" onClick={handleAddTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {newNews.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="authorName">Author Name</Label>
              <Input
                id="authorName"
                value={newNews.authorName}
                onChange={(e) => setNewNews({ ...newNews, authorName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newNews.isFeatured}
                    onChange={(e) => setNewNews({ ...newNews, isFeatured: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Featured Article</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newNews.allowComments}
                    onChange={(e) => setNewNews({ ...newNews, allowComments: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Allow Comments</span>
                </label>
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={newNews.metaTitle}
                    onChange={(e) => setNewNews({ ...newNews, metaTitle: e.target.value })}
                    placeholder="SEO title (defaults to article title)"
                  />
                </div>
                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={newNews.metaDescription}
                    onChange={(e) => setNewNews({ ...newNews, metaDescription: e.target.value })}
                    rows={2}
                    placeholder="SEO description (defaults to excerpt)"
                  />
                </div>
                <div>
                  <Label htmlFor="metaKeywords">Meta Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      id="metaKeywords"
                      value={newNews.keywordInput}
                      onChange={(e) => setNewNews({ ...newNews, keywordInput: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                      placeholder="Add SEO keywords"
                    />
                    <Button type="button" onClick={handleAddKeyword}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newNews.metaKeywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveKeyword(keyword)}>
                        {keyword} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddNewsDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateNews}>
              Create Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit News Dialog */}
      <Dialog open={isEditNewsDialogOpen} onOpenChange={setIsEditNewsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
            <DialogDescription>
              Update news article information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTitle">Title *</Label>
              <Input
                id="editTitle"
                value={newNews.title}
                onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="editSlug">Slug</Label>
              <Input
                id="editSlug"
                value={newNews.slug}
                onChange={(e) => setNewNews({ ...newNews, slug: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="editExcerpt">Excerpt *</Label>
              <Textarea
                id="editExcerpt"
                value={newNews.excerpt}
                onChange={(e) => setNewNews({ ...newNews, excerpt: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="editContent">Content *</Label>
              <Textarea
                id="editContent"
                value={newNews.content}
                onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                rows={8}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editCategory">Category</Label>
                <Select value={newNews.category} onValueChange={(value: News['category']) => setNewNews({ ...newNews, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company_news">Company News</SelectItem>
                    <SelectItem value="industry_insights">Industry Insights</SelectItem>
                    <SelectItem value="success_stories">Success Stories</SelectItem>
                    <SelectItem value="product_updates">Product Updates</SelectItem>
                    <SelectItem value="tips_guides">Tips & Guides</SelectItem>
                    <SelectItem value="announcements">Announcements</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select value={newNews.status} onValueChange={(value: News['status']) => setNewNews({ ...newNews, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="editTags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="editTags"
                  value={newNews.tagInput}
                  onChange={(e) => setNewNews({ ...newNews, tagInput: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add tags"
                />
                <Button type="button" onClick={handleAddTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {newNews.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newNews.isFeatured}
                    onChange={(e) => setNewNews({ ...newNews, isFeatured: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Featured Article</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newNews.allowComments}
                    onChange={(e) => setNewNews({ ...newNews, allowComments: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Allow Comments</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditNewsDialogOpen(false); setSelectedNews(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateNews}>
              Update Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

