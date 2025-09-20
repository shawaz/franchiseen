import { Box, Search } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface ProductsTabProps {
  products: Product[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: string[];
}

export function ProductsTab({
  products,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  categories
}: ProductsTabProps) {
  return (
    <div className="space-y-6">
      {/* Categories and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {['All Items', ...categories].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-amber-500 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-stone-500" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-sm h-9"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products
          .filter(product => 
            (selectedCategory === 'All Items' || product.category === selectedCategory) &&
            (searchQuery === '' || 
              product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.description.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-stone-200">
              <div className="relative h-48 bg-stone-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-lg text-stone-800 dark:text-white">{product.name}</h3>
                  <p className="text-sm text-stone-600 line-clamp-2 mt-1 dark:text-stone-400">
                    {product.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-amber-600 font-bold text-lg">${product.price.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}
