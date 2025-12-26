import React from 'react';
import { MessageSquare, PenLine, FileText } from 'lucide-react';

const TranscriptionBlock = ({ transcript }) => {
  // Handle empty state
  if (!transcript || transcript.length === 0) {
    return (
      <div className="w-full bg-gray-50 rounded-xl border border-dashed border-gray-300 p-10 text-center flex flex-col items-center justify-center text-gray-400">
        <FileText size={48} className="mb-4 text-gray-300" />
        <p>No transcription available yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="bg-gray-50/80 backdrop-blur-sm px-6 py-4 border-b border-gray-100 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MessageSquare className="text-blue-600" size={18} />
          </div>
          <h2 className="font-semibold text-gray-800">Transcription</h2>
        </div>
        <div className="text-xs font-medium text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">
          {transcript.length} Segments
        </div>
      </div>
      <div className="p-6 space-y-6 h-[300px] overflow-y-auto scroll-smooth">
        {transcript.map((item, index) => (
          <div key={index} className="flex gap-4 group hover:bg-gray-50 p-3 rounded-lg transition-colors border border-transparent hover:border-gray-100">
            {/* Timestamp */}
            <span className="text-xs font-mono text-gray-400 mt-1 min-w-[3rem]">
              {item.timestamp || "00:00"}
            </span>
            
            {/* Text */}
            <p className="text-gray-600 text-sm leading-relaxed">
              {item.text}
            </p>
          </div>
        ))}
        
        {/* Bottom padding spacer */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default TranscriptionBlock;