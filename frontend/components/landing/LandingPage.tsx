'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield,
  AlertTriangle,
  Search,
  HelpCircle,
  ArrowRight,
  CheckCircle,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Shield,
    title: 'Strengths',
    description: 'Highlights of the property (size, location, features)',
    bgColor: 'from-blue-50 to-white',
    borderColor: 'border-blue-100',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: AlertTriangle,
    title: 'Risks',
    description: 'Potential issues like flood zones, crime rates, or hidden costs',
    bgColor: 'from-orange-50 to-white',
    borderColor: 'border-orange-100',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    icon: Search,
    title: 'Hidden Issues',
    description: "Critical problems that listings don't disclose",
    bgColor: 'from-red-50 to-white',
    borderColor: 'border-red-100',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  {
    icon: HelpCircle,
    title: 'Questions to Ask',
    description: 'Smart prompts for sellers and agents',
    bgColor: 'from-indigo-50 to-white',
    borderColor: 'border-indigo-100',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
];

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
};


const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: 'easeOut' },
};

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-transparent"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div
              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 shadow-sm"
              variants={scaleIn}
            >
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              AI-Powered Property Analysis
            </motion.div>

            <motion.h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight"
              variants={fadeInUp}
            >
              AI-Powered Property Insights for
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {' '}
                  First-Time Buyers
                </span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-4 sm:mb-6 leading-relaxed font-medium"
              variants={fadeInUp}
            >
              Paste a listing → Get instant analysis.
            </motion.p>

            <motion.p
              className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed"
              variants={fadeInUp}
            >
              Quickly see strengths, risks, and key questions to ask — so you don&apos;t miss what
              matters.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
              variants={fadeInUp}
            >
              <Link href="/auth/signup">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Try it free
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/auth/signin">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Sign In
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What You&apos;ll See
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Clear insights on what matters most for your decision
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={`border ${feature.borderColor} bg-gradient-to-br ${feature.bgColor} hover:shadow-xl transition-all duration-300 cursor-pointer`}
                  >
                    <CardContent className="pt-4 pb-4 sm:pt-6 sm:pb-6 px-4 sm:px-6">
                      <motion.div
                        className={`w-10 h-10 sm:w-12 sm:h-12 ${feature.iconBg} rounded-xl flex items-center justify-center mb-3 sm:mb-4`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.iconColor}`} />
                      </motion.div>
                      <h3 className="text-sm sm:text-base font-semibold text-black mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to smarter property decisions
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            {[
              {
                step: '1',
                title: 'Paste a listing description',
                description: 'From Zillow, Redfin, or any real estate site',
              },
              {
                step: '2',
                title: 'Get instant insights',
                description: 'Strengths, risks, and red flags in seconds',
              },
              {
                step: '3',
                title: 'Ask smarter questions',
                description: 'When talking to your realtor',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl mb-4 sm:mb-6 shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-2xl sm:text-3xl font-bold text-blue-600">{item.step}</span>
                </motion.div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Use ListingIQ Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Use ListingIQ?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Buying your first home is overwhelming. ListingIQ makes it easier by giving you:
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl mb-4 sm:mb-6">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Clarity
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                On what&apos;s good and what&apos;s risky
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl mb-4 sm:mb-6">
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Confidence
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                To ask the right questions
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl mb-4 sm:mb-6">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Peace of mind
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Before you move forward
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Output Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Example Output
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              See what kind of insights you&apos;ll get
            </p>
          </div>
          <Card className="p-6 sm:p-8 shadow-sm bg-white">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start gap-3">
                <span className="text-red-500 mt-0.5 text-lg sm:text-xl font-bold flex-shrink-0">
                  ⚠️
                </span>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  <strong>Risk:</strong> The property is located in a flood zone which could mean
                  higher insurance costs.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5 text-lg sm:text-xl font-bold flex-shrink-0">
                  ✓
                </span>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  <strong>Strength:</strong> Estimated monthly payment is reasonable for the area.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-0.5 text-lg sm:text-xl font-bold flex-shrink-0">
                  ❓
                </span>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  <strong>Question to ask:</strong> What&apos;s the property tax history?
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-blue-600 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700/20 to-transparent"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
          >
            <motion.h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6"
              variants={fadeInUp}
            >
              Start Smarter Today
            </motion.h2>

            <motion.p
              className="text-lg sm:text-xl text-blue-100 mb-8 sm:mb-12 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Run your first free analysis in under 30 seconds.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
              variants={fadeInUp}
            >
              <Link href="/auth/signup">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Paste a listing now
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/auth/signin">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 border-white text-white bg-transparent hover:bg-white hover:text-blue-600 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Sign In
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer Banner */}
      <div className="bg-amber-50 border-t border-amber-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm text-amber-800">
            ⚡ ListingIQ is experimental and for informational purposes only. Not financial, legal,
            or real estate advice.
          </p>
        </div>
      </div>
    </div>
  );
}
