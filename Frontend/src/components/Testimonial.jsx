import React, { useState } from "react";
import Joshan from "../assets/img/joshan.png";
import p2 from "../assets/img/p2.jpg";
import p3 from "../assets/img/p3.jpg";

const testimonials = [
  {
    img: Joshan,
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae quis eveniet cum amet tenetur maxime odio accusamus qui iusto, repellendus temporibus possimus aliquid ipsa.",
    author: "Joshan Kumar Kushwaha",
    
  },
  {
    img: p2,
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae quis eveniet cum amet tenetur maxime odio accusamus qui iusto, repellendus temporibus possimus aliquid ipsa.",
    author: "Satish Das",
    
  },
  {
    img: p3,
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae quis eveniet cum amet tenetur maxime odio accusamus qui iusto, repellendus temporibus possimus aliquid ipsa.",
    author: "Rohi Yadav",
  }
];

const Testimonial = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="bg-gray-50 py-16 flex items-center justify-center h-110">
      <div className=" w-350 relative bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Testimonial Content */}
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2">
            <img
              src={testimonials[currentIndex].img}
              alt="Testimonial"
              className="w-full h-110 object-cover rounded-l-2xl"
            />
          </div>
          <div className="w-full md:w-1/2 p-8">
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              "{testimonials[currentIndex].text}"
            </p>
            <h4 className="text-xl font-semibold text-gray-900">
              {testimonials[currentIndex].author}
            </h4>
            <p className="text-orange-600">{testimonials[currentIndex].position}</p>
            <button className="mt-6 bg-orange-600 text-white px-6 py-3 rounded-full hover:bg-orange-700 transition-colors duration-300">
              Read More
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 z-30 flex items-center justify-center h-12 w-12 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors duration-300"
        >
          ◀
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 z-30 flex items-center justify-center h-12 w-12 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors duration-300"
        >
          ▶
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full ${index === currentIndex ? "bg-orange-600" : "bg-gray-400"} hover:bg-orange-700 transition-colors duration-300`}
              aria-label={`Slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonial;