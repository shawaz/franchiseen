# Convex Auth with Resend Setup

This document explains how to set up Convex authentication with Resend email verification for the Franchiseen application.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Resend API Key (get from https://resend.com/api-keys)
RESEND_API_KEY=your_resend_api_key_here

# Convex Auth Domain (for production, use your domain)
AUTH_DOMAIN=localhost:3000
```

## Setup Steps

### 1. Get Resend API Key

1. Go to [Resend](https://resend.com) and create an account
2. Navigate to API Keys section
3. Create a new API key
4. Add it to your environment variables

### 2. Configure Convex

1. Run `npx convex dev` to start the Convex development server
2. The auth configuration will be automatically deployed

### 3. Update Domain Configuration

For production deployment, update the `AUTH_DOMAIN` environment variable to your production domain.

## Features Implemented

### Authentication Flow

1. **Email-only Authentication**: Users enter their email address
2. **OTP Verification**: A 6-digit code is sent via email using Resend
3. **Profile Creation**: After verification, users complete their profile with:
   - Username (unique)
   - First Name
   - Last Name
   - Date of Birth
   - Avatar (optional)

### Wallet Generation

- **Automatic Wallet Creation**: A Solana wallet is automatically generated for each new user
- **No Seed Phrase**: The wallet is generated programmatically without exposing seed phrases
- **Secure Storage**: Private keys are stored securely in the database

### Header Integration

- **Replaced Phantom Wallet**: The header now shows email authentication instead of wallet connection
- **User Profile Display**: Shows user avatar, name, and wallet address when signed in
- **Sign Out**: Users can sign out from the dropdown menu

## Components

### Auth Components

- `EmailAuth.tsx`: Handles email sign-in and OTP verification
- `SignupForm.tsx`: Handles new user registration and profile creation
- `AuthHeader.tsx`: Replaces wallet dropdown in the header

### Backend Functions

- `auth.ts`: Convex auth configuration with Resend integration
- `userManagement.ts`: User profile management functions

## Usage

### Sign In Flow

1. User clicks "Sign In" in the header
2. Enters email address
3. Receives OTP via email
4. Enters OTP to complete sign-in

### Sign Up Flow

1. User clicks "Sign In" then "Don't have an account? Sign up"
2. Enters email address
3. Receives OTP via email
4. Verifies OTP
5. Completes profile with additional information
6. Solana wallet is automatically generated

### Session Management

- Users remain signed in across browser sessions
- Profile information is cached and available throughout the app
- Wallet information is accessible for Solana transactions

## Security Features

- **Email Verification**: All accounts require email verification
- **OTP Expiration**: Verification codes expire after 15 minutes
- **Unique Usernames**: Username conflicts are prevented
- **Secure Wallet Storage**: Private keys are stored securely (in production, consider encryption)

## Production Considerations

1. **Encrypt Private Keys**: Consider encrypting Solana private keys before storing
2. **Rate Limiting**: Implement rate limiting for OTP requests
3. **Email Templates**: Customize email templates for better branding
4. **Domain Verification**: Verify your domain with Resend for production
5. **SSL Certificate**: Ensure HTTPS is enabled for production

## Troubleshooting

### Common Issues

1. **OTP Not Received**: Check spam folder, verify Resend API key
2. **Username Taken**: Try a different username
3. **Email Invalid**: Ensure email format is correct
4. **Connection Issues**: Check Convex deployment status

### Debug Steps

1. Check browser console for errors
2. Verify environment variables are set
3. Check Convex dashboard for function errors
4. Verify Resend API key permissions
