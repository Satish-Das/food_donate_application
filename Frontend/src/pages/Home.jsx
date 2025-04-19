import React, { useState } from 'react';
import p1 from '../assets/img/p1.jpg';  // Correct image import path
import main from '../assets/img/main.png';
const Home = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <img 
            className="w-full h-110 object-cover transition-all duration-300 rounded-lg cursor-pointer filter grayscale hover:grayscale-0" 
            src={main}  // Use imported variable here
            alt="Home"
            />
            
      <br />
      
      {/* Impact Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center p-8 bg-white shadow-xl rounded-2xl transform  transition-transform duration-300">
          <h2 className="text-3xl md:text-4xl font-bold text-orange-600 mb-4">
            CREATING IMPACT SINCE 2025
          </h2>
          <p className="text-gray-700 max-w-2xl mb-8 text-lg">
            For over 20 years, Jeevan Asha has been working for the upliftment of the
            underserved communities through Education and Health
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl ">
            <div className="bg-orange-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow hover:scale-105">
              <span className="text-4xl font-bold text-orange-600 block mb-2">4822</span>
              <span className="text-gray-700">Underprivileged Children Educated</span>
            </div>
            <div className="bg-orange-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow hover:scale-105">
              <span className="text-4xl font-bold text-orange-600 block mb-2">2491</span>
              <span className="text-gray-700">Long Term Impact and Care</span>
            </div>
            <div className="bg-orange-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow hover:scale-105">
              <span className="text-4xl font-bold text-orange-600 block mb-2">40000+</span>
              <span className="text-gray-700">Reach (Consultation, Camps, Awareness)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vision Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-white text-orange-600 font-bold text-2xl px-8 py-4 rounded-full inline-block shadow-lg mb-8">
            OUR VISION
          </div>
          <p className="text-xl md:text-2xl font-semibold max-w-3xl mx-auto leading-relaxed">
            TO BRING HOPE TO MANY LIVES AS WE SERVE DIFFERENT COMMUNITIES
            THROUGH VARIOUS PROJECTS IN THANE AND BEYOND
          </p>
        </div>
      </div>

      {/* Donate Food Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform  transition-transform duration-300">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 h-64 md:h-auto">
              <img src={p1} alt="Food Donation" className="w-full h-96 object-cover" />
            </div>
            <div className="p-8 w-full md:w-1/2 flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Donate Food</h2>
                <p className="text-gray-700 leading-relaxed">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque vel quos magnam doloremque quas. Distinctio error a culpa repellat, officiis autem dignissimos, id quisquam, atque reiciendis eveniet voluptatum inventore praesentium tempora eaque optio molestias commodi modi tenetur labore quasi nihil?
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(true)} 
                className="mt-6 bg-orange-600 text-white px-6 py-3 rounded-full hover:bg-orange-700 transition-colors duration-300 w-full md:w-auto"
              >
                Read More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-11/12 max-w-lg mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Donate Food Details</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              This project focuses on helping underprivileged communities by providing food donations.
              Join us to make a difference in people's lives.
            </p>
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-full bg-orange-600 text-white px-6 py-3 rounded-full hover:bg-orange-700 transition-colors duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
