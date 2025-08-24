# AI Agent UI - Authentication Setup Guide

This guide will help you set up the authentication system for the AI Agent UI application.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Node.js**: Ensure you have Node.js installed (version 18+)

## Step 1: Supabase Project Setup

### 1.1 Create a New Supabase Project
1. Log into your Supabase dashboard
2. Click "New Project"
3. Choose an organization and provide:
   - Project name: `ai-agent-workspace`
   - Database password: (choose a secure password)
   - Region: (choose closest to your users)
4. Click "Create new project" and wait for setup to complete

### 1.2 Apply Database Schema
1. In your Supabase dashboard, go to the **SQL Editor**
2. Copy the entire contents of `database/schema.sql`
3. Paste it into the SQL Editor and click **Run**
4. Verify that all tables were created successfully in the **Table Editor**

### 1.3 Get Your Project Credentials
1. Go to **Project Settings** → **API**
2. Note down:
   - Project URL
   - Public anon key
   - Service role key (keep this secure)

## Step 2: Environment Configuration

### 2.1 Create Environment File
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## Step 3: Create Initial Admin User

Since the application requires admin approval for new users, you need to create an initial admin user manually.

### 3.1 Create Admin User via Supabase Dashboard

1. Go to **Authentication** → **Users** in your Supabase dashboard
2. Click **Add User** → **Create new user**
3. Fill in the form:
   - **Email**: `admin@yourdomain.com` (use a real email you control)
   - **Password**: Create a secure password
   - **Email Confirm**: Uncheck this (manual creation)
   - **Auto Confirm**: Check this

4. Click **Create User**

### 3.2 Create Admin Profile

1. Go to **Table Editor** → **user_profiles**
2. Click **Insert** → **Insert row**
3. Fill in the profile data:
   - **user_id**: Copy the UUID from the user you just created (found in Authentication → Users)
   - **email**: Same email as the auth user
   - **first_name**: Your first name
   - **last_name**: Your last name
   - **role**: Select `admin` from dropdown
   - **status**: Select `active` from dropdown
   - **department**: (optional) e.g., "IT"
   - Leave other fields as default

4. Click **Save**

## Step 4: Start the Application

### 4.1 Install Dependencies
```bash
cd frontEnd/ai-agent-ui
npm install
```

### 4.2 Start Development Server
```bash
npm run dev
```

### 4.3 Access the Application
1. Open your browser to `http://localhost:3000`
2. You should be redirected to the login page
3. Sign in with the admin credentials you created

## Step 5: Test Authentication Flow

### 5.1 Test Admin Login
1. Navigate to `/auth/login`
2. Enter your admin credentials
3. You should be redirected to `/admin/dashboard`
4. Verify you can see the admin interface with user management

### 5.2 Test User Registration Flow
1. Open an incognito/private window
2. Navigate to `/auth/register`
3. Submit a registration request
4. In your admin dashboard, you should see the pending request
5. Test the invitation system by creating user invitations

### 5.3 Test Role-Based Access
1. Try accessing different dashboard URLs:
   - `/admin/dashboard` (Admin only)
   - `/dashboard/sales` (Sales Manager + Admin)
   - `/dashboard/recruiter` (All roles)
2. Verify unauthorized access redirects work properly

## Step 6: Email Configuration (Optional)

For production use, configure email settings in Supabase:

1. Go to **Authentication** → **Settings**
2. Configure **SMTP Settings** with your email provider
3. Customize **Email Templates** for:
   - Password reset emails
   - Invitation emails
   - Confirmation emails

## Troubleshooting

### Common Issues

**1. "User not found" error when logging in**
- Verify the user exists in Authentication → Users
- Check that user_profiles table has matching entry
- Ensure user_id in profile matches auth.users.id

**2. "Access denied" after login**
- Check user profile has `status: 'active'`
- Verify role is set correctly
- Check RLS policies are applied correctly

**3. Database connection issues**
- Verify environment variables are correct
- Check Supabase project is active and running
- Confirm database schema was applied successfully

**4. Middleware redirect loops**
- Clear browser cache and cookies
- Check middleware.ts configuration
- Verify role-based redirect logic

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Review Supabase logs in the dashboard
3. Verify all environment variables are set correctly
4. Ensure database schema matches the application expectations

## Security Notes

- Never commit `.env.local` to version control
- Use strong passwords for all admin accounts  
- Regularly review user access and permissions
- Monitor authentication logs for suspicious activity
- Keep Supabase service role key secure and never expose it client-side

## Next Steps

Once authentication is working:
1. Configure email templates for your brand
2. Set up additional admin users as needed
3. Create user roles and permissions as required
4. Implement additional security features (2FA, session limits, etc.)
5. Monitor and analyze user authentication patterns