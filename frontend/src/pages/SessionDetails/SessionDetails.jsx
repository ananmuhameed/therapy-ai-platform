import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Download, Sparkles, UploadCloud } from 'lucide-react';
import api from '../../api/axiosInstance';
import { formatDate } from '../../utils/helpers';

// Components
import TranscriptionBlock from '../../components/SessionDetails/TranscriptionBlock';
import AudioPlayer from '../../components/SessionDetails/AudioPlayer';
import ReportSummary from '../../components/Reports/ReportSummary';

export default function SessionDetails() {
  // 1. MATCH THE PARAMETER NAME FROM APP.JSX
  const { sessionId } = useParams(); 
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // Ref for the file upload input
  const fileInputRef = useRef(null);

  const fetchSession = async () => {
     try {
        // 2. USE SESSIONID IN API CALL
        const { data } = await api.get(`/sessions/${sessionId}/`);
        setSession(data);
     } catch(e) { 
        console.error("Error fetching session:", e); 
     } finally { 
        setLoading(false); 
     }
  };
  
  useEffect(() => { 
    if (sessionId) fetchSession(); 
  }, [sessionId]);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      await api.post(`/sessions/${sessionId}/generate_report/`);
      alert("AI Report generation started!");
      fetchSession(); 
    } catch (error) {
      alert("Failed to start report generation.");
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleReplaceAudio = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (session.audio_url && !window.confirm("Replace current audio? This will restart transcription.")) return;

    try {
      const formData = new FormData();
      formData.append("audio_file", file);
      
      await api.post(`/sessions/${sessionId}/replace-audio/`, formData);
      alert("Audio uploading... The page will refresh shortly.");
      
      setLoading(true);
      await fetchSession(); 
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed.");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin mr-2"/> Loading...</div>;
  if (!session) return <div className="text-center mt-10">Session not found</div>;

  return (
    <div className="min-h-screen bg-white p-8 mt-6">
       {/* HEADER */}
       <header className="flex justify-between items-start mb-8 max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate(-1)} className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition">
                <ArrowLeft size={20}/>
             </button>
             <div>
                <h1 className="text-xl font-bold text-gray-900">{session.patient_name || `Patient #${session.patient}`}</h1>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-xs text-gray-500 uppercase font-medium bg-gray-100 px-2 py-0.5 rounded">
                     Session #{session.id}
                   </span>
                   <span className="text-xs text-gray-500 uppercase font-medium">
                     {formatDate(session.session_date || session.created_at)}
                   </span>
                   <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${session.status === 'completed' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'}`}>
                      {session.status}
                   </span>
                </div>
             </div>
          </div>

          {/* ACTIONS */}
          {session.report?.status === 'completed' ? (
             <button 
               onClick={() => window.open(`http://localhost:8000/api/sessions/${sessionId}/download_pdf/`, '_blank')}
               className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md transition font-medium text-sm"
             >
               <Download size={16}/> Download Report
             </button>
          ) : (
             <button 
                onClick={handleGenerateReport}
                disabled={generatingReport || session.status === 'analyzing'}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2.5 rounded-xl shadow-md transition font-medium text-sm"
             >
                {generatingReport ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16}/>} 
                <span>Generate AI Report</span>
             </button>
          )}
       </header>

       <main className="flex flex-col items-center max-w-4xl mx-auto gap-8 pb-20">
          
          {/* AUDIO SECTION */}
          <div className="w-full">
            <h2 className='text-gray-500 text-sm font-medium uppercase mb-3'>Audio Recording</h2>
            
            {session.audio_url ? (
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  {/* The Audio Player Component */}
                  <AudioPlayer audioUrl={session.audio_url} />

                  {/* RESTORED: Replace Audio Button */}
                  <div className="flex justify-end mt-4 pt-4 border-t border-gray-50">
                     <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 text-xs text-gray-400 hover:text-blue-600 transition">
                        <UploadCloud size={14} /> Replace Audio File
                     </button>
                  </div>
               </div>
            ) : (
               // RESTORED: Upload Box when no audio exists
               <div className="p-10 border-2 border-dashed border-gray-200 rounded-2xl text-center bg-gray-50/50 hover:bg-gray-50 transition">
                 <p className="text-gray-500 mb-4 font-medium">No audio recorded for this session yet.</p>
                 <button onClick={() => fileInputRef.current.click()} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm shadow-sm hover:bg-white hover:border-blue-400 hover:text-blue-500 transition">
                    Upload Audio Recording
                 </button>
               </div>
            )}
            
            {/* Hidden Input for handling file selection */}
            <input 
               type="file" 
               ref={fileInputRef} 
               className="hidden" 
               accept="audio/*" 
               onChange={handleReplaceAudio} 
            />
          </div>
          
          {/* TRANSCRIPT */}
          <div className="w-full">
            <TranscriptionBlock 
               transcript={session.transcript?.cleaned_transcript ? [{ text: session.transcript.cleaned_transcript }] : []} 
            />
          </div>
          
          {/* REPORT */}
          {session.report && <div className="w-full"><ReportSummary report={session.report} /></div>}
       </main>
    </div>
  );
}