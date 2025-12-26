import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate} from 'react-router-dom'; 
import { ArrowLeft, Calendar, User, Sparkles, Loader2, UploadCloud, Download, Volume2, Play, Pause } from 'lucide-react';
import TranscriptionList from '../components/SessionDetails/TranscriptionBlock';
import ReportSummary from '../components/ReportSummary'; 
import api from '../api/axiosInstance';

//   MOCK DATA FLAG to see ana 3amla eh lma yb2a fe actual data hnremove el flag da
const USE_MOCK_DATA = true; // Set to FALSE when connecting to Django


//  MOCK DATA (based onSerializer Structure) 
const MOCK_SESSION = {
  id: 1,
  patient: 5, 
  patient_name: "Sarah Jenkins",
  session_date: "2024-03-25T14:30:00Z",
  created_at: "2024-03-25T14:30:00Z",
  status: "completed", 
  
  // Audio URL (Using a public sample for testing)
  audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  
  // Transcript Object
  transcript: {
    status: "completed",
    language_code: "en",
    cleaned_transcript: "Therapist: How have you been feeling since our last session?\nPatient: Honestly, it's been a bit rough. I've been feeling really overwhelmed at work.\nTherapist: Can you tell me more about what's making you feel that way?\nPatient: My boss just keeps piling on more projects, and I feel like I can't say no without looking like I'm slacking off.\nTherapist: It sounds like setting boundaries is a challenge right now. Have you tried discussing your capacity with him?\nPatient: I tried once, but he just brushed it off. It makes me anxious just thinking about going in on Monday.\nTherapist: Let's explore some strategies to help you communicate your limits effectively... \nTherapist: How have you been feeling since our last session?\nPatient: Honestly, it's been a bit rough. I've been feeling really overwhelmed at work.\nTherapist: Can you tell me more about what's making you feel that way?\nPatient: My boss just keeps piling on more projects, and I feel like I can't say no without looking like I'm slacking off.\nTherapist: It sounds like setting boundaries is a challenge right now. Have you tried discussing your capacity with him?\nPatient: I tried once, but he just brushed it off. It makes me anxious just thinking about going in on Monday."
  },

  //  Report Object
  report: {
    status: "completed",
    generated_summary: "The patient reports significant workplace stress and anxiety related to workload management. She describes difficulty setting boundaries with her supervisor and fears negative repercussions for refusing additional tasks.",
    key_points: [
      "Patient feels overwhelmed by current workload.",
      "Difficulty asserting boundaries with authority figures.",
      "Anxiety symptoms escalating before the work week (Sunday Scaries).",
      "Past attempt to communicate capacity was dismissed."
    ],
    risk_flags: [
      "Potential burnout",
      "High anxiety levels"
    ],
    treatment_plan: [
      "Role-play assertiveness techniques for workplace conversations.",
      "Cognitive restructuring regarding 'fear of failure'.",
      "Monitor anxiety levels using a daily log."
    ],
    therapist_notes: "Patient seemed visibly tense when discussing her boss. Recommended breathing exercises."
  }
};
// --- END MOCK DATA ---//-------//delete lma nkhalas testing//

const SessionDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // Audio State
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // --- 1. FETCH DATA (MOCK + REAL) ---
  const fetchSessionData = async () => {
    //  MOCK MODE delete when all data is ready
    if (USE_MOCK_DATA) {
      console.log(" USING MOCK DATA");
      // Simulate network delay
      setTimeout(() => {
        setSession(MOCK_SESSION);
        setLoading(false);
      }, 800); 
      return;
    }

    //  REAL BACKEND MODE
    try {
      const response = await api.get(`/sessions/${id}/`);
      setSession(response.data);
      
      // Polling Logic
      const status = response.data.status;
      if (['transcribing', 'analyzing', 'uploaded'].includes(status)) {
        setTimeout(fetchSessionData, 5000);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, [id]);

  //  AUDIO HANDLERS 
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSpeedChange = () => {
    const rates = [0.5, 1, 1.5, 2];
    const nextIdx = (rates.indexOf(speed) + 1) % rates.length;
    const nextSpeed = rates[nextIdx];
    setSpeed(nextSpeed);
    if(audioRef.current) audioRef.current.playbackRate = nextSpeed;
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if(audioRef.current) audioRef.current.volume = val;
  };

  // ACTIONS 
  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    // MOCK MODE delete when backend is ready
    if (USE_MOCK_DATA) {
      setTimeout(() => {
        setGeneratingReport(false);
        alert("MOCK: Report generation triggered! (Status would change to 'analyzing')");
      }, 2000);
      return;
    }

    try {
      await api.post(`/sessions/${id}/generate_report/`);
      alert("AI Report generation started!");
      fetchSessionData(); // Start polling
    } catch (error) {
      console.error("Report Error:", error);
      alert("Failed to start report generation.");
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownloadPDF = () => {
   {/* delete this if statement after testing */}
    if (USE_MOCK_DATA) {
      alert("MOCK: Downloading PDF...");
      return;
    }
    // Real download logic
    const pdfUrl = `http://localhost:8000/api/sessions/${id}/download_pdf/`;
    window.open(pdfUrl, '_blank');
  };

  const handleReplaceAudio = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!window.confirm("Replace current audio? This will restart transcription.")) return;

    if (USE_MOCK_DATA) {
      alert(`MOCK: Uploading ${file.name}...`);
      return;
    }

    try {
      alert("Uploading...");
      const formData = new FormData();
      formData.append("audio_file", file);
      
      await api.post(`/sessions/${id}/replace-audio/`, formData);
      setLoading(true);
      await fetchSessionData(); 
      alert("Audio updated!");
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed.");
    }
  };

  // --- RENDER HELPERS ---
  if (loading) return <div className="h-screen flex items-center justify-center text-blue-500"><Loader2 className="animate-spin mr-2"/> Loading Session...</div>;
  if (!session) return <div className="text-center mt-20">Session not found</div>;

  return (
    <div className="min-h-screen bg-white p-8 font-sans text-slate-800 mt-6">
      
      {/* HEADER */}
      <header className="flex justify-between items-start mb-12 max-w-6xl mx-auto">
        <div className="flex items-start space-x-4">
            {/*goes back to the previous page*/}
                  <button
                     onClick={() => navigate(-1)}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition shadow-lg shadow-blue-200"
                  >
                      <ArrowLeft size={20} />
                  </button>
          
          <div>
            <div className="flex items-center space-x-2 font-bold text-lg text-gray-900 mb-1">
              <User size={20} className="text-blue-500" />
              <span>{session.patient_name || `Patient #${session.patient}`}</span> 
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
               <span className="bg-gray-100 px-2 py-1 rounded">Session #{session.id}</span>
               <span>{new Date(session.created_at).toLocaleDateString()}</span>
               <span className={`font-bold ml-2 ${session.status === 'completed' ? 'text-green-500' : 'text-blue-500'}`}>
                 {session.status}
               </span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center space-x-3">
          {session.report && session.report.status === 'completed' ? (
            <button 
              onClick={handleDownloadPDF}
              className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-sm font-semibold shadow-lg transition flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Download Report</span>
            </button>
          ) : (
            <button 
              onClick={handleGenerateReport}
              disabled={generatingReport || session.status === 'analyzing'}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition flex items-center space-x-2"
            >
              {generatingReport ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16} />}
              <span>{session.status === 'analyzing' ? "Analyzing..." : "Generate AI Report"}</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex flex-col items-center pb-20">
        <div className="w-full max-w-4xl">
        {/* AUDIO PLAYER */}
        <h2 className='text-gray-500 text-left '>Audio Player</h2>
        {session.audio_url ? (
           <div className=" mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md mt-3.5">
              <audio 
                ref={audioRef} 
                src={session.audio_url} 
                onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
                onLoadedMetadata={() => setDuration(audioRef.current.duration)}
                onEnded={() => setIsPlaying(false)}
              />
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 h-1 rounded-full mb-4 cursor-pointer relative group mt-3.5" 
                   onClick={(e) => {
                     const w = e.currentTarget.clientWidth;
                     const x = e.nativeEvent.offsetX;
                     audioRef.current.currentTime = (x / w) * duration;
                   }}>
                <div className="bg-blue-500 h-1.5 rounded-full relative" style={{ width: `${(currentTime/duration)*100}%` }}>
                   <div className="absolute right-0 -top-1 w-3.5 h-3.5 bg-blue-600 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-between items-center">
                 <div className="flex items-center space-x-4">
                    <button onClick={togglePlay} className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition shadow-sm hover:shadow-md active:scale-85">
                       {isPlaying ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor" className="ml-0.5"/>}
                    </button>
                    <span className="text-xs font-mono text-gray-500 select-none">
                      {Math.floor(currentTime/60)}:{String(Math.floor(currentTime%60)).padStart(2,'0')} / 
                      {Math.floor(duration/60)}:{String(Math.floor(duration%60)).padStart(2,'0')}
                    </span>
                 </div>

                 <div className="flex items-center space-x-6">
                    {/* Speed Control */}
                    <button onClick={handleSpeedChange} className="flex items-center text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition">
                       {speed}x Speed
                    </button>

                    {/* Volume Control */}
                    <div className="flex items-center space-x-2 group">
                       <Volume2 size={18} className="text-gray-400 group-hover:text-blue-500 transition"/>
                       <input 
                         type="range" min="0" max="1" step="0.1" value={volume} 
                         onChange={handleVolumeChange}
                         className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                       />
                    </div>
                 </div>
              </div>

              {/* Replace Audio Link */}
              <div className="flex justify-end mt-4 pt-3 border-t border-gray-50">
                 <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" onChange={handleReplaceAudio} />
                 <button onClick={() => fileInputRef.current.click()} className="flex items-center space-x-1 text-xs text-gray-400 hover:text-blue-500 transition">
                    <UploadCloud size={14} /> <span>Replace Audio File</span>
                 </button>
              </div>
           </div>
        ) : (
           <div className=" mb-8 p-10 border-2 border-dashed border-gray-200 rounded-xl text-center bg-gray-50/50">
             <p className="text-gray-500 mb-4 font-medium">No audio recorded for this session yet.</p>
             <button onClick={() => fileInputRef.current.click()} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm shadow-sm hover:bg-gray-50 transition">
                Upload Audio Recording
             </button>
             <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" onChange={handleReplaceAudio} />
           </div>
        )}

           {/* TRANSCRIPTION BLOCK */}
        <div className="w-full max-w-4xl mt-8">
           <TranscriptionList 
             transcript={
               session.transcript && session.transcript.cleaned_transcript 
               ? [{ text: session.transcript.cleaned_transcript }] 
               : []
             } 
           />
        </div>
        
        {/* REPORT SUMMARY (Only shows if report exists) */}
        {session.report && <ReportSummary report={session.report} />}

     </div>

      </main>
    </div>
  );
};

export default SessionDetails;