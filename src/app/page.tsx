'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

// Components
const MotionDiv = motion.div

function AnimatedSection({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  text 
}: { 
  icon: React.ElementType, 
  title: string, 
  text: string 
}) {
  return (
    <motion.div
      className="flex flex-col items-start space-y-4 p-6 bg-white rounded-lg shadow-sm border border-gray-100"
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="p-3 rounded-full bg-blue-100 text-blue-600 shadow-sm">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-md font-semibold">{title}</h3>
      <p className="text-gray-600">{text}</p>
    </motion.div>
  )
}

function StatCard({ number, label }: { number: string, label: string }) {
  return (
    <motion.div 
      className="flex flex-col items-center"
      whileHover={{ scale: 1.05 }} 
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-4xl font-bold text-blue-600">{number}</h3>
      <p className="font-medium text-md text-gray-500">{label}</p>
    </motion.div>
  )
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect authenticated users to dashboard
  if (status === 'authenticated') {
    router.replace('/dashboard')
    return null
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col items-start space-y-6 max-w-full md:max-w-[50%] mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                VetCEE Accreditation Portal
              </h1>
              <p className="text-xl">
                The official platform for veterinary training providers to apply for and manage course accreditation through VetCEE.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/auth/signin"
                  className="px-6 py-3 bg-white text-blue-800 rounded font-medium flex items-center justify-center hover:bg-gray-50 hover:shadow-md transition-all"
                >
                  Access the portal
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </Link>
                <Link
                  href="/about"
                  className="px-6 py-3 border border-white text-white rounded font-medium hover:bg-white/20 transition-all"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <MotionDiv
              className="w-full md:w-[45%] h-[250px] md:h-[350px] rounded-lg overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-full h-full bg-blue-300 flex items-center justify-center">
                <span className="text-blue-800">Image Placeholder</span>
              </div>
            </MotionDiv>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <AnimatedSection>
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col space-y-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <h2 className="text-3xl font-bold">Why Choose VetCEE Accreditation?</h2>
                <p className="text-lg text-gray-600 max-w-3xl">
                  VetCEE is the leading independent accreditation body for veterinary continuing professional development. Our accreditation ensures your courses meet internationally recognized standards.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <FeatureCard 
                  icon={(props) => (
                    <svg {...props} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                  )}
                  title="Quality Assurance" 
                  text="Gain recognition for your high-quality educational programs through our rigorous evaluation process." 
                />
                <FeatureCard 
                  icon={(props) => (
                    <svg {...props} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
                    </svg>
                  )}
                  title="Enhanced Credibility" 
                  text="Demonstrate your commitment to excellence in continuing veterinary education with VetCEE accreditation." 
                />
                <FeatureCard 
                  icon={(props) => (
                    <svg {...props} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path>
                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"></path>
                    </svg>
                  )}
                  title="Professional Standards" 
                  text="Align your courses with international best practices in veterinary continuing professional development." 
                />
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection>
        <div className="bg-gray-100 py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between bg-white p-8 rounded-lg shadow-lg border border-gray-200">
              <div className="flex flex-col items-center md:items-start space-y-4 max-w-full md:max-w-[60%] mb-6 md:mb-0">
                <h3 className="text-2xl font-bold">Ready to Get Your Course Accredited?</h3>
                <p className="text-md text-gray-600">
                  Join the growing network of accredited veterinary education providers. Start your application today and elevate the standard of your training programs.
                </p>
              </div>
              <MotionDiv whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/apply" 
                  className="px-6 py-3 bg-blue-600 text-white rounded font-medium flex items-center hover:bg-blue-700 transition-all"
                >
                  Start Application
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </Link>
              </MotionDiv>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Stats Section */}
      <AnimatedSection>
        <div className="py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex flex-col space-y-12">
              <h2 className="text-3xl font-bold">Trusted by Veterinary Educators Worldwide</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <StatCard number="200+" label="Accredited Courses" />
                <StatCard number="35+" label="Countries" />
                <StatCard number="5000+" label="Veterinary Professionals" />
                <StatCard number="98%" label="Provider Satisfaction" />
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}
