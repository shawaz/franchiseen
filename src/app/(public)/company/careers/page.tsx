import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CreditCard, Lightbulb, TrendingUp, Users } from 'lucide-react';

export default function CareersPage() {
  const openPositions = [
    {
      id: 'senior-blockchain-developer',
      title: 'Senior Blockchain Developer',
      department: 'Technology',
      location: 'Dubai, UAE',
      type: 'Full-time',
      experience: '5+ years',
      salary: 'AED 25,000 - 35,000',
      description: 'Lead blockchain development for our franchise platform, implementing smart contracts and DeFi solutions.',
      requirements: [
        '5+ years experience in blockchain development',
        'Expertise in Solidity, Web3.js, and smart contracts',
        'Experience with DeFi protocols and tokenization',
        'Strong knowledge of Ethereum and other blockchain networks',
        'Previous experience in fintech or franchise industry preferred'
      ],
      benefits: ['Competitive salary', 'Health insurance', 'Annual bonus', 'Professional development', 'Flexible working hours']
    },
    {
      id: 'franchise-operations-manager',
      title: 'Franchise Operations Manager',
      department: 'Operations',
      location: 'Dubai, UAE',
      type: 'Full-time',
      experience: '7+ years',
      salary: 'AED 20,000 - 30,000',
      description: 'Oversee franchise operations, ensuring quality standards and operational excellence across all locations.',
      requirements: [
        '7+ years in franchise operations or multi-unit management',
        'Strong leadership and team management skills',
        'Experience with franchise systems and brand management',
        'Excellent communication and problem-solving abilities',
        'Bachelor\'s degree in Business Administration or related field'
      ],
      benefits: ['Competitive salary', 'Performance bonus', 'Health insurance', 'Car allowance', 'Professional development']
    },
    {
      id: 'ai-ml-engineer',
      title: 'AI/ML Engineer',
      department: 'Technology',
      location: 'Dubai, UAE',
      type: 'Full-time',
      experience: '4+ years',
      salary: 'AED 22,000 - 32,000',
      description: 'Develop AI-powered solutions for franchise analytics, predictive modeling, and automated decision-making.',
      requirements: [
        '4+ years experience in machine learning and AI development',
        'Proficiency in Python, TensorFlow, PyTorch, and scikit-learn',
        'Experience with data science and predictive analytics',
        'Knowledge of cloud platforms (AWS, GCP, Azure)',
        'Previous experience in fintech or analytics preferred'
      ],
      benefits: ['Competitive salary', 'Stock options', 'Health insurance', 'Learning budget', 'Remote work options']
    },
    {
      id: 'investment-analyst',
      title: 'Investment Analyst',
      department: 'Finance',
      location: 'Dubai, UAE',
      type: 'Full-time',
      experience: '3+ years',
      salary: 'AED 18,000 - 28,000',
      description: 'Analyze franchise investment opportunities, conduct due diligence, and provide investment recommendations.',
      requirements: [
        '3+ years experience in investment analysis or financial advisory',
        'Strong analytical and financial modeling skills',
        'Knowledge of franchise industry and investment vehicles',
        'CFA or similar professional certification preferred',
        'Excellent communication and presentation skills'
      ],
      benefits: ['Competitive salary', 'Performance bonus', 'Health insurance', 'Professional development', 'Annual leave']
    },
    {
      id: 'customer-success-manager',
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: 'Dubai, UAE',
      type: 'Full-time',
      experience: '3+ years',
      salary: 'AED 15,000 - 25,000',
      description: 'Ensure customer satisfaction and success for franchisees, franchisors, and investors on our platform.',
      requirements: [
        '3+ years in customer success or account management',
        'Experience with B2B SaaS platforms',
        'Strong relationship building and communication skills',
        'Knowledge of franchise industry preferred',
        'Bachelor\'s degree in Business or related field'
      ],
      benefits: ['Competitive salary', 'Commission structure', 'Health insurance', 'Professional development', 'Team events']
    },
    {
      id: 'marketing-specialist',
      title: 'Digital Marketing Specialist',
      department: 'Marketing',
      location: 'Dubai, UAE',
      type: 'Full-time',
      experience: '2+ years',
      salary: 'AED 12,000 - 20,000',
      description: 'Develop and execute digital marketing campaigns to promote our franchise platform and attract new users.',
      requirements: [
        '2+ years experience in digital marketing',
        'Proficiency in Google Ads, Facebook Ads, and SEO',
        'Experience with content marketing and social media',
        'Analytical skills and experience with marketing tools',
        'Bachelor\'s degree in Marketing or related field'
      ],
      benefits: ['Competitive salary', 'Health insurance', 'Professional development', 'Creative freedom', 'Team collaboration']
    }
  ];

  const departments = [
    { name: 'Technology', count: 12, color: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300' },
    { name: 'Operations', count: 8, color: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300' },
    { name: 'Finance', count: 5, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
    { name: 'Marketing', count: 4, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
    { name: 'Customer Success', count: 6, color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-stone-50 dark:bg-stone-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-stone-900 dark:text-white mb-6">
              JOIN OUR TEAM
            </h1>
            <p className="text-xl text-stone-600 dark:text-stone-300 mb-8 max-w-3xl mx-auto">
              Be part of the future of franchising. Join Franchiseen and help us 
              revolutionize the franchise industry through innovative technology and exceptional service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="#open-positions" 

              >
                <Button>
                  View Open Positions
                </Button>
              </Link>
              {/* <Link 
                href="/company/about" 
                className="border border-stone-600 text-stone-600 hover:bg-stone-50 dark:hover:bg-stone-900/20 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Learn About Us
              </Link> */}
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
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">Innovation First</h3>
              <p className="text-stone-600 dark:text-stone-300 text-sm">Work with cutting-edge blockchain and AI technologies</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-stone-600 dark:text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">Great Team</h3>
              <p className="text-stone-600 dark:text-stone-300 text-sm">Collaborate with talented professionals from around the world</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-stone-600 dark:text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">Competitive Benefits</h3>
              <p className="text-stone-600 dark:text-stone-300 text-sm">Enjoy excellent compensation and comprehensive benefits</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-stone-600 dark:text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">Growth Opportunities</h3>
              <p className="text-stone-600 dark:text-stone-300 text-sm">Advance your career with continuous learning and development</p>
            </div>
          </div>
        </div>
      </div>

      {/* Departments Section */}
      <div className="bg-stone-50 dark:bg-stone-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-4">
              Our Departments
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-300 max-w-3xl mx-auto">
              Join one of our dynamic departments and contribute to revolutionizing the franchise industry.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {departments.map((dept, index) => (
              <div key={index} className="text-center">
                <h3 className="text-lg font-semibold text-stone-900 dark:text-white">{dept.name}</h3>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mt-3 bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300`}>
                  {dept.count} Openings
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Open Positions Section */}
      <div id="open-positions" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-4">
              Open Positions
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-300 max-w-3xl mx-auto">
              Discover exciting career opportunities and help us build the future of franchising.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {openPositions.map((position) => (
              <div key={position.id} className="bg-white dark:bg-stone-800 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-stone-900 dark:text-white mb-2">{position.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300">
                        {position.department}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-300">
                        {position.type}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300">
                        {position.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-stone-600 dark:text-stone-300 mb-4">{position.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-stone-500 dark:text-stone-400">Experience:</span>
                      <p className="text-stone-900 dark:text-white">{position.experience}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-stone-500 dark:text-stone-400">Salary:</span>
                      <p className="text-stone-900 dark:text-white">{position.salary}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-stone-900 dark:text-white mb-2">Key Requirements:</h4>
                  <ul className="text-sm text-stone-600 dark:text-stone-300 space-y-1">
                    {position.requirements.slice(0, 3).map((req, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-4 h-4 text-stone-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-stone-900 dark:text-white mb-2">Benefits:</h4>
                  <div className="flex flex-wrap gap-2">
                    {position.benefits.slice(0, 3).map((benefit, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/company/careers/apply?position=${position.id}`}
                    className="flex-1 bg-stone-600 hover:bg-stone-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Apply Now
                  </Link>
                  <Link
                    href={`/company/careers/position/${position.id}`}
                    className="flex-1 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 text-center py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-stone-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Don&apos;t See the Right Role?
          </h2>
          <p className="text-xl text-stone-100 mb-8">
            We&apos;re always looking for talented individuals to join our team. Send us your resume and let&apos;s explore opportunities together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/company/careers/apply" 
              className="bg-white hover:bg-stone-100 text-stone-600 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Send Your Resume
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
