import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, Trash2, Edit2, 
  Award, ShieldCheck, Briefcase, MapPin, LogOut, Save, X, ArrowRight 
} from 'lucide-react';
import api from '../api/axiosInstance'; 
import { getUser, logout } from '../auth/storage'; 
import { FaUserCircle } from 'react-icons/fa';

const TherapistProfile = () => {
  // --- STATE ---
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  //  Get Name/Email from Local Storage
  const user = getUser(); 

  const [formData, setFormData] = useState({
    firstName: user?.first_name || '', 
    lastName: user?.last_name || '',
    email: user?.email || '', 
    
    specialization: '',
    licenseNumber: '',
    clinicName: '',
    city: '',
    country: '',
    yearsExperience: '', 
  });

  const [errors, setErrors] = useState({});

  // ---  VALIDATION ---
  const checkFormValidity = () => {
    return (
      formData.specialization?.trim() !== '' &&
      formData.licenseNumber?.trim() !== '' &&
      formData.clinicName?.trim() !== '' &&
      formData.city?.trim() !== '' &&
      formData.country?.trim() !== '' &&
      formData.yearsExperience?.toString().trim() !== ''
    );
  };
  const isFormValid = checkFormValidity();

  // ---  FETCH PROFILE DATA (GET) ---
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await api.get('/therapist/profile/'); 
        const data = response.data;
        
        setFormData(prev => ({
          ...prev,
          specialization: data.specialization || '',
          licenseNumber: data.license_number || '',
          clinicName: data.clinic_name || '',
          city: data.city || '',
          country: data.country || '',
          yearsExperience: data.years_experience || ''
        }));

        // If profile is empty (new user), open edit mode
        if (!data.specialization) setIsEditing(true);

      } catch (error) {
        console.error("Error loading profile:", error);
        // If 404 (Profile not created yet), just open edit mode
        setIsEditing(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setErrors({});
  };

  // --- 5. DELETE ---
  const handleDelete = async () => {
    // 1. Show confirmation dialog
    if (window.confirm("Are you sure you want to delete your profile? This cannot be undone.")) {
      try {
        // 2. Call the delete API
        await api.delete('/therapist/profile/');
        // 3. Log the user out and redirect
        await logout(); 
      } catch (error) { 
        alert("Error deleting profile"); 
        console.error(error);
      }
    }
  };

  // --- NEW LOGIC: EDIT / SAVE TOGGLE ---
  const handleEditToggle = async (e) => {
    if(e) e.preventDefault();

    if (isEditing) {
      // Logic for SAVING
      if (!checkFormValidity()) {
        alert("Please fill in all fields before saving.");
        return;
      }

      try {
        const payload = {
            specialization: formData.specialization,
            license_number: formData.licenseNumber,
            clinic_name: formData.clinicName,
            city: formData.city,
            country: formData.country,
            years_experience: formData.yearsExperience,
        };

        await api.patch('/therapist/profile/', payload);
        
        // Success: Exit edit mode
        setIsEditing(false); 
      } catch (error) {
        console.error("Save error:", error);
        alert("Failed to save profile.");
      }
    } else {
      // Logic for EDITING
      setIsEditing(true);
    }
  };

  const handleDashboardClick = (e) => {
    if(e) e.preventDefault();
    navigate('/dashboard');
  };

  // --- STYLES HELPER ---
  const getInputClass = (isError) => {
    const base = "w-full transition-all duration-200 rounded px-2 py-1 ";
    if (!isEditing) return base + "bg-transparent border-transparent cursor-default pointer-events-none"; 
    return base + `bg-white border ${isError ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-blue-500 outline-none'}`;
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-slate-800 pb-32">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="flex gap-2 items-center">
          <div className="text-[#3078E2] p-1 rounded-xl self-start -mt-1 ml-4">
            <FaUserCircle size={42} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Dr. {formData.firstName} {formData.lastName}
            </h1>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500 items-center">
               <div className="flex items-center gap-1 bg-white border border-white px-3 py-1 rounded-full shadow-sm">
                 <Mail size={14} className="text-blue-500" /> 
                 <span className="text-slate-600">{formData.email}</span>
               </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 p-2">
              <Calendar size={12} /> Joined Today
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4 md:mt-0">
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-colors">
            <LogOut size={16} /> Logout
          </button>
          
         

        
          <button 
            onClick={handleEditToggle} 
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-colors font-bold ${
              isEditing 
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-md' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
             {isEditing ? (
                <>
                  <Save size={16} /> Save Changes
                </>
             ) : (
                <>
                  <Edit2 size={16} /> Edit Profile
                </>
             )}
          </button>
       
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2   text-red-600  rounded-2xl hover:bg-red-100 transition-colors"
            title="Delete Profile"
          >
            <Trash2 size={22} /> 
          </button>
        </div>
      </div>

      {/* VALIDATION ALERT */}
      {isEditing && !isFormValid && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-center gap-2">
            <ShieldCheck size={20} />
            <span>Please fill in <strong>all fields</strong> to continue.</span>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
             {isEditing && <span className="absolute top-4 right-4 text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded">EDITING MODE</span>}

            <div className="flex items-center gap-2 mb-6 text-slate-900 font-semibold text-lg">
              <Award className="text-blue-500" /> Professional Credentials
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <input 
                  name="specialization"
                  value={formData.specialization} 
                  onChange={handleChange}
                  readOnly={!isEditing}
                  placeholder="e.g. Clinical Psychologist"
                  className={`${getInputClass(errors.specialization)} text-lg font-medium text-slate-900`}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  License Number <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    name="licenseNumber"
                    value={formData.licenseNumber} 
                    onChange={handleChange}
                    readOnly={!isEditing}
                    placeholder="e.g. PSY-123456"
                    className={`${getInputClass(errors.licenseNumber)} font-mono text-blue-700 max-w-xs`}
                  />
                  <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 select-none">
                    <ShieldCheck size={12} /> VERIFIED
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2 text-slate-900 font-semibold text-lg">
              <Briefcase className="text-orange-500" /> Current Practice
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Clinic Name <span className="text-red-500">*</span>
              </label>
              <input 
                name="clinicName"
                value={formData.clinicName} 
                onChange={handleChange}
                readOnly={!isEditing}
                placeholder="e.g. Mindful Horizons"
                className={`${getInputClass(errors.clinicName)} text-lg font-medium text-slate-900`}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#3078E2] via-[#638ECB] to-[#8AAEE0] p-8 rounded-3xl text-white shadow-lg relative flex flex-col justify-center items-center text-center">
             <div className="relative z-10 w-full">
               <p className="text-blue-100 text-sm font-medium mb-2">Total Experience</p>
               <div className="flex items-baseline gap-2 justify-center">
                  {isEditing ? (
                    <input
                      type="number"
                      name="yearsExperience"
                      value={formData.yearsExperience}
                      onChange={handleChange}
                      placeholder="0"
                      className="bg-white/20 border-b-2 border-white/40 text-white text-6xl font-bold w-32 text-center focus:outline-none focus:bg-white/30 rounded px-2"
                    />
                  ) : (
                    <span className="text-6xl font-bold tracking-tighter">{formData.yearsExperience || 0}</span>
                  )}
                  <span className="text-xl text-blue-200">Years</span>
                </div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6 text-slate-900 font-semibold text-lg">
              <MapPin className="text-[#3078E2]" /> Location
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input 
                  name="city"
                  value={formData.city} 
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className={getInputClass(errors.city)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                 <input 
                  name="country"
                  value={formData.country} 
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className={getInputClass(errors.country)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BUTTON */}
      <div className='flex items-center mt-6 w-fit '>
        <button
          type="button" 
          onClick={handleDashboardClick}
          disabled={!isFormValid}
          className={`
            w-full flex justify-center items-center gap-2 px-6 py-4 rounded-2xl font-normal text-lg transition-all
            ${isFormValid 
              ? 'bg-[#3078E2] text-white hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70'
            }
          `}
        >
          <span>Go to Dashboard</span>
          {isFormValid && <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
};

export default TherapistProfile;