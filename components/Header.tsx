import React, { use, useState } from 'react'
import { Button } from './ui/button'
import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import { UserButton } from '@clerk/nextjs'
import { NavigationContext } from '@/lib/NavigationProvider'
import { ArrowLeft, Home } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import DynamicFavicon from './DynamicFavicon'

function Header() {
  const { setIsMobileNavOpen }= use(NavigationContext);
  const pathname = usePathname();
  const router = useRouter();
  const isInChat = pathname?.includes('/chat/');
  const [logoError, setLogoError] = useState(false);
  
  // Determine the title based on current page
  const getPageTitle = () => {
    if (isInChat) {
      return "Chat with Syntra AI | Syntra AI";
    }
    return "Syntra AI Dashboard | Syntra AI";
  };
  
  return (
    <>
      <DynamicFavicon title={getPageTitle()} iconPath="/logo.png" />
      <div className="border-b border-gray-200/50 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={()=> setIsMobileNavOpen(true)}
              className="md:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
            >
              <HamburgerMenuIcon className="h-5 w-5" />
            </Button>
            
            {/* Back to Dashboard Button - shows only in chat */}
            {isInChat && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <Home className="h-4 w-4 sm:hidden" />
              </Button>
            )}
            
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                {!logoError ? (
                  <Image
                    src="/logo.png"
                    alt="Syntra AI Logo"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain rounded-md"
                    priority
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold text-sm">
                    S
                  </div>
                )}
              </div>
              
              {/* Title */}
              <div className="font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {isInChat ? 'Syntra AI Assistant' : 'Chat with Syntra an AI Agentic Assistant'}
              </div>
            </div>
          </div>
          <div className="flex item-center">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 ring-2 ring-gray-200/50 ring-offset-2 rounded-full transition-shadow hover:ring-gray-300/50",
                },
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default Header