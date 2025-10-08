import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building, 
  CheckCircle, 
  TrendingUp, 
  CreditCard,
  Lightbulb
} from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      step: 1,
      title: 'Register Your Brand',
      description: 'Create an account and submit your franchise brand for approval on our platform.',
      icon: Building
    },
    {
      step: 2,
      title: 'Create Franchise Opportunities',
      description: 'List your franchise locations with investment requirements and expected returns.',
      icon: TrendingUp
    },
    {
      step: 3,
      title: 'Get Approved',
      description: 'Our team reviews and approves your franchise opportunities for platform listing.',
      icon: CheckCircle
    },
    {
      step: 4,
      title: 'Investors Buy Shares',
      description: 'Investors browse and purchase fractional shares in your franchise opportunities.',
      icon: CreditCard
    },
    {
      step: 5,
      title: 'Daily Payouts',
      description: 'Receive daily automated payouts based on franchise performance and your share ownership.',
      icon: Users
    }
  ];

  return (
    <div>
        <div className="bg-stone-50 dark:bg-stone-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-stone-900 dark:text-white mb-6">
              ABOUT FRANCHISEEN
            </h1>
            <p className="text-xl text-stone-600 dark:text-stone-300 mb-8 max-w-4xl mx-auto">
              We&apos;re revolutionizing the franchise industry through innovative blockchain technology, 
              AI-powered analytics, and a commitment to democratizing business ownership worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="#our-story">Our Story</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/company/careers">Join Our Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Company Culture Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-4">
              Why Work With Us?
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-300 max-w-3xl mx-auto">
              We&apos;re building the future of franchising with cutting-edge technology, innovative solutions, 
              and a team that values creativity, collaboration, and excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
                
              <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-stone-600 dark:text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">Invest & Earn</h3>
              <p className="text-stone-600 dark:text-stone-300 text-sm">Work with cutting-edge blockchain and AI technologies</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-stone-600 dark:text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">Register & Create</h3>
              <p className="text-stone-600 dark:text-stone-300 text-sm">Enjoy excellent compensation and comprehensive benefits</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-stone-600 dark:text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">Leads & Funding</h3>
              <p className="text-stone-600 dark:text-stone-300 text-sm">Collaborate with talented professionals from around the world</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-stone-600 dark:text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">Manage & Payouts</h3>
              <p className="text-stone-600 dark:text-stone-300 text-sm">Advance your career with continuous learning and development</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hero Section */}
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-stone-900 dark:text-white mb-6">
              HOW FRANCHISEEN WORKS
            </h1>
            <p className="text-xl text-stone-600 dark:text-stone-300 mb-8 max-w-4xl mx-auto">
              Transform your franchise business with our revolutionary platform. From brand registration to daily payouts, 
              we make franchise operations simple and profitable.
            </p>
          </div>

          {/* Main Content - Video + Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Video Section */}
            <div className="order-2 lg:order-1">
              <div className="relative bg-stone-100 dark:bg-stone-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-700 dark:to-stone-800 flex items-center justify-center">
                  {/* Placeholder for video */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-stone-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <p className="text-stone-600 dark:text-stone-400 font-medium">Platform Demo Video</p>
                    <p className="text-sm text-stone-500 dark:text-stone-500">Coming Soon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps Section */}
            <div className="order-1 lg:order-2">
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-16 h-16 bg-stone-600 text-white rounded-full">
                        <span className="text-xl font-bold">{step.step}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center">
                          <step.icon className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-stone-900 dark:text-white">{step.title}</h3>
                      </div>
                      <p className="text-stone-600 dark:text-stone-300 text-lg leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/company/services">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/company/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
