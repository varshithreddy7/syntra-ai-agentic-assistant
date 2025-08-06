"use client"

import { BotIcon, Youtube, Globe, Calculator, TrendingUp, Users, ArrowRight, Home } from "lucide-react"
import { Button } from "./ui/button"
import { useRouter } from 'next/navigation'

interface WelcomeMessageProps {
  onExampleClick: (example: string) => void;
}

const WelcomeMessage = ({ onExampleClick }: WelcomeMessageProps) => {
  const router = useRouter();
  
  const services = [
    {
      icon: Globe,
      title: "Current Info",
      desc: "Latest news & events from 2025"
    },
    {
      icon: Youtube,
      title: "YouTube Analysis",
      desc: "Extract video transcripts & content"
    },
    {
      icon: Calculator,
      title: "Calculations",
      desc: "Math, conversions & analysis"
    },
    {
      icon: TrendingUp,
      title: "Financial Data",
      desc: "Currency rates & market info"
    },
    {
      icon: Users,
      title: "Customer Data",
      desc: "Business & customer insights"
    }
  ];

  const quickExamples = [
    "What are India's latest policies in 2025?",
    "Get transcript: https://youtu.be/6N5kffWMU_k",
    "Convert 100 USD to EUR",
    "Get USA customer information"
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-lg">
            <BotIcon className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Syntra AI
          </h1>
          <p className="text-gray-600">
            Your AI assistant with real-time tools and current data
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-center text-gray-800">
          What I Can Do
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div 
                key={index}
                className="p-3 rounded-lg border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all text-center"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-4 h-4 text-gray-700" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {service.title}
                </h3>
                <p className="text-xs text-gray-600">
                  {service.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Examples */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 text-center">
          Try these examples:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {quickExamples.map((example, index) => (
            <Button
              key={index}
              variant="outline"
              className="text-left h-auto p-3 hover:bg-gray-50 hover:border-gray-400 transition-colors group justify-between"
              onClick={() => onExampleClick(example)}
            >
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {example}
              </span>
              <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </Button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-2 space-y-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="text-gray-600 hover:text-gray-900 gap-2"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <p className="text-sm text-gray-500">
          Powered by <span className="font-medium">Claude 3.5 Sonnet</span> • Updated for 2025
        </p>
      </div>
    </div>
  );
};

export default WelcomeMessage;
