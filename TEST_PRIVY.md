# 🧪 Test Privy Integration

## Your Configuration ✅

```
NEXT_PUBLIC_PRIVY_APP_ID: cmgn7j1ne009plb0cx3akmhll
```

## Quick Test Steps

### 1. Restart Dev Server

**IMPORTANT:** Stop and restart to pick up the latest code changes:

```bash
# Press Ctrl+C to stop current server

# Then start fresh
bun dev
```

### 2. Open Browser DevTools

Press `F12` or `Cmd+Option+I` (Mac) to open DevTools Console

### 3. Test Login Page

Navigate to: http://localhost:3000/auth

**What you should see in Console:**

```
✅ Privy App ID configured: true
✅ Is loading: false
✅ Is authenticated: false
```

### 4. Click "Sign in with Email"

**What should happen:**

1. Console shows: `"Login button clicked, opening Privy modal"`
2. **Privy modal appears** on screen
3. You can enter your email

### 5. If Modal Still Doesn't Appear

Try this debugging button. Add it temporarily to your auth page:

```typescript
// In src/app/(public)/auth/page.tsx
// Add this button for testing:

<Button 
  onClick={() => {
    console.log('Test button clicked');
    console.log('Privy App ID:', process.env.NEXT_PUBLIC_PRIVY_APP_ID);
    console.log('Login function:', typeof login);
    login();
  }}
  variant="destructive"
>
  DEBUG: Test Privy
</Button>
```

## Common Issues & Fixes

### Issue 1: Modal appears but immediately closes
**Fix:** Check Privy dashboard allowed domains include `http://localhost:3000`

### Issue 2: "Privy is not defined" error
**Fix:** Restart dev server, clear browser cache

### Issue 3: Modal doesn't appear at all
**Possible causes:**
- Ad blocker blocking modal
- Browser extension interfering
- React hydration mismatch

**Try:**
1. Disable ad blockers
2. Test in incognito mode
3. Check for console errors

### Issue 4: Network errors in console
**Fix:** Check Privy dashboard → Settings → Allowed domains

## Alternative: Test with Privy's usePrivy Hook Directly

Open http://localhost:3000 and paste this in browser console:

```javascript
// This won't work directly but helps debug
console.log('Window location:', window.location.href);
console.log('Privy App ID from env:', process.env.NEXT_PUBLIC_PRIVY_APP_ID);
```

## Expected Behavior

### ✅ Success Flow:

1. Visit `/auth` page
2. Click any login button  
3. **Privy modal slides in from right**
4. Choose login method (Email, Google, or Wallet)
5. Complete authentication
6. Redirected to home page
7. User info appears in account dropdown

### ❌ If You See:

- Blank page → Check console for errors
- Button does nothing → Check if `login` function is defined
- Modal flashes and closes → Check allowed domains
- "Not configured" message → App ID issue

## Next Steps After Login Works

Once you can successfully log in:

1. **Test user sync:** Check if user appears in Convex dashboard
2. **Test wallet:** Check if Privy embedded wallet was created
3. **Test navigation:** Verify protected routes work
4. **Test logout:** Click logout and verify session ends

## Need More Help?

Check these in order:

1. **Browser Console** (F12) - Look for red errors
2. **Network Tab** - Check for failed API calls to Privy
3. **Privy Dashboard** - Check app settings and logs
4. **Privy Status** - https://status.privy.io

---

## 🚀 After Restart Command

```bash
# 1. Stop server (Ctrl+C)
# 2. Start fresh
bun dev

# 3. Open browser
open http://localhost:3000/auth

# 4. Open DevTools
# Press F12

# 5. Click login button
# Watch console for logs
```

