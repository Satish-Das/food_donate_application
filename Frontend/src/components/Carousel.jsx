import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "flowbite";
import p1 from '../assets/img/p1.jpg';
import p2 from '../assets/img/p2.jpg';
import p3 from '../assets/img/p3.jpg';
import p4 from '../assets/img/p4.jpg';
import p5 from '../assets/img/p5.jpg';

const Carousel = () => {
  const navigate = useNavigate(); // Hook for navigation

  return (
    <>
      <div id="default-carousel" className="relative w-full" data-carousel="slide">
        <div className="relative h-[600px] overflow-hidden rounded-lg">
          {[p1, p2, p3, p4, p5].map((img, index) => (
            <div key={index} className="hidden duration-700 ease-in-out" data-carousel-item>
              <img
                src={img}
                className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                alt={`Slide ${index + 1}`}
              />
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <div className="absolute z-30 flex space-x-3 -translate-x-1/2 bottom-5 left-1/2">
          {[0, 1, 2, 3, 4].map((num) => (
            <button
              key={num}
              type="button"
              className="w-3 h-3 rounded-full bg-white"
              aria-current={num === 0}
              aria-label={`Slide ${num + 1}`}
              data-carousel-slide-to={num}
            ></button>
          ))}
        </div>

        <button
          type="button"
          className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
          data-carousel-prev
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
            <svg
              className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 1 1 5l4 4"
              />
            </svg>
            <span className="sr-only">Previous</span>
          </span>
        </button>

        <button
          type="button"
          className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
          data-carousel-next
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
            <svg
              className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 9 4-4-4-4"
              />
            </svg>
            <span className="sr-only">Next</span>
          </span>
        </button>
      </div>

      {/* Donate Now Button */}
      <div className="absolute  w-full h-[500px] bg-cover bg-center">
        <button
          onClick={() => navigate("/donate")} // Navigate to Donate page
          className="absolute bottom-[550px] left-10 bg-[#062B40] text-white px-6 py-4 
                     text-lg flex items-center rounded-lg no-underline z-99"
        >
          Donate Now
          <span className="ml-2 bg-orange-500 px-3 py-2 rounded-full">→</span>
        </button>
      </div>
    </>
  );
};

export default Carousel;
