import * as React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { EquipmentCard } from '@/components/equipment/EquipmentCard';
import { equipmentApi } from '@/lib/api/equipment';
import { ROUTES, QUERY_KEYS } from '@/constants';
import { ArrowRight, Check, Clock, Shield, Zap } from 'lucide-react';

export const Home: React.FC = () => {
  const { data: equipment } = useQuery({
    queryKey: [QUERY_KEYS.EQUIPMENT_AVAILABLE],
    queryFn: equipmentApi.getAvailable,
  });

  const featuredEquipment = equipment?.slice(0, 6) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-blue-700 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

        <div className="container-custom section-padding relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="text-center lg:text-left animate-fade-in-up">
              <h1 className="heading-xl mb-6 leading-tight">
                Share, Lend, and Borrow Items in Your
                <span className="block text-secondary"> Community</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100 leading-relaxed max-w-2xl">
                Avaro Share is the ultimate peer-to-peer platform for sharing equipment, tools, and everyday items. Connect with others, lend what you don't use, and borrow what you need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to={ROUTES.EQUIPMENT}>
                  <Button size="lg" variant="secondary" className="group">
                    Browse Equipment
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/30 hover:bg-white/20 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hidden lg:block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/30 to-blue-500/30 blur-3xl"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Items Listed', value: '150+' },
                      { label: 'Active Users', value: '500+' },
                      { label: 'Total Borrows', value: '2,000+' },
                      { label: 'Community Rating', value: '4.9★' },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-4 bg-white/5 rounded-xl">
                        <div className="text-3xl font-bold text-secondary mb-1">{stat.value}</div>
                        <div className="text-sm text-blue-100">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-md mb-4">Why Choose Avaro Share?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make peer-to-peer sharing simple, secure, and rewarding for everyone in the community.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Zap,
                title: 'Instant Booking',
                description: 'Borrow items instantly with our streamlined process. No long waits for approval.',
              },
              {
                icon: Clock,
                title: 'Flexible Sharing',
                description: 'Borrow for a day, week, or month. Lend your items whenever they are free.',
              },
              {
                icon: Shield,
                title: 'Secure Platform',
                description: 'Built-in payments and verification to keep your items and transactions safe.',
              },
              {
                icon: Check,
                title: 'Community Driven',
                description: 'Connect with neighbors, save money, and reduce waste by sharing resources.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Equipment */}
      {featuredEquipment.length > 0 && (
        <section className="section-padding">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="heading-md mb-2">Featured Items</h2>
                <p className="text-gray-600">Explore popular items listed by the community</p>
              </div>
              <Link to={ROUTES.EQUIPMENT}>
                <Button variant="outline">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredEquipment.map((item) => (
                <EquipmentCard key={item.id} equipment={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-md mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Find What You Need',
                description: 'Explore the catalog and find the perfect item listed by someone nearby.',
              },
              {
                step: '02',
                title: 'Book Instantly',
                description: 'Select your dates, complete the booking, and make a secure online payment.',
              },
              {
                step: '03',
                title: 'Meet & Borrow',
                description: 'Meet the lender, pick up your item, and return it when you are done!',
              },
            ].map((step, index) => (
              <div key={step.step} className="relative text-center">
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
                )}
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary text-white text-3xl font-bold mb-6 shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600 max-w-sm mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary to-blue-700 text-white">
        <div className="container-custom text-center">
          <h2 className="heading-lg mb-6">Ready to Join the Community?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of users already using Avaro Share to lend their gear and borrow what they need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={ROUTES.REGISTER}>
              <Button size="lg" variant="secondary">
                Create Free Account
              </Button>
            </Link>
            <Link to={ROUTES.EQUIPMENT}>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 hover:bg-white/20 text-white">
                Browse Items
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};
