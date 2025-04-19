import React, { useState } from 'react';
import p6 from '../assets/img/p6.png';

const Contact = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    message: ''
  });
  
  const [phoneError, setPhoneError] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    const fieldName = id.replace('floating_', '');
    
    // Map field IDs to state property names
    const fieldMapping = {
      'first_name': 'firstName',
      'last_name': 'lastName',
      'message': 'message',
      'email': 'email',
      'phone': 'phone',
      'company': 'company'
    };
    
    // Special handling for phone numbers
    if (fieldName === 'phone') {
      // Only allow digits, and limit to 10 digits
      const digitsOnly = value.replace(/\D/g, '');
      const truncated = digitsOnly.slice(0, 10);
      
      if (value !== truncated && value.length > truncated.length) {
        setPhoneError('Please enter only 10 digits');
      } else {
        setPhoneError('');
      }
      
      setFormData(prev => ({
        ...prev,
        [fieldMapping[fieldName] || fieldName]: truncated
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [fieldMapping[fieldName] || fieldName]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (formData.phone.length !== 10) {
      setPhoneError('Phone number must be 10 digits');
      return;
    }
    
    console.log('Form submitted:', formData);
    // Here you would handle the form submission
  };

  return (
    <>
      <img 
        className="w-full h-auto object-cover transition-all duration-300 rounded-lg cursor-pointer filter grayscale hover:grayscale-0" 
        src={p6}
        alt="About Us"
      />

      <div className="text-center pb-6">
        <h2 className="text-orange-600 font-bold text-2xl bg-white px-6 py-3 rounded-lg shadow-md inline-block mt-6">Contact</h2>
      </div>
          
      <div className="flex justify-center items-center h-130 px-4 md:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
          
          {/* Left Side - Address */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md h-96">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h3>
            <p className="text-gray-700 dark:text-gray-300">
              123 Tech Street, Suite 500 <br />
              San Francisco, CA 94107 <br />
              United States
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              📞 Phone: (123) 456-7890 <br />
              ✉️ Email: contact@company.com
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              🕒 Business Hours: Mon - Fri, 9 AM - 6 PM
            </p>
          </div>

          {/* Right Side - Form */}
          <form onSubmit={handleSubmit} className="max-w-md w-full bg-white dark:bg-gray-100 p-6 rounded-lg shadow-md mb-30 text-black">
          
            <div className="relative z-0 w-full mb-5 group">
              <input 
                type="email" 
                id="floating_email" 
                className="outline-none block w-full px-0 py-2.5 text-sm bg-transparent border-b-2 border-gray-300 appearance-none focus:border-blue-600 peer" 
                placeholder=" " 
                value={formData.email}
                onChange={handleChange}
                required 
              />
              <label 
                htmlFor="floating_email" 
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Email address
              </label>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative z-0 w-full mb-5 group">
                <input 
                  type="text" 
                  id="floating_first_name" 
                  className="outline-none block w-full px-0 py-2.5 text-sm bg-transparent border-b-2 border-gray-300 appearance-none focus:border-blue-600 peer" 
                  placeholder=" " 
                  value={formData.firstName}
                  onChange={handleChange}
                  required 
                />
                <label 
                  htmlFor="floating_first_name" 
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  First name
                </label>
              </div>
              
              <div className="relative z-0 w-full mb-5 group">
                <input 
                  type="text" 
                  id="floating_last_name" 
                  className="outline-none block w-full px-0 py-2.5 text-sm bg-transparent border-b-2 border-gray-300 appearance-none focus:border-blue-600 peer" 
                  placeholder=" " 
                  value={formData.lastName}
                  onChange={handleChange}
                  required 
                />
                <label 
                  htmlFor="floating_last_name" 
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Last name
                </label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative z-0 w-full mb-5 group">
                <input 
                  type="tel" 
                  id="floating_phone" 
                  className="outline-none block w-full px-0 py-2.5 text-sm bg-transparent border-b-2 border-gray-300 appearance-none focus:border-blue-600 peer" 
                  placeholder=" " 
                  value={formData.phone}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  maxLength="10"
                  required 
                />
                <label 
                  htmlFor="floating_phone" 
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Phone number (10 digits)
                </label>
                {phoneError && (
                  <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                )}
              </div>
              
              <div className="relative z-0 w-full mb-5 group">
                <input 
                  type="text" 
                  id="floating_company" 
                  className="outline-none block w-full px-0 py-2.5 text-sm bg-transparent border-b-2 border-gray-300 appearance-none focus:border-blue-600 peer" 
                  placeholder=" " 
                  value={formData.company}
                  onChange={handleChange}
                  required 
                />
                <label 
                  htmlFor="floating_company" 
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Company
                </label>
              </div>
            </div>

            <div className="relative z-0 w-full mb-5 group">
              <textarea 
                id="floating_message" 
                className="outline-none block w-full px-0 py-2.5 text-sm bg-transparent border-b-2 border-gray-300 appearance-none focus:border-blue-600 peer resize-none" 
                placeholder=" " 
                value={formData.message}
                onChange={handleChange}
                rows="3"
                required 
              />
              <label 
                htmlFor="floating_message" 
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                Tell me about your query
              </label>
            </div>

            <button 
              type="submit" 
              className="w-full px-5 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Contact;
