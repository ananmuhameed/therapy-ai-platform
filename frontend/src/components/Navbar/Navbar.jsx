import { NavLink } from "react-router-dom";
import { RiMentalHealthLine } from "react-icons/ri";
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const linkClasses = ({ isActive}) =>
    `flex items-center gap-2 text-[16px] font-medium transition-colors ${isActive ? "text-[#3078E2]" : "text-[#727473]"}`;
  return (
    <>
    <nav className ="w-full bg-white px-8 py-6 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center">
         <RiMentalHealthLine className="text-[#3078E2]" size={36} />
      </div>
      {/* Links */}
      <div className="flex items-center gap-12" >
        <NavLink to ="/dashboard" className={linkClasses}>
          Dashboard
        </NavLink>

        <NavLink to="/patients" className={linkClasses}>
          Patients
        </NavLink>

        <NavLink to="/reports" className={linkClasses}>
          Reports
        </NavLink>
      </div>

      {/* Profile Button */}
       <NavLink to="/therapistprofile">
      <button className="flex items-center gap-2 bg-[#3078E2] text-white px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition">
       
          <FaUserCircle size={18} />
       
        Profile
      </button>
 </NavLink>
    </nav>
    </>
  )
}

export default Navbar
