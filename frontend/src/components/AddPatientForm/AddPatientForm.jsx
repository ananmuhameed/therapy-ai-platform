import { useState } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import "./AddPatientForm.css";

export default function AddPatientForm({onClose}) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    countryCode: "+20",
    phone: "",
    gender: "",
    dob: "",
    notes: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    console.log("Patient Data:", {
      ...form,
      phone: `${form.countryCode}${form.phone}`,
    });

    // later → call API here
  }

  return (
    <div className="ap-container">
      <h1 className="ap-title">New Patient</h1>

      <form className="ap-form" onSubmit={handleSubmit}>
        {/* Full Name */}
        <label>
          Full Name
          <input
            type="text"
            name="fullName"
            placeholder="First and last name"
            value={form.fullName}
            onChange={handleChange}
          />
        </label>

        {/* Email */}
        <label>
          E-mail
          <input
            type="email"
            name="email"
            placeholder="example@examole.com"
            value={form.email}
            onChange={handleChange}
          />
        </label>

        {/* Phone */}
        <label>
          Phone Number
          <div className="ap-phone">
            <select
              name="countryCode"
              value={form.countryCode}
              onChange={handleChange}
            >
              <option value="+20">+20</option>
              <option value="+966">+966</option>
              <option value="+971">+971</option>
            </select>

            <input
              type="tel"
              name="phone"
              placeholder="1234567890"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
        </label>

        {/* Gender & DOB */}
        <div className="ap-row">
          <label>
            Gender
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
            >
              <option value="">Option</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </label>

          <label>
            Date Of Birth
            <div className="ap-date">
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
              />
              {/* <FaRegCalendarAlt /> */}
            </div>
          </label>
        </div>

        {/* Notes */}
        <label>
          Notes
          <textarea
            name="notes"
            placeholder="additional notes"
            value={form.notes}
            onChange={handleChange}
          />
        </label>

        {/* Optional */}
        <button type="submit">Save Patient</button>
      </form>
    </div>
  );
}
