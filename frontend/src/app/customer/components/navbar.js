'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/services/auth.service';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const router = useRouter();
  const { cartBadge } = useCart();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        if (currentUser && currentUser.id) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();

    const handleAuthLogoutEvent = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleAuthLogoutEvent);
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogoutEvent);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (search.trim()) {
      router.push(`/customer?search=${encodeURIComponent(search.trim())}`);
    } else {
      router.push('/customer');
    }
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-6">
        <Link
          href="/customer"
          className="text-2xl font-black tracking-tight text-gray-900"
        >
          ML<span className="text-[#5c4ce1]">C</span>
        </Link>

        <form onSubmit={handleSearchSubmit} className="relative w-64 md:w-80">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            type="search"
            placeholder="Search products..."
            aria-label="Search products"
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100/80 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5c4ce1] transition"
          />
          <span className="absolute left-3 top-2.5 text-gray-400" aria-hidden="true">
            ⌕
          </span>
        </form>
      </div>

      <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-gray-700">
        <Link href="/customer/orders" className="hidden sm:block hover:text-[#5c4ce1] transition">
          Orders
        </Link>

        <Link href="/customer/wishlist" className="hidden sm:block hover:text-[#5c4ce1] transition">
          Favourites
        </Link>

        <Link href="/customer/cart" className="relative hover:text-[#5c4ce1] transition flex items-center gap-1 font-semibold">
          <span>🛒 Cart</span>
          {cartBadge > 0 && (
            <span className="bg-[#5c4ce1] text-white text-[11px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-xs">
              {cartBadge}
            </span>
          )}
        </Link>

        {/* Dynamic Auth Section */}
        {!loading && (
          user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
              <Link
                href="/customer/profile"
                className="flex items-center gap-2 hover:opacity-80 transition group cursor-pointer"
                title="View Profile"
              >
                <span className="w-8 h-8 rounded-full bg-[#5c4ce1]/10 text-[#5c4ce1] flex items-center justify-center font-bold text-xs group-hover:bg-[#5c4ce1] group-hover:text-white transition">
                  {initial}
                </span>
                <div className="hidden md:block text-left leading-tight">
                  <p className="text-xs font-semibold text-gray-900 truncate max-w-[100px] group-hover:text-[#5c4ce1] transition">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-gray-400 capitalize">
                    {user.role}
                  </p>
                </div>
              </Link>



              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-[#5c4ce1] rounded-full hover:bg-gray-100 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#5c4ce1] hover:bg-[#4a3bc7] rounded-full transition shadow-xs"
              >
                Register
              </Link>
            </div>
          )
        )}
      </nav>
    </header>
  );
}
