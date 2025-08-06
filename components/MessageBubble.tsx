"use client"

import { useUser } from "@clerk/clerk-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { BotIcon } from "lucide-react";

interface MessageBubbleProps {
  content: string;
  isUser: boolean
}
const formatMessage = (content: string): string => {
  if (!content) return '';
  
  try {
    let formattedContent = content;
    
    // Clean up escaped content - handle all types of escapes
    formattedContent = formattedContent
      .replace(/\\n/g, "\n")  // Convert escaped newlines to actual newlines
      .replace(/\\\\/g, "\\") // Convert double backslashes to single
      .replace(/\\/g, "")     // Remove any remaining single backslashes
      .replace(/\\"/g, '"')   // Convert escaped quotes
      .replace(/\\'/g, "'")   // Convert escaped single quotes
      .replace(/\\t/g, "\t")  // Convert escaped tabs
      .replace(/\\r/g, "\r"); // Convert escaped carriage returns
    
    // Handle terminal/code blocks with HTML
    if (formattedContent.includes('---START---') && formattedContent.includes('---END---')) {
      return formattedContent.replace(/---START---\n?/g, "").replace(/\n?---END---/g, "");
    }
    
    // Escape HTML for security
    formattedContent = formattedContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    
    // Convert markdown-like formatting
    formattedContent = formattedContent
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/`(.*?)`/g, '<code style="background-color: #f0f0f0; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>') // Inline code
      .replace(/\n/g, '<br>'); // Line breaks
    
    return formattedContent.trim();
  } catch (error) {
    console.error('Error formatting message:', error);
    return content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
function MessageBubble({ content, isUser }: MessageBubbleProps) {
  const { user } = useUser();
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`rounded-2xl px-4 py-2.5 max-w-[85%] md:max-w-[75%] shadow-sm ring-1 ring-inset relative ${isUser ? "bg-blue-600 text-white rounded-br-none ring-blue-700" : "bg-white text-gray-900 rounded-bl-none ring-gray-200"}`}
      >
        <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: formatMessage(content) }} />
          <div className={`absolute bottom-0 ${isUser ? "right-0 translate-x-1/2 translate-y-1/2"
            : "left-0 -translate-x-1/2 translate-y-1/2"
            }`}>
            <div className={`w-8 h-8 rounded-full border-2 ${isUser ? "bg-white border-gray-100" : "bg-blue-600 border-white"} flex items-center justify-center shadow-sm`}>
              {isUser ? (
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback>
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <BotIcon className="h-5 w-5 text-white" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble