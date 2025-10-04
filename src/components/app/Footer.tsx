'use client'

import React from 'react';
import Link from 'next/link';
// import { Instagram, Facebook, Youtube } from 'iconsax-reactjs';
import Image from 'next/image';

export default function Footer() {

  return (
    <footer className="bg-white hidden md:block dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo and tagline */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Franchiseen Logo" className="h-8 w-8" width={32} height={32} unoptimized />
              <span className="text-xl ml-2 font-bold">FRANCHISEEN</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            </div>


          </div>

          {/* Services links */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/company/services/franchisee" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Franchisee</Link>
              </li>
              <li>
                <Link href="/company/services/franchiser" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Franchiser</Link>
              </li>
              <li>
                <Link href="/company/services/agent" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Franchise</Link>
              </li>
              <li>
                <Link href="/company/services/training" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Agents</Link>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/company/how" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">How it Works</Link>
              </li>
              <li>
                <Link href="/company/about" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">About Us</Link>
              </li>
              <li>
                <Link href="/company/careers" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Careers</Link>
              </li>
              <li>
                <Link href="/company/blog" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Blog</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/company/help" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Help Center</Link>
              </li>
              <li>
                <Link href="/company/doc" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Documentation</Link>
              </li>
              
              <li>
                <Link href="/company/support" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Support</Link>
              </li>
              <li>
                <Link href="/company/faq
                " className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">FAQs</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/company/legal/franchise" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Franchise Policy</Link>
              </li>
              <li>
                <Link href="/company/legal/funds" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Investment Policy</Link>
              </li>
              <li>
                <Link href="/company/legal/terms" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Terms of Service</Link>
              </li>
              <li>
                <Link href="/company/legal/privacy" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Privacy Policy</Link>
              </li>
            </ul>
          </div>

        </div>
      </div>
      <div className="border-t border-stone-200 dark:border-stone-700 py-4 text-center text-stone-500 dark:text-stone-400 flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 gap-2">
        <div>DEMO PLATFORM FOR MARKETING AND TESTING</div>
      </div>
    </footer>
  );
} 