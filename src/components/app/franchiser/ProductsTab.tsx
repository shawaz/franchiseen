"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Pencil, Image as ImageIcon, X, Upload, Package, Store } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export interface Product {
  id: string;
  name: string;
  description: string;
  cost: number;
  margin: number;
  price: number;
  image: string;
  isActive: boolean;
  whStock: number;
  franchiseStock: number;
  stock: {
    warehouse: number;
    franchise: number;
  };
  warehouse: number;
  franchise: number;
  createdAt: string;
  updatedAt: string;
}

// Dummy product data
const dummyProducts: Product[] = [
  {
      id: 'prod_1',
      name: 'Classic T-Shirt',
      description: 'Comfortable cotton t-shirt',
      cost: 15.99,
      margin: 50,
      price: 23.99,
      image: '/products/product-1.jpg',
      isActive: true,
      whStock: 100,
      franchiseStock: 42,
      stock: {
          warehouse: 100,
          franchise: 42
      },
      warehouse: 100,
      franchise: 42,
      createdAt: '2024-09-10T08:30:00Z',
      updatedAt: '2024-09-18T14:20:00Z',
  },
  {
    id: 'prod_2',
    name: 'Slim Fit Jeans',
    description: 'Stylish slim fit jeans',
    cost: 29.99,
    margin: 60,
    price: 47.98,
    image: '/products/product-2.jpg',
    isActive: true,
    whStock: 75,
    franchiseStock: 30,
    stock: {
      warehouse: 75,
      franchise: 30
    },
    warehouse: 75,
    franchise: 30,
    createdAt: '2024-09-05T10:15:00Z',
    updatedAt: '2024-09-17T16:45:00Z'
  },
  {
    id: 'prod_3',
    name: 'Running Shoes',
    description: 'High-performance running shoes',
    cost: 45.00,
    margin: 70,
    price: 76.50,
    image: '/products/product-3.jpg',
    isActive: true,
    whStock: 50,
    franchiseStock: 25,
    stock: {
      warehouse: 50,
      franchise: 25
    },
    warehouse: 50,
    franchise: 25,
    createdAt: '2024-08-20T09:45:00Z',
    updatedAt: '2024-09-19T11:30:00Z'
  },
  {
    id: 'prod_4',
    name: 'Formal Blazer',
    description: 'Elegant formal blazer',
    cost: 75.99,
    margin: 80,
    price: 136.78,
    image: '/products/product-4.jpg',
    isActive: true,
    whStock: 30,
    franchiseStock: 15,
    stock: {
      warehouse: 30,
      franchise: 15
    },
    warehouse: 30,
    franchise: 15,
    createdAt: '2024-08-15T14:20:00Z',
    updatedAt: '2024-09-17T10:15:00Z'
  },
  {
    id: 'prod_5',
    name: 'Summer Dress',
    description: 'Light and flowy summer dress',
    cost: 35.50,
    margin: 65,
    price: 58.58,
    image: '/products/product-5.jpg',
    isActive: true,
    whStock: 55,
    franchiseStock: 28,
    stock: {
      warehouse: 55,
      franchise: 28
    },
    warehouse: 55,
    franchise: 28,
    createdAt: '2024-05-12T13:45:00Z',
    updatedAt: '2024-09-16T15:20:00Z'
  }
];

