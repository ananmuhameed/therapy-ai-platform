import React from 'react';
import { MessageSquare, FileText } from 'lucide-react';

const TranscriptionBlock = ({ transcript }) => {
  if (!transcript || transcript.length === 0) {
    return (
      <div className="w-full bg-[rgb(var(--card))] rounded-xl border border-dashed border-[rgb(var(--border))] p-10 text-center flex flex-col items-center justify-center text-[rgb(var(--text-muted))]">
        <FileText size={48} className="mb-4 text-[rgb(var(--text-muted))]/50" />
        <p>No transcription available yet.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[rgb(var(--card))] rounded-xl shadow-sm border border-[rgb(var(--border))] overflow-hidden flex flex-col">
      <div className="bg-black/5 dark:bg-white/5 backdrop-blur-sm px-6 py-4 border-b border-[rgb(var(--border))] flex justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[rgb(var(--primary))]/10 rounded-lg">
            <MessageSquare className="text-[rgb(var(--primary))]" size={18} />
          </div>
          <h2 className="font-semibold text-[rgb(var(--text))]">Transcription</h2>
        </div>
        <div className="text-xs font-medium text-[rgb(var(--text-muted))] bg-[rgb(var(--card))] px-2 py-1 rounded border border-[rgb(var(--border))]">
          {transcript.length} Segments
        </div>
      </div>

      <div className="p-6 space-y-6 h-[300px] overflow-y-auto scroll-smooth">
        {transcript.map((item, index) => (
          <div
            key={index}
            className="flex gap-4 group hover:bg-black/5 dark:hover:bg-white/5 p-3 rounded-lg transition-colors border border-transparent hover:border-[rgb(var(--border))]"
          >
            <span className="text-xs font-mono text-[rgb(var(--text-muted))] mt-1 min-w-[3rem]">
              {item.timestamp || "00:00"}
            </span>

            <p className="text-[rgb(var(--text))] text-sm leading-relaxed">
              {item.text}
            </p>
          </div>
        ))}

        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default TranscriptionBlock;
