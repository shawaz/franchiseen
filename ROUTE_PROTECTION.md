# Route Protection System

This document describes the route protection system implemented for the Franchiseen application.

## Overview

The application implements client-side route protection to control access to different parts of the platform based on user authentication status.

## Allowed Routes (Non-Authenticated Users)

When users are **not signed in**, they can only access:

1. **Home page**: `/`
2. **Company pages**: `/company/*` (all routes under the company directory)
3. **Brand/Franchise listings**: `/[brandSlug]/[franchiseSlug]` and `/[brandSlug]/[franchiseSlug]/*` (specific franchise pages and sub-routes)

## Protected Routes (Authenticated Users Only)

When users are **signed in**, they have access to all routes including:

- `/account` - User account management
- `/admin` - Admin panel
- `/create` - Create new content
- `/register` - Registration forms
- `/notify` - Notifications
- All nested routes under protected paths

## Implementation Details

### Components

1. **RouteGuard** (`src/components/auth/RouteGuard.tsx`)
   - Main route protection component
   - Checks authentication status and redirects unauthorized users
   - Shows loading state during authentication check

2. **AuthStatus** (`src/components/auth/AuthStatus.tsx`)
   - Displays current authentication status to users
   - Shows limited access warning for non-authenticated users
   - Provides sign-in/sign-out buttons

3. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Manages authentication state across the application
   - Provides authentication status and user profile data

### Route Patterns

- **Public routes**: `/`, `/company/*`
- **Brand/Franchise routes**: `/[brandSlug]/[franchiseSlug]` and `/[brandSlug]/[franchiseSlug]/*` (two or more path segments)
- **Protected routes**: All other routes require authentication

### Authentication Flow

1. User visits a route
2. RouteGuard checks authentication status from AuthContext
3. If not authenticated and route is protected → redirect to `/`
4. If authenticated or route is public → allow access
5. AuthStatus component shows current authentication state

## Testing

The route protection logic has been tested with various route patterns:

```javascript
// Allowed for non-authenticated users
✅ / (home)
✅ /company (company pages)
✅ /company/about (company subpages)
✅ /nike/store-1 (brand/franchise listings)
✅ /mcdonalds/downtown-location (brand/franchise listings)

// Blocked for non-authenticated users
❌ /account
❌ /admin
❌ /create
❌ /register
❌ /notify
❌ /some-brand/some-franchise/account (nested protected routes)
```

## Usage

The route protection is automatically applied through the app layout. No additional configuration is needed.

### Adding New Public Routes

To add new public routes, update the `RouteGuard` component:

```typescript
// In RouteGuard.tsx
const isPublicRoute = pathname === '/' || 
                     pathname.startsWith('/company') ||
                     pathname.match(/^\/[^\/]+\/[^\/]+$/);
```

### Adding New Protected Routes

Protected routes are automatically blocked for non-authenticated users. No additional configuration needed.

## Security Notes

- This is client-side protection and should be complemented with server-side authentication
- Sensitive operations should always verify authentication on the backend
- The system provides user experience improvements but should not be the only security measure