export function ProductsTab() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [products, setProducts] = useState<Product[]>(dummyProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'stock'>>({
    name: '',
    description: '',
    cost: 0,
    margin: 0,
    price: 0,
    image: '',
    whStock: 0,
    franchiseStock: 0,
    warehouse: 0,
    franchise: 0,
  });
  
  const [stockData, setStockData] = useState({
    warehouse: 0,
    franchise: 0
  });
  
  const [imagePreview, setImagePreview] = useState<string>('');

  // Calculate price based on cost and margin
  const calculatePrice = (cost: number, margin: number) => {
    return cost + (cost * margin / 100);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      let updatedData = { ...prev, [name]: value };
      
      // If cost or margin changes, update the price
      if ((name === 'cost' || name === 'margin') && !isNaN(Number(value))) {
        const cost = name === 'cost' ? parseFloat(value) || 0 : parseFloat(prev.cost.toString()) || 0;
        const margin = name === 'margin' ? parseFloat(value) || 0 : parseFloat(prev.margin.toString()) || 0;
        updatedData.price = parseFloat(calculatePrice(cost, margin).toFixed(2));
      }
      
      return updatedData;
    });
  };
  
  // Handle stock changes
  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStockData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
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
      margin: 0,
      price: 0,
      image: '',
      whStock: 0,
      franchiseStock: 0,
      warehouse: 0,
      franchise: 0,
    });
    setStockData({
      warehouse: 0,
      franchise: 0
    });
    setImagePreview('');
    setEditingProduct(null);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    
    if (editingProduct) {
      // Update existing product
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? { 
              ...formData, 
              id: editingProduct.id, 
              stock: stockData,
              updatedAt: now, 
              isActive: editingProduct.isActive, 
              createdAt: editingProduct.createdAt 
            }
          : p
      ));
    } else {
      // Add new product
      const newProduct: Product = {
        ...formData,
        id: `prod_${Date.now()}`,
        stock: stockData,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      setProducts([...products, newProduct]);
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  // Edit product
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      cost: product.cost,
      margin: product.margin,
      price: product.price,
      image: product.image,
      whStock: product.whStock,
      franchiseStock: product.franchiseStock,
      warehouse: product.warehouse,
      franchise: product.franchise,
    });
    setStockData({
      warehouse: product.stock.warehouse,
      franchise: product.stock.franchise
    });
    setImagePreview(product.image);
    setIsDialogOpen(true);
  };

  // Delete product
  const handleDelete = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      setProducts(products.filter(p => p.id !== productToDelete));
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  // Toggle product status
  const toggleStatus = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId 
        ? { 
            ...p, 
            isActive: !p.isActive, 
            updatedAt: new Date().toISOString() 
          }
        : p
    ));
  };

  // Filter products based on active tab
  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(product => 
        activeTab === 'active' ? product.isActive : !product.isActive
      );

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
                    <TableHead>Cost</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Franchise</TableHead>
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
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.image ? (
                            <div className="relative h-10 w-10">
                              <Image
                                src={product.image}
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
                        <TableCell>${product.cost.toFixed(2)}</TableCell>
                        <TableCell>{product.margin}%</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <Package className="h-4 w-4 mr-1 text-blue-500" />
                            <span>{product.whStock}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <Store className="h-4 w-4 mr-1 text-green-500" />
                            <span>{product.franchiseStock}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-stone-100 text-stone-800'
                            }`}
                          >
                            {product.isActive ? 'Active' : 'Inactive'}
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
                            onClick={() => handleDelete(product.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
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
                
                {/* Stock Management */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-medium">Stock Management</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-blue-500" />
                        <label htmlFor="warehouse-stock" className="block text-sm font-medium">
                          Warehouse Stock
                        </label>
                      </div>
                      <Input
                        id="warehouse-stock"
                        name="warehouse"
                        type="number"
                        min="0"
                        value={stockData.warehouse}
                        onChange={handleStockChange}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Store className="h-4 w-4 mr-2 text-green-500" />
                        <label htmlFor="franchise-stock" className="block text-sm font-medium">
                          Franchise Stock
                        </label>
                      </div>
                      <Input
                        id="franchise-stock"
                        name="franchise"
                        type="number"
                        min="0"
                        value={stockData.franchise}
                        onChange={handleStockChange}
                        placeholder="0"
                      />
                    </div>
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
                  <label htmlFor="sku" className="block text-sm font-medium">
                    SKU
                  </label>
                  <Input
                    id="sku"
                    name="sku"
                    onChange={handleInputChange}
                    placeholder="Enter SKU (optional)"
                  />
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

                <div className="grid grid-cols-3 gap-4">
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
                    <label htmlFor="margin" className="block text-sm font-medium">
                      Margin (%)
                    </label>
                    <Input
                      id="margin"
                      name="margin"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.margin}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-stone-700">
                      Price
                    </label>
                    <div className="h-10 px-3 py-2 flex items-center border rounded-md bg-stone-50">
                      <span className="text-stone-900">${formData.price.toFixed(2)}</span>
                    </div>
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
