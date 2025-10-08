import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Target, 
  Users, 
  Lightbulb, 
  Shield, 
  Globe, 
  TrendingUp
} from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We continuously push the boundaries of what&apos;s possible in franchising through cutting-edge technology and creative solutions.'
    },
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'We build trust through transparent operations, secure blockchain technology, and honest communication with all stakeholders.'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'We believe in the power of collaboration, bringing together franchisors, franchisees, and investors for mutual success.'
    },
    {
      icon: Target,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from platform development to customer service and operational standards.'
    },
    {
      icon: Globe,
      title: 'Global Impact',
      description: 'We&apos;re building a platform that connects franchise opportunities worldwide, democratizing access to business ownership.'
    },
    {
      icon: TrendingUp,
      title: 'Growth',
      description: 'We foster growth for our team, partners, and the entire franchise ecosystem through continuous learning and development.'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
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

      {/* Stats Section */}
      {/* <div className="py-16 bg-white dark:bg-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-stone-600 dark:text-stone-400" />
                </div>
                <h3 className="text-3xl font-bold text-stone-900 dark:text-white mb-2">{stat.number}</h3>
                <p className="text-stone-600 dark:text-stone-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Our Story Section */}
      <div id="our-story" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <Image src="/images/about.png" alt="Our Story" width={500} height={500} />

            <div>
              <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-6">
                Our Story
              </h2>
              <p className="text-lg text-stone-600 dark:text-stone-300 mb-6">
                Franchiseen was born from a vision to transform the traditional franchise industry. We recognized that the franchise model, 
                while powerful, was limited by geographical constraints, complex financial barriers, and 
                lack of transparency.
              </p>
              <p className="text-lg text-stone-600 dark:text-stone-300 mb-6">
                Our founder, experienced in both blockchain technology and franchise operations, saw an 
                opportunity to create a platform that would democratize franchise ownership, enable 
                fractional investments, and provide unprecedented transparency through smart contracts 
                and AI-powered analytics.
              </p>
              <p className="text-lg text-stone-600 dark:text-stone-300 mb-8">
                Today, Franchiseen connects franchisors, franchisees, and investors worldwide, making 
                business ownership accessible to everyone while ensuring operational excellence and 
                sustainable growth.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="py-20 bg-stone-50 dark:bg-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card >
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-stone-100 dark:bg-stone-900/30 rounded-full flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-stone-600 dark:text-stone-400" />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 dark:text-white mb-4">Our Mission</h3>
                <p className="text-lg text-stone-600 dark:text-stone-300">
                  To democratize franchise ownership by leveraging blockchain technology and AI-powered 
                  analytics, making business opportunities accessible to everyone while ensuring 
                  operational excellence and sustainable growth for all stakeholders.
                </p>
              </CardContent>
            </Card>

            <Card >
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-stone-100 dark:bg-stone-900/30 rounded-full flex items-center justify-center mb-6">
                  <Lightbulb className="w-8 h-8 text-stone-600 dark:text-stone-400" />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 dark:text-white mb-4">Our Vision</h3>
                <p className="text-lg text-stone-600 dark:text-stone-300">
                  To become the world&apos;s leading franchise platform, connecting millions of entrepreneurs, 
                  investors, and brands globally, while setting new standards for transparency, efficiency, 
                  and innovation in the franchise industry.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-300 max-w-3xl mx-auto">
              These core values guide everything we do and shape our culture, decisions, and relationships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-stone-600 dark:text-stone-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-stone-900 dark:text-white mb-3">{value.title}</h3>
                  <p className="text-stone-600 dark:text-stone-300">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      {/* <div className="py-20 bg-stone-50 dark:bg-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-4">
              Our Leadership Team
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-300 max-w-3xl mx-auto">
              Meet the visionary leaders driving innovation and growth at Franchiseen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-stone-900 dark:text-white mb-1">{member.name}</h3>
                  <p className="text-stone-600 dark:text-stone-400 mb-2">{member.position}</p>
                  <Badge variant="secondary" className="mb-3">{member.experience}</Badge>
                  <p className="text-sm text-stone-600 dark:text-stone-300 mb-4">{member.bio}</p>
                  <a href={member.linkedin} className="text-blue-600 hover:text-blue-700">
                    <Linkedin className="w-5 h-5 mx-auto" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div> */}

      {/* Timeline Section */}
      {/* <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-300 max-w-3xl mx-auto">
              Key milestones in our mission to revolutionize the franchise industry.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-stone-200 dark:bg-stone-700"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="w-1/2 px-8">
                    <Card className={`border-0 shadow-lg ${index % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center mb-3">
                          <Clock className="w-5 h-5 text-stone-500 mr-2" />
                          <span className="text-sm font-medium text-stone-500">{milestone.year}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">{milestone.title}</h3>
                        <p className="text-stone-600 dark:text-stone-300">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="w-4 h-4 bg-stone-600 dark:bg-stone-400 rounded-full border-4 border-white dark:border-stone-800 relative z-10"></div>
                  <div className="w-1/2 px-8"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div> */}

      {/* Contact Section */}
      {/* <div className="py-20 bg-stone-50 dark:bg-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-300 max-w-3xl mx-auto">
              Ready to join the franchise revolution? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-stone-900 dark:text-white mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-stone-600 dark:text-stone-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900 dark:text-white mb-1">Address</h4>
                    <p className="text-stone-600 dark:text-stone-300">
                      Dubai, United Arab Emirates<br />
                      Business Bay District
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-stone-600 dark:text-stone-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900 dark:text-white mb-1">Phone</h4>
                    <p className="text-stone-600 dark:text-stone-300">+971 4 123 4567</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-stone-600 dark:text-stone-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900 dark:text-white mb-1">Email</h4>
                    <p className="text-stone-600 dark:text-stone-300">info@franchiseen.com</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-semibold text-stone-900 dark:text-white mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors">
                    <Linkedin className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors">
                    <Twitter className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors">
                    <Facebook className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors">
                    <Instagram className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  </a>
                </div>
              </div>
            </div>

            <div>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold text-stone-900 dark:text-white mb-6">Send us a Message</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent dark:bg-stone-700 dark:text-white"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Email</label>
                      <input 
                        type="email" 
                        className="w-full px-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent dark:bg-stone-700 dark:text-white"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Message</label>
                      <textarea 
                        rows={4}
                        className="w-full px-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent dark:bg-stone-700 dark:text-white"
                        placeholder="Your message..."
                      ></textarea>
                    </div>
                    <Button className="w-full">
                      Send Message
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}
