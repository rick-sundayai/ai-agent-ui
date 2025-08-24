// src/app/apps/admin/dashboard/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  // Await createClient for Next.js 15 compatibility
  const supabase = await createClient();

  // Use getUser() for server components - it's more secure
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    return redirect('/auth/login');
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-gray-400">Welcome, {user.email}</p>
    </div>
  );
}