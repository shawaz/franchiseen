'use client'

import React from 'react';
import Link from 'next/link';
// import { Instagram, Facebook, Youtube } from 'iconsax-reactjs';
import Image from 'next/image';

export default function Footer() {

  return (
    <footer className="bg-white hidden md:block dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-800">
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 items-center ">
         <div className="flex flex-col space-y-8 justify-between items-center">
      
            <Image src="/logo.svg" alt="Franchiseen Logo" className="h-8 w-8" width={32} height={32} unoptimized />
            <span className="text-xl ml-2 font-bold">FRANCHISEEN</span>
   

          <ul className="space-y-3 flex  gap-8">
            <li>
              <Link href="/company/how" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">How</Link>
            </li>
            <li>
              <Link href="/company/about" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">About</Link>
            </li>
            <li>
              <Link href="/company/careers" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Jobs</Link>
            </li>
            <li>
              <Link href="/company/blog" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Blog</Link>
            </li>
          </ul>
          
          </div> 
          



      </div> */}
      <div className=" dark:border-stone-700 w-full  py-4 text-center text-stone-500 dark:text-stone-400 flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 gap-2">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Franchiseen Logo" className="h-6 w-6" width={26} height={26} unoptimized />
          <span className="text-lg ml-2 font-bold">FRANCHISEEN</span>
          </div>
        <div className="flex gap-8 font-semibold text-sm">
          <Link href="/company/how" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">How</Link>
          <Link href="/company/about" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">About</Link>
          <Link href="/company/careers" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Jobs</Link>
          <Link href="/company/news" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">News</Link>
        </div>
        </div>
      </div>
      <div className="border-t border-stone-200 dark:border-stone-600/50 w-full  py-4 text-center text-stone-500 dark:text-stone-400 flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 gap-2">
        <div className="flex justify-between items-center w-full">
        <div className="text-sm">ADVANCED FUTURE INFORMATION TECHNOLOGY LLC © {new Date().getFullYear()} </div>
        <div className="flex gap-8 font-semibold text-sm">
          <Link href="/company/legal/terms" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Terms of Service</Link>
          <Link href="/company/legal/privacy" className="text-stone-600 dark:text-stone-300 dark:hover:text-yellow-600 hover:text-yellow-600">Privacy Policy</Link>
        </div>
        </div>
      </div>
    </footer>
  );
} 