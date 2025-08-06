import React from "react";

const Loading = () => {
  return (
    <div className="p-4 space-y-4 bg-white min-h-screen">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className={`flex ${idx % 2 === 0 ? "justify-start" : "justify-end"}`}
        >
          <div className="bg-gray-100 p-3 rounded-lg shadow max-w-[80%] w-full animate-pulse space-y-2">
            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Loading;
