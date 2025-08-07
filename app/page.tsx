"use client";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import DynamicFavicon from "@/components/DynamicFavicon";

export default function LandingPage() {
  const [logoError, setLogoError] = useState(false);

  return (
    <>
      <DynamicFavicon title="Syntra AI Agentic Assistant - Advanced AI with Real-time Tools" iconPath="/logo.png" />
      <main className="flex min-h-screen flex-col items-center justify-center relative">
        {/* Background pattern */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-[#0f172a] bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:6rem_4rem] [background:radial-gradient(125%_125%_at_50%_10%,#1e293b_40%,#0f172a_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20"></div>
        </div>

        <section className="w-full px-4 py-12 mx-auto max-w-4xl flex flex-col items-center justify-center space-y-8 text-center">
          {/* Hero content */}
          <header className="space-y-8">
            {/* Logo Section */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-4">
                  {!logoError ? (
                    <Image
                      src="/logo.png"
                      alt="Syntra AI Logo"
                      width={80}
                      height={80}
                      className="h-20 w-20 object-contain rounded-2xl"
                      priority
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                      S
                    </div>
                  )}
                </div>
              </div>
            </div>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
            Syntra AI Agentic Assistant
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-300 md:text-xl/relaxed xl:text-2xl/relaxed">
            Meet Syntra, your AI-powered assistant. Syntra is designed to help you with your daily tasks, answer your questions, and provide you with the information you need.
            <br />
            <span className="text-gray-400 text-sm mt-4 block">
              Powered by IBM&apos;s Wxtools & favourite LLM&apos;s.
            </span>
          </p>
        </header>
        <SignedIn>
          <Link href="/dashboard">
            <button className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-gray-900 to-gray-800 rounded-full hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:cursor-pointer">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-900/20 to-gray-800/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </Link>
        </SignedIn>

        <SignedOut>
          <SignInButton
            mode="modal"
            fallbackRedirectUrl={"/dashboard"}
            forceRedirectUrl={"/dashboard"}
          >
            <button className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-gray-900 to-gray-800 rounded-full hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:cursor-pointer">
              Signup
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-900/20 to-gray-800/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </SignInButton>
        </SignedOut>

        {/*Features Grid */}
        <div className="grid grid-cols-3 gap-8 md:gap-16 pt-8 max-w-3xl mx-auto">
          {[{
            title:"Fast",description:"Real-time streamed responses"
          },{
            title:"Modren",description:"Next.js 15, Tailwind css, Convex, Clerk "
          },{
            title:"Smart",description:"Powered by Your Favourite LLM's"
          }
          ].map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="text-2xl font-semibold text-white">
                {feature.title}
              </div>
              <div className="text-sm text-gray-300 mt-1">{feature.description}</div>
            </div>
          ))}
        </div>
      </section>

    </main>
    </>
  );
}
