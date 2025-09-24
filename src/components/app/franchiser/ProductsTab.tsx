"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Pencil, Image as ImageIcon, X, Upload, Package, Store } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAllProductCategories } from '@/hooks/useMasterData';
import { Id } from '../../../../convex/_generated/dataModel';

export interface Product {
  _id: Id<"franchiserProducts">;
  franchiserId: Id<"franchiser">;
  name: string;
  description?: string;
  cost: number;
  price: number;
  images: Id<"_storage">[];
  category: string;
  status: "draft" | "active" | "archived";
  stock?: number;
  sold?: number;
  createdAt: number;
}

interface ProductsTabProps {
  products: Product[];
  productImageUrls?: string[];
}

export function ProductsTab({ products, productImageUrls = [] }: ProductsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  
  // Fetch product categories for display
  const productCategories = useAllProductCategories();
  
  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = productCategories?.find(cat => cat._id === categoryId);
    return category?.name || categoryId;
  };
  
  // Helper function to calculate margin percentage
  const calculateMargin = (cost: number, price: number) => {
    if (cost === 0) return 0;
    return ((price - cost) / cost) * 100;
  };
  
  // Form state
  const [formData, setFormData] = useState<Omit<Product, '_id' | 'franchiserId' | 'createdAt' | 'images'>>({
    name: '',
    description: '',
    cost: 0,
    price: 0,
    category: '',
    status: 'active',
    stock: 0,
    sold: 0,
  });
  
  const [imagePreview, setImagePreview] = useState<string>('');

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        setFormData(prev => ({ ...prev, image: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      cost: 0,
      price: 0,
      category: '',
      status: 'active',
      stock: 0,
      sold: 0,
    });
    setImagePreview('');
    setEditingProduct(null);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement product creation/update with Convex mutations
    console.log('Form submitted:', formData);
    resetForm();
    setIsDialogOpen(false);
  };

  // Edit product
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      cost: product.cost,
      price: product.price,
      category: product.category,
      status: product.status,
      stock: product.stock || 0,
      sold: product.sold || 0,
    });
    setImagePreview(product.images.length > 0 ? productImageUrls[0] || '' : '');
    setIsDialogOpen(true);
  };

  // Delete product
  const handleDelete = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      // TODO: Implement product deletion with Convex mutation
      console.log('Delete product:', productToDelete);
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button onClick={() => {
          resetForm();
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Sold</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-stone-500">
                        No products found. Add your first product to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product, index) => {
                      const margin = calculateMargin(product.cost, product.price);
                      return (
                        <TableRow key={product._id}>
                        <TableCell>
                            {product.images.length > 0 && productImageUrls[index] ? (
                            <div className="relative h-10 w-10">
                              <Image
                                  src={productImageUrls[index]}
                                alt={product.name}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 bg-stone-100 rounded flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-stone-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{getCategoryName(product.category)}</TableCell>
                        <TableCell>${product.cost.toFixed(2)}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className={`font-medium ${
                              margin > 0 ? 'text-green-600' : margin < 0 ? 'text-red-600' : 'text-stone-600'
                            }`}>
                              {margin.toFixed(1)}%
                            </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{product.stock || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Store className="h-4 w-4 text-green-500" />
                            <span className="font-medium">{product.sold || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                product.status === 'active'
                                ? 'bg-green-100 text-green-800' 
                                  : product.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-stone-100 text-stone-800'
                            }`}
                          >
                              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                              onClick={() => handleDelete(product._id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Image Upload */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Product Image</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg">
                    {imagePreview ? (
                      <div className="relative w-full h-48">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData(prev => ({ ...prev, image: '' }));
                          }}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                        >
                          <X className="h-4 w-4 text-stone-600" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="mx-auto h-12 w-12 text-stone-400">
                          <Upload className="mx-auto h-12 w-12" />
                        </div>
                        <div className="mt-4 flex text-sm">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
                
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium">
                    Category
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories?.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="cost" className="block text-sm font-medium">
                      Cost ($)
                    </label>
                    <Input
                      id="cost"
                      name="cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="price" className="block text-sm font-medium">
                      Price ($)
                    </label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-500" />
                      <label htmlFor="stock" className="block text-sm font-medium">
                        Stock Quantity
                      </label>
                    </div>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-green-500" />
                      <label htmlFor="sold" className="block text-sm font-medium">
                        Sold Quantity
                      </label>
                    </div>
                    <Input
                      id="sold"
                      name="sold"
                      type="number"
                      min="0"
                      value={formData.sold}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this product? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
