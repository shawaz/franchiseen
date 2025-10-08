import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  TrendingUp, 
  CreditCard,
  Lightbulb,
  PlayCircle
} from 'lucide-react';

export default function HowItWorksPage() {

  return (
    <div>
        <div className="bg-stone-50 dark:bg-stone-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-stone-900 dark:text-white mb-6">
             Get Started With Franchiseen
            </h1>
            <p className="text-xl text-stone-600 dark:text-stone-300 mb-8 max-w-4xl mx-auto">
              Franchiseen is a platform that allows you to invest in franchises and earn money from them.
            </p>
          </div>
        </div>
      </div>
      {/* Explaination Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-4">
              How Franchiseen Works
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-300 max-w-3xl mx-auto">
                A guide to how to use the franchiseen platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-stone-600 dark:text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">Invest & Earn</h3>
              <p className="text-stone-600 dark:text-stone-300 text-sm">How to buy franchise token and <br /> earn from it</p>
              <Button asChild className='mt-4'>
                <Link href="#our-story"> <PlayCircle className="w-4 h-4" /> Watch Video</Link>
              </Button>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-stone-600 dark:text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">Register & Create</h3>
              <p className="text-stone-600 dark:text-stone-300 text-sm">How to register brands and <br /> create a franchise</p>
              <Button asChild className='mt-4'>
                <Link href="#our-story"> <PlayCircle className="w-4 h-4" /> Watch Video</Link>
              </Button>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-stone-600 dark:text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">Leads & Funding</h3>
              <p className="text-stone-600 dark:text-stone-300 text-sm">How you can get leads and <br /> funding a franchise</p>
              <Button asChild className='mt-4'>
                <Link href="#our-story"> <PlayCircle className="w-4 h-4" /> Watch Video</Link>
              </Button>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-stone-600 dark:text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">Manage & Payouts</h3>
              <p className="text-stone-600 dark:text-stone-300 text-sm">How you can manage and <br /> distribute payouts for your franchise</p>
              <Button asChild className='mt-4'>
                <Link href="#our-story"> <PlayCircle className="w-4 h-4" /> Watch Video</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
