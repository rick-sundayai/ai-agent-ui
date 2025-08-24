// src/app/agent/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AgentPage() {
  const supabase = await createClient();

  // Use getUser() for server components
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/auth/login');
  }

  const signOut = async () => {
    'use server';
    // Server Actions also use the same self-contained client
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect('/auth/login');
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-gray-400">Welcome, {user.email}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}