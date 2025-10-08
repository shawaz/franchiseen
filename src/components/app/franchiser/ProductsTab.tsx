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
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Label } from '@/components/ui/label';

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
  stockQuantity: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  unit?: string;
  createdAt: number;
}

interface ProductsTabProps {
  products: Product[];
  productImageUrls?: string[];
  franchiserId?: Id<"franchiser">;
}

export function ProductsTab({ products, productImageUrls = [], franchiserId }: ProductsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Fetch product categories for display
  const productCategories = useAllProductCategories();
  
  // Mutations
  const createProduct = useMutation(api.productManagement.createProduct);
  const updateProduct = useMutation(api.productManagement.updateProduct);
  const deleteProduct = useMutation(api.productManagement.deleteProduct);
  
  // File upload hook
  const { uploadFile } = useFileUpload();
  
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
    stockQuantity: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    unit: 'pieces',
  });
  
  const [imagePreview, setImagePreview] = useState<string>('');

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric fields to numbers
    if (name === 'cost' || name === 'price') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'stockQuantity' || name === 'minStockLevel' || name === 'maxStockLevel') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      // Store the file for upload
      setUploadedImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
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
      stockQuantity: 0,
      minStockLevel: 0,
      maxStockLevel: 0,
      unit: 'pieces',
    });
    setImagePreview('');
    setEditingProduct(null);
    setUploadedImageFile(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!franchiserId) {
      toast.error("Franchiser ID is required");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload image if a new file was selected
      let imageIds: Id<"_storage">[] = editingProduct?.images || [];
      
      if (uploadedImageFile) {
        const uploadedImageId = await uploadFile(uploadedImageFile);
        imageIds = [uploadedImageId];
      }
      
      // Ensure all numeric values are properly converted to numbers
      const cost = typeof formData.cost === 'string' ? parseFloat(formData.cost) : formData.cost;
      const price = typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price;
      const stockQuantity = typeof formData.stockQuantity === 'string' ? parseInt(formData.stockQuantity, 10) : formData.stockQuantity;
      const minStockLevel = formData.minStockLevel ? 
        (typeof formData.minStockLevel === 'string' ? parseInt(formData.minStockLevel, 10) : formData.minStockLevel) 
        : undefined;
      const maxStockLevel = formData.maxStockLevel ? 
        (typeof formData.maxStockLevel === 'string' ? parseInt(formData.maxStockLevel, 10) : formData.maxStockLevel) 
        : undefined;
      
      if (editingProduct) {
        // Update existing product
        await updateProduct({
          productId: editingProduct._id,
          name: formData.name,
          description: formData.description,
          cost: cost,
          price: price,
          category: formData.category,
          status: formData.status,
          stockQuantity: stockQuantity,
          minStockLevel: minStockLevel,
          maxStockLevel: maxStockLevel,
          unit: formData.unit,
          ...(imageIds.length > 0 && { images: imageIds }),
        });
        
        toast.success("Product updated successfully");
      } else {
        // Create new product
        await createProduct({
          franchiserId: franchiserId,
          name: formData.name,
          description: formData.description,
          cost: cost,
          price: price,
          category: formData.category,
          status: formData.status,
          stockQuantity: stockQuantity,
          minStockLevel: minStockLevel,
          maxStockLevel: maxStockLevel,
          unit: formData.unit,
          images: imageIds,
        });
        
        toast.success("Product created successfully");
      }
      
      resetForm();
      setIsDialogOpen(false);
      setUploadedImageFile(null);
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save product. Please try again.");
    } finally {
      setIsUploading(false);
    }
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
      stockQuantity: product.stockQuantity,
      minStockLevel: product.minStockLevel || 0,
      maxStockLevel: product.maxStockLevel || 0,
      unit: product.unit || 'pieces',
    });
    
    // Find the product's image URL from the productImageUrls array
    const productIndex = products.findIndex(p => p._id === product._id);
    if (productIndex !== -1 && product.images.length > 0) {
      // Calculate the correct index in the flattened image URLs array
      let imageUrlIndex = 0;
      for (let i = 0; i < productIndex; i++) {
        imageUrlIndex += products[i].images.length;
      }
      setImagePreview(productImageUrls[imageUrlIndex] || '');
    } else {
      setImagePreview('');
    }
    
    setIsDialogOpen(true);
  };

  // Delete product
  const handleDelete = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct({
          productId: productToDelete as Id<"franchiserProducts">,
        });
        
        toast.success("Product deleted successfully");
        
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
      } catch (error) {
        console.error("Failed to delete product:", error);
        toast.error(error instanceof Error ? error.message : "Failed to delete product. Please try again.");
      }
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
                            <span className="font-medium">{product.stockQuantity || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Store className="h-4 w-4 text-green-500" />
                            <span className="font-medium">0</span>
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
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-6 py-4">
              {/* Left Section - Product Photo (1/3 width) */}
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <div className="relative w-full aspect-square max-w-xs bg-stone-100 dark:bg-stone-800 rounded-lg overflow-hidden border-2 border-dashed border-stone-300 dark:border-stone-600">
                  {imagePreview ? (
                    <>
                      <Image
                        src={imagePreview}
                        alt="Product preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setUploadedImageFile(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-stone-400 mx-auto mb-2" />
                        <p className="text-sm text-stone-500">Upload product image</p>
                        <p className="text-xs text-stone-400">PNG, JPG (max. 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 w-full max-w-xs">
                  <input
                    id="product-image-upload"
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleImageUpload}
                  />
                  <label
                    htmlFor="product-image-upload"
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-stone-300 dark:border-stone-600 text-sm font-medium rounded-md text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </label>
                  <p className="text-xs text-center text-stone-500 dark:text-stone-400 mt-2">
                    PNG, JPG (max. 5MB)
                  </p>
                </div>
              </div>
              
              {/* Right Section - Product Details (2/3 width) */}
              <div className="w-full md:w-2/3 space-y-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-lg">Product Details</h4>
                    <p className="text-sm text-stone-500">
                      {formData.name || 'Enter product information'}
                      {formData.category && ` • ${getCategoryName(formData.category)}`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Product Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Signature Burger"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto">
                        {productCategories?.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.icon && <span className="mr-2">{category.icon}</span>}
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the product"
                    rows={3}
                    className="h-20"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost" className="text-sm font-medium">
                      Cost <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">$</span>
                      <Input
                        id="cost"
                        name="cost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.cost}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="pl-8"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium">
                      Selling Price <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">$</span>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="pl-8"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit" className="text-sm font-medium">
                      Unit
                    </Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pieces">Pieces</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="boxes">Boxes</SelectItem>
                        <SelectItem value="units">Units</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Stock Management Section */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-blue-600" />
                    Stock Management
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stockQuantity" className="text-sm font-medium">
                        Current Stock <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="stockQuantity"
                        name="stockQuantity"
                        type="number"
                        min="0"
                        value={formData.stockQuantity}
                        onChange={handleInputChange}
                        placeholder="0"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="minStockLevel" className="text-sm font-medium">
                        Min Stock Level
                      </Label>
                      <Input
                        id="minStockLevel"
                        name="minStockLevel"
                        type="number"
                        min="0"
                        value={formData.minStockLevel}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxStockLevel" className="text-sm font-medium">
                        Max Stock Level
                      </Label>
                      <Input
                        id="maxStockLevel"
                        name="maxStockLevel"
                        type="number"
                        min="0"
                        value={formData.maxStockLevel}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  {/* Stock Level Indicators */}
                  {formData.stockQuantity > 0 && (
                    <div className="mt-4 p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                      <h5 className="font-medium text-sm mb-2">Stock Status</h5>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            formData.stockQuantity === 0 
                              ? 'bg-red-500' 
                              : (formData.minStockLevel && formData.stockQuantity <= formData.minStockLevel)
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}></div>
                          <span className="text-sm">
                            {formData.stockQuantity === 0 
                              ? 'Out of Stock' 
                              : (formData.minStockLevel && formData.stockQuantity <= formData.minStockLevel)
                              ? 'Low Stock'
                              : 'In Stock'
                            }
                          </span>
                        </div>
                        <span className="text-sm text-stone-500">
                          {formData.stockQuantity} {formData.unit || 'units'} available
                        </span>
                      </div>
                      {formData.cost > 0 && (
                        <div className="mt-2 pt-2 border-t border-stone-200 dark:border-stone-700">
                          <div className="flex justify-between text-sm">
                            <span className="text-stone-600 dark:text-stone-400">Stock Value:</span>
                            <span className="font-semibold text-green-600">
                              ${(formData.stockQuantity * formData.cost).toLocaleString()}
                            </span>
                          </div>
                          {formData.price > 0 && (
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-stone-600 dark:text-stone-400">Profit Margin:</span>
                              <span className="font-semibold text-blue-600">
                                {((formData.price - formData.cost) / formData.cost * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Selection */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "draft" | "active" | "archived") => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-end space-x-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  editingProduct ? 'Update Product' : 'Add Product'
                )}
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
