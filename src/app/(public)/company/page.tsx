export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About Franchiseen
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            The all-in-one franchise platform for brands and franchisees
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-stone-50 dark:bg-stone-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">For Brands</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Expand your business with our comprehensive franchise management platform.
              </p>
            </div>
            <div className="bg-stone-50 dark:bg-stone-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">For Franchisees</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Find and invest in the perfect franchise opportunity for your goals.
              </p>
            </div>
            <div className="bg-stone-50 dark:bg-stone-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">For Investors</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Discover profitable franchise investment opportunities with real-time data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
