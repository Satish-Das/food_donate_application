import React from 'react';
import img from '../assets/img/img.png';

const Service = () => {
  return (
    <>

<img 
  className="w-full h-auto object-cover transition-all duration-300 rounded-lg cursor-pointer filter grayscale hover:grayscale-0" 
  src={img}  // Use imported variable here
  alt="About Us"
/>

 
    <div className="flex justify-center items-center h-110 bg-gray-100">
      <div className="grid grid-cols-2 gap-2">
        {/* Donors Section */}
        <div className="bg-gray-50 p-2 border border-gray-100 shadow-md rounded-lg w-180">
          <h2 className="text-4xl font-bold text-center mb-4">Donors</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="w-4 h-4 bg-black rounded-full mt-1 mr-3"></span>
              <p>
                <span className="font-bold">Individuals –</span> Anyone with extra packaged or fresh food can donate. This includes home-cooked meals, dry groceries, or surplus food from events.
              </p>
            </li>
            <li className="flex items-start">
              <span className="w-4 h-4 bg-black rounded-full mt-1 mr-3"></span>
              <p>
                <span className="font-bold">Restaurants & Cafés –</span> Restaurants can contribute unsold but safe-to-eat meals, bakery items, or pre-packaged food.
              </p>
            </li>
            <li className="flex items-start">
              <span className="w-4 h-4 bg-black rounded-full mt-1 mr-3"></span>
              <p>
                <span className="font-bold">Restaurants & Cafés –</span> Restaurants can contribute unsold but safe-to-eat meals, bakery items, or pre-packaged food.
              </p>
            </li>
          </ul>
        </div>

        {/* Receivers Section */}
        <div className="bg-gray-50 p-6 border border-gray-300 shadow-md rounded-lg w-180">
          <h2 className="text-4xl font-bold text-center mb-4">Receives</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="w-4 h-4 bg-black rounded-full mt-1 mr-3"></span>
              <p>
                <span className="font-bold">Governmental Organizations (NGOs) –</span> These are registered organizations working to combat hunger and malnutrition. They often distribute food to homeless individuals, orphanages, underprivileged communities, and disaster-stricken areas.
              </p>
            </li>
            <li className="flex items-start">
              <span className="w-4 h-4 bg-black rounded-full mt-1 mr-3"></span>
              <p>
                <span className="font-bold">Shelters & Community Centers –</span> These include homeless shelters, rehabilitation centers, and refugee camps that provide food and accommodation to people in need. They rely on donations to support daily meals for their residents.
              </p>
            </li>
            <li className="flex items-start">
              <span className="w-4 h-4 bg-black rounded-full mt-1 mr-3"></span>
              <p>
                <span className="font-bold">Needy Individuals & Families –</span> These include low-income families, daily wage workers, elderly individuals without support, and those affected by crises such as job loss, health emergencies, or natural disasters.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
 

    <div className="flex justify-center items-center h-50 bg-gray-100">
      <div className="bg-gray-50 border border-gray-300 shadow-md rounded-lg px-10 py-6 w-360 text-center">
        <h2 className="text-3xl font-bold mb-2">Time</h2>
        <p className="text-2xl font-semibold">24X7 available</p>
      </div>
    </div>


    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="border border-gray-300 shadow-lg rounded-lg overflow-hidden w-360 h-[700px]">
        <iframe
          className="w-full h-full"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7528.283720103727!2d70.79229589240786!3d22.30389467731414!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3959ca6487f05e2b%3A0x9e5e1e3e10d890b2!2sRajkot%2C%20Gujarat%2C%20India!5e0!3m2!1sen!2sus!4v1708786597890!5m2!1sen!2sus"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
      </>
    );
  };

export default Service;
