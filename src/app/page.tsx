import Link from "next/link"
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import MathBackground from "../components/MathBackground"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-blue-900 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <MathBackground />
        </div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8">
            <h1 className="text-5xl font-bold">StatusScore</h1>
            <div className="flex justify-center">
              <Image
                src="https://status-score-public.s3.us-east-2.amazonaws.com/logo-1.png"
                alt="Logo"
                width={180}
                height={180}
              />
            </div>
            <p className="text-xl max-w-2xl mx-auto">
              Monitor your online presence with AI-powered sentiment analysis across multiple platforms.
            </p>
            <div className="relative z-20">
              <Link href="/dashboard" className="inline-flex items-center px-6 py-3 text-lg font-medium text-gray-900 bg-cyan-400 rounded-md hover:bg-cyan-300 transition-colors">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Multi-Platform Monitoring", description: "Track keywords across Google, YouTube, Reddit, and X" },
              { title: "Sentiment Analysis", description: "Understand the overall tone of discussions about your keywords" },
              { title: "Trend Visualization", description: "See how sentiment changes over time with interactive charts" },
            ].map((feature, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-md border-t-4 border-cyan-400 transition-all duration-300 ease-in-out hover:bg-gray-700 hover:shadow-xl hover:scale-105 hover:border-accent-300">
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-gray-800">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to boost your online presence?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Start monitoring your keywords and get valuable insights today.
          </p>
          <Link href="/add-keyword" className="inline-flex items-center px-6 py-3 text-lg font-medium text-gray-900 bg-cyan-400 rounded-md hover:bg-cyan-300 transition-colors">
            Add Your First Keyword
          </Link>
        </div>
      </section>
    </div>
  )
}

