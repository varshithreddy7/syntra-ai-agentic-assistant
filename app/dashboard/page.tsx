'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bot, 
  MessageSquare, 
  Users, 
  BarChart3,
  Plus,
  Circle
} from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function DashboardPage() {
  const router = useRouter();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  
  // Use Convex mutation hook for proper authentication
  const createChatMutation = useMutation(api.chats.createChat);
  
  const handleStartNewConversation = async () => {
    try {
      setIsCreatingChat(true);
      console.log('Starting new conversation...');
      
      // Create a new chat with a default title
      const title = `Chat ${new Date().toLocaleString()}`;
      console.log('Creating chat with title:', title);
      
      const chatId = await createChatMutation({
        title: title
      });
      
      console.log('Created chat with ID:', chatId);
      
      // Navigate to the new chat
      router.push(`/dashboard/chat/${chatId}`);
    } catch (error) {
      console.error('Error creating new chat:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      alert(`Failed to create new chat: ${error.message || 'Unknown error'}. Please try again.`);
    } finally {
      setIsCreatingChat(false);
    }
  };
  
  const handleNewChat = async () => {
    // Same functionality as start conversation
    await handleStartNewConversation();
  };
  return (
    <div className="min-h-[90vh] bg-gray-50 flex items-center justify-center py-2">
      <div className="max-w-2xl w-full px-4">
        {/* Main Content */}
        <div className="text-center mb-4">
          {/* Icon */}
          <div className="w-14 h-14 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bot className="w-7 h-7 text-gray-700" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome to Your AI Agent Dashboard
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-base leading-relaxed mb-3">
            Start a new conversation or select an existing chat from the 
            sidebar. Your AI assistant is ready to help with any task.
          </p>

          {/* Feature Pills */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center space-x-1">
              <Circle className="w-2 h-2 text-blue-500 fill-current" />
              <span className="text-gray-600 text-xs">Real-time responses</span>
            </div>
            <div className="flex items-center space-x-1">
              <Circle className="w-2 h-2 text-green-500 fill-current" />
              <span className="text-gray-600 text-xs">Smart automation</span>
            </div>
            <div className="flex items-center space-x-1">
              <Circle className="w-2 h-2 text-purple-500 fill-current" />
              <span className="text-gray-600 text-xs">Enterprise ready</span>
            </div>
          </div>

          {/* Primary Action */}
          <button 
            onClick={handleStartNewConversation}
            disabled={isCreatingChat}
            className="bg-gray-900 text-white px-6 py-2 rounded-xl font-medium hover:bg-gray-800 hover:shadow-lg hover:scale-105 transition-all duration-200 mb-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer"
          >
            {isCreatingChat ? 'Creating Chat...' : 'Start New Conversation'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer">
            <MessageSquare className="w-5 h-5 text-gray-600 mx-auto mb-2 group-hover:text-blue-600 transition-colors" />
            <p className="text-xl font-semibold text-gray-900 mb-0.5">1,247</p>
            <p className="text-gray-600 text-xs">Conversations</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-200 hover:border-green-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer">
            <Users className="w-5 h-5 text-gray-600 mx-auto mb-2 group-hover:text-green-600 transition-colors" />
            <p className="text-xl font-semibold text-gray-900 mb-0.5">328</p>
            <p className="text-gray-600 text-xs">Active Users</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-200 hover:border-purple-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer">
            <BarChart3 className="w-5 h-5 text-gray-600 mx-auto mb-2 group-hover:text-purple-600 transition-colors" />
            <p className="text-xl font-semibold text-gray-900 mb-0.5">94%</p>
            <p className="text-gray-600 text-xs">Success Rate</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleNewChat}
            disabled={isCreatingChat}
            className="group bg-white border border-gray-200 rounded-2xl p-4 text-left hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:hover:bg-white cursor-pointer"
          >
            <Plus className="w-5 h-5 text-gray-600 mb-2 group-hover:text-blue-600 transition-colors" />
            <p className="font-medium text-gray-900 mb-0.5 group-hover:text-blue-900 transition-colors">
              {isCreatingChat ? 'Creating...' : 'New Chat'}
            </p>
            <p className="text-gray-600 text-xs group-hover:text-blue-700 transition-colors">Start conversation</p>
          </button>
          <button className="group bg-white border border-gray-200 rounded-2xl p-4 text-left hover:border-green-300 hover:shadow-lg hover:-translate-y-1 hover:bg-green-50 transition-all duration-200">
            <BarChart3 className="w-5 h-5 text-gray-600 mb-2 group-hover:text-green-600 transition-colors" />
            <p className="font-medium text-gray-900 mb-0.5 group-hover:text-green-900 transition-colors">Analytics</p>
            <p className="text-gray-600 text-xs group-hover:text-green-700 transition-colors">View performance</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;