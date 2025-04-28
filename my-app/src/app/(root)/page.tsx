'use client';

import { SignOut } from '@/lib/actions/user.actions';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const handleLogOut = async () => {
    try {
      await SignOut();
      console.log("User logged out successfully");

      router.push('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <div className="">
      <button onClick={handleLogOut}> Log Out</button>
    </div>
  );
}
