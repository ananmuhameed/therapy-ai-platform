import { Navigate } from "react-router-dom"
import FadeUp from "../../Layout/Fadeup"
import { useNavigate } from "react-router-dom";


const Hero = () => {
  const navigate = useNavigate();

  return (
    <>
    <FadeUp delay={0.3}>
        <section className='min-h-screen flex flex-col items-center justify-center text-center px-4 bg-white'>
            
        <span className='px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-sm mb-6 '>
            Mental Healthcare Documentation
        </span> 
        <h1 className='text-4xl md:text-5xl font-semibold text-gray-800 leading-tight max-w-3xl'>
        Therapist Transcription and AI Reporting Platform
       </h1>
       <p className='mt- text-gray-500 max-w-2xl'>
         Platform provides an automated solution where therapists can manage their
         patients, record therapy sessions, and automatically generate session
         transcripts and structured reports.
         </p>
         <div className='flex gap-4 mt-8'>
       <button
              onClick={() => navigate("/signup")}
              className="px-6 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Get started Free
            </button>

        <button
          onClick={() => navigate("/plans")}
          className=' px-6 rounded-2xl bg-gray-100 text-gray-800 hover:bg-gray-200 transition p-2'>
         Discover Paid Plans
        </button>
         </div>
         <div className='grid grid-cols-1 md:grid-cols-3 gap-10 mt-16 text-center'>
            <div>
                <h3 className='text-3xl font-semibold text-gray-700'>60%</h3>
                <p className='text-gray-500 mt-2'>Time Saved on Documentation</p>
            </div>
            <div>
                <h3 className='text-3xl font-semibold text-gray-700'>40%</h3>
                <p className='text-gray-500 mt-2'>More in-session focus</p>
            </div>
            <div>
                <h3 className='text-3xl font-semibold text-gray-700'>98%</h3>
                <p className='text-gray-500 mt-2'>Accuracy rate</p>   
            </div>

         </div>
           
        </section>
      </FadeUp>
    </>
  )
}

export default Hero
