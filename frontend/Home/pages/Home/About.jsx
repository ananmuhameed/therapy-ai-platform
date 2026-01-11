import FadeUp from "../../Layout/Fadeup";
import { FaCheck } from "react-icons/fa";


const About = () => {
  return (
    <section className='py-24 px-6 bg-gray-50'>
        <FadeUp delay={0.3}>
        <div className='max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center'>
            
            <div>
                <h2 className='text-3xl font-semibold bg-gradient-to-r from-[#3078E2] via-[#5D93E1] to-[#8AAEE0] bg-clip-text text-transparent'>
                About Our Platform
                </h2>
                <p className='mt-4 text-gray-600 leading-relaxed'>
                We help therapists automate session documentation, generate accurate
                transcripts, and create structured AI-powered reports. Our mission is
                to reduce admin workload so professionals can focus on what truly
                matters — patient care.
                </p>
            </div> 
            
             <div className='bg-white shadow-lg rounded-xl p-6'>
                <FadeUp delay={0.4}>
            <ul className='space-y-4 text-gray-600'>
             <li className="flex gap-1 items-center"><FaCheck className="text-[#3078E2]" /> Secure cloud storage</li>
            <li className="flex gap-1 items-center"><FaCheck className="text-[#3078E2]" /> AI-powered transcription</li>
            <li className="flex gap-1 items-center"><FaCheck className="text-[#3078E2]" /> Smart report generation</li>
            <li className="flex gap-1 items-center"><FaCheck className="text-[#3078E2]" /> HIPAA-ready architecture</li>
            </ul>
                </FadeUp>

        </div>
           
        </div>
      

     </FadeUp>

    </section>
  )
}

export default About
