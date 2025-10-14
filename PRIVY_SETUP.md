# Privy Authentication Setup Guide

This application now uses Privy for authentication, replacing the previous Resend email authentication.

## Features

Privy provides:
- **Email authentication** - Passwordless login via email
- **Social login** - Google OAuth integration
- **Wallet connection** - Connect existing crypto wallets
- **Embedded wallets** - Auto-create wallets for users without one
- **Cross-app user identity** - Users maintain their identity across apps

## Setup Instructions

### 1. Create a Privy Account

1. Go to [https://privy.io](https://privy.io)
2. Sign up for a free account
3. Create a new app in the Privy dashboard

### 2. Get Your App ID

1. In the Privy dashboard, navigate to your app settings
2. Copy your **App ID** (looks like: `clxxxxxxxxxxxxxxxxxxxxx`)
3. Add it to your environment variables

### 3. Configure Environment Variables

#### Local Development (.env.local)

```bash
# Privy Authentication
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
```

#### Production (Vercel)

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add: `NEXT_PUBLIC_PRIVY_APP_ID` with your production Privy app ID

#### Convex (if using Privy server-side verification)

```bash
# Optional: Only needed if you implement server-side verification
npx convex env set PRIVY_APP_SECRET "your_app_secret" --prod
```

### 4. Configure Privy Dashboard

In your Privy app settings, configure:

#### Allowed Domains

Add your domains:
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

#### Login Methods

Enable the methods you want:
- ✅ Email
- ✅ Google
- ✅ Wallet (Solana, Ethereum, etc.)

#### Embedded Wallets

Configure embedded wallet settings:
- **Create on login**: `users-without-wallets`
- **Chain**: Solana (or your preferred chain)

#### Appearance

Customize the login UI:
- **Theme**: Light or Dark
- **Accent Color**: `#676FFF` (or your brand color)
- **Logo**: Upload your logo

### 5. Test Authentication

1. Start your development server:
   ```bash
   npm run dev
   # or
   bun dev
   ```

2. Navigate to `/auth` or click "Sign In"
3. Test each login method:
   - Email login
   - Google OAuth
   - Wallet connection

### 6. User Flow

#### New Users
1. User clicks "Sign In"
2. Privy modal appears with login options
3. User chooses email, Google, or wallet
4. After authentication:
   - User data synced to Convex database
   - Solana wallet auto-generated if needed
   - User redirected to home/account page

#### Returning Users
1. User clicks "Sign In"
2. Privy recognizes them and auto-logs in
3. User data synced/updated in Convex
4. Redirected to intended page

## Code Structure

### Authentication Files

- **`src/contexts/PrivyAuthContext.tsx`** - Main auth context using Privy
- **`src/components/default/app-providers.tsx`** - Provider setup
- **`src/app/(public)/auth/page.tsx`** - Login page with Privy UI
- **`convex/userManagement.ts`** - User sync functions

### How It Works

1. **PrivyProvider** wraps the app (in `app-providers.tsx`)
2. **PrivyAuthProvider** handles user sync with Convex
3. When user logs in via Privy:
   - `syncPrivyUser` mutation creates/updates user in Convex
   - User data includes: `privyUserId`, `email`, `name`, `avatarUrl`
4. Components use `useAuth()` hook to access:
   - `isAuthenticated` - Boolean auth status
   - `userProfile` - Full user data from Convex
   - `privyUser` - Privy user object
   - `login()` - Trigger login modal
   - `logout()` - Sign out user

## Migration from Resend

All previous `AuthContext` imports have been updated to `PrivyAuthContext`. The `useAuth()` hook maintains the same interface for backward compatibility.

### Changes Made

1. ✅ Removed `@convex-dev/resend` package
2. ✅ Added `@privy-io/react-auth` and `@privy-io/server-auth`
3. ✅ Created `PrivyAuthContext` with Privy integration
4. ✅ Updated all components to use new context
5. ✅ Added `getUserByPrivyId` and `syncPrivyUser` to Convex
6. ✅ Updated schema with `privyUserId` index

### Environment Variables Removed

- ❌ `RESEND_API_KEY` (no longer needed)

### Environment Variables Added

- ✅ `NEXT_PUBLIC_PRIVY_APP_ID` (required)

## Troubleshooting

### "NEXT_PUBLIC_PRIVY_APP_ID is not set" error

Make sure you've added the Privy App ID to your `.env.local` file:
```bash
NEXT_PUBLIC_PRIVY_APP_ID=clxxxxxxxxxxxxxxxxxxxxx
```

### Login modal doesn't appear

1. Check browser console for errors
2. Verify your domain is added to Privy allowed domains
3. Check that PrivyProvider is wrapping your app

### User not syncing to Convex

1. Check Convex logs: `npm run convex:logs:dev`
2. Verify `syncPrivyUser` mutation is being called
3. Check that user has required fields (email or social data)

### Wallet not being created

1. Check Privy embedded wallet settings
2. Ensure "Create on login" is set to "users-without-wallets"
3. Verify Solana is configured as the wallet chain

## Support

- **Privy Docs**: [https://docs.privy.io](https://docs.privy.io)
- **Privy Discord**: [https://discord.gg/privy](https://discord.gg/privy)
- **Convex Docs**: [https://docs.convex.dev](https://docs.convex.dev)

## Next Steps

1. **Email Templates**: Customize email templates in Privy dashboard
2. **Server-Side Verification**: Add Privy JWT verification for API routes
3. **Multi-Factor Auth**: Enable additional security in Privy settings
4. **Analytics**: Track authentication events in Privy dashboard

