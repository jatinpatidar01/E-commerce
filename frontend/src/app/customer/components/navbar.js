'use client';

import { useState } from 'react';
import Link from 'next/link';
import { logout } from '@/services/auth.service';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [search, setSearch] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggedIn(false);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    // TODO: Navigate to the real product search page/API.
    // Example:
    // router.push(`/customer/products?search=${encodeURIComponent(search)}`);
    console.log('Search:', search);
  };

  return (
    <header className="px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between gap-4">
      <div className="flex items-center gap-6">
        <Link
          href="/customer"
          className="text-2xl font-black tracking-tight text-gray-900"
        >
          ML<span className="text-indigo-600">C</span>
        </Link>

        <form onSubmit={handleSearchSubmit} className="relative w-64 md:w-80">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            type="search"
            placeholder="Search..."
            aria-label="Search products"
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100/80 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400" aria-hidden="true">
            ⌕
          </span>
        </form>
      </div>

      <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-gray-700">
        <Link href="/customer/orders" className="hidden sm:block hover:text-indigo-600">
          Orders
        </Link>

        <Link href="/customer/wishlist" className="hidden sm:block hover:text-indigo-600">
          Favourites
        </Link>

        <Link href="/customer/cart" className="relative hover:text-indigo-600">
          Cart
          <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            0
          </span>
        </Link>

        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              U
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-red-500 hover:underline"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-indigo-600 rounded-full hover:bg-gray-100"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full"
            >
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
