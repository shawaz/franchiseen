#!/bin/bash

# Fix imports to use local types instead of shared package

echo "🔧 Fixing imports for deployment..."

# Fix admin dashboard imports
find apps/admin-dashboard/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/@franchiseen\/shared/..\/types\/shared/g'

# Fix franchise dashboard imports  
find apps/franchise-dashboard/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/@franchiseen\/shared/..\/types\/shared/g'

# Fix client portal imports
find apps/client-portal/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/@franchiseen\/shared/..\/types\/shared/g'

echo "✅ Import fixes complete!"
