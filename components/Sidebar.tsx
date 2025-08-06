"use client"
import { NavigationContext } from '@/lib/NavigationProvider';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation'
import React, { use,useContext, useState } from 'react'
import { Button } from './ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { useMutation, useQueries, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import ChatRow from './ChatRow';
import Image from 'next/image';

export default function Sidebar() {
  const router = useRouter();
  const { closeMobileNav, isMobileNavOpen} = use(NavigationContext);
  const [logoError, setLogoError] = useState(false);

  const chats = useQuery(api.chats.listChats)
  const createChat = useMutation(api.chats.createChat);
  const deleteChat = useMutation(api.chats.deleteChat);
  const handleClick = ()=>{
    closeMobileNav();
  }

  const handleNewChat = async ()=>{
    const chatId = await createChat({title:"New Chat"});
    router.push(`/dashboard/chat/${chatId}`)
    closeMobileNav();
  }

  const handleDeleteChat = async (id:Id<"chats">)=>{
    await deleteChat({id});

    if(window.location.pathname.includes(id)){
      router.push("/dashboard");
    }
  }
  return (
    <>
      {/*Backgroud overlay for mobile view */}
      {isMobileNavOpen &&(
        <div className='fixed inset-0 bg-black/20 z-40 md:hidden'
          onClick={closeMobileNav}        
        />
      )}
      

      <div
        className={cn(
          "fixed md:inset-y-0 top-14 bottom-0 left-0 z-50 w-72 bg-gray-50/80 backdrop-blur-xl border-r border-gray-200/50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:top-0 flex flex-col",
          isMobileNavOpen ? "translate-x-0":"-translate-x-full"
        )}
      >
        {/* Logo Section */}
        <div className='p-4 border-b border-gray-200/50 flex items-center justify-center'>
          <div className="flex items-center gap-3">
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
            <span className="font-semibold text-gray-800">Syntra AI</span>
          </div>
        </div>
        
        <div className='p-4 border-b border-gray-200/50'>
          <Button 
           onClick={handleNewChat}
          className='w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/50 shadow-sm hover:shadow transition-all duration-200 hover:cursor-pointer'
          >
            <PlusIcon className='mr-2 h-4 w-4'/>New Chat
          </Button>
        </div>
        <div className='flex-1 overflow-y-auto space-y-2.5 p-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent'>
          {chats?.map((chat) => (
            <ChatRow key={chat._id} chat={chat} onDelete={handleDeleteChat} />
          ))}
        </div>
      </div>
    </>
  )
}

