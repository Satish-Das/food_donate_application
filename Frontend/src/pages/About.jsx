import React from 'react';
import Testimonial from '../components/Testimonial';
// import p6 from '../assets/img/p6.jpg';
import p6 from '../assets/img/p6.png';

const About = () => {
  return (
    <>
      {/* Responsive Image */}
      <img 
      className="w-full h-auto object-cover transition-all duration-300 rounded-lg cursor-pointer filter grayscale hover:grayscale-0" 
      src={p6}  // Use imported variable here
      alt="About Us"
      />

      <Testimonial /><br />

      {/* Responsive Card Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 justify-center px-2 md:px-0 justify-items-center">
        <div className="max-w-xl h-96 p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white text-center">
            Our Mission
          </h5>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400 flex-grow">
            Our mission is to drive innovation and create impactful technological solutions that make life easier.
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum architecto eius libero natus, reiciendis velit voluptatibus consequuntur sed fugiat maxime repudiandae iusto at ut vitae ullam est eum voluptates ipsam consectetur nobis. Voluptatibus cumque sed eum deserunt, animi saepe veritatis nobis repellat itaque facilis, vitae iste exercitationem aspernatur similique facere?
          </p>
          <a 
            href="#" 
            className="mt-auto inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 w-30"
          >
            Read more
            <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
            </svg>
          </a>
        </div>

        <div className="max-w-xl h-96 p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white text-center">
            Our Vision
          </h5>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400 flex-grow">
            Our vision is to be at the forefront of cutting-edge technology, making the world more connected and efficient.
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi voluptatum enim fugiat accusantium quos nihil. Non, quidem totam. Consequatur saepe praesentium illum dicta sed asperiores atque esse hic, ea nostrum explicabo dolores ratione qui quia modi et non dolore fugiat, soluta est ducimus repudiandae quasi adipisci! Similique maiores perspiciatis molestiae!
          </p>
          <a 
            href="#" 
            className="mt-auto inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 w-30"
          >
            Read more
            <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
            </svg>
          </a>
        </div>
      </div>
      <br />
    </>
  );
}

export default About;
