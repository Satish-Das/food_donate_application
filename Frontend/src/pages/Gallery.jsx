import React from 'react';
import p6 from '../assets/img/p6.png';
const Gallery = () => {
  return (
    <>
     <img 
          className="w-full h-auto object-cover transition-all duration-300 rounded-lg cursor-pointer filter grayscale hover:grayscale-0" 
          src={p6}  // Use imported variable here
          alt="About Us"
          />
    
    
  <br />
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="grid gap-4 ">
          <div className='Gallery-img'>
              <img class="h-auto max-w-full rounded-lg hover:drop-shadow-[0_0_10px_#333] hover:scale-[1.03] transition duration-300 ease-in-out hover:grayscale-0" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image.jpg" alt=""/>
          </div>
          <div>
              <img class="h-auto max-w-full rounded-lg hover:drop-shadow-[0_0_10px_#333] hover:scale-[1.03] transition duration-300 ease-in-out hover:grayscale-0" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-1.jpg" alt=""/>
          </div>
          <div>
              <img class="h-auto max-w-full rounded-lg hover:drop-shadow-[0_0_10px_#333] hover:scale-[1.03] transition duration-300 ease-in-out hover:grayscale-0" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-2.jpg" alt=""/>
          </div>
      </div>
      <div class="grid gap-4">
          <div>
              <img class="h-auto max-w-full rounded-lg hover:drop-shadow-[0_0_10px_#333] hover:scale-[1.03] transition duration-300 ease-in-out hover:grayscale-0" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-3.jpg" alt=""/>
          </div>
          <div>
              <img class="h-auto max-w-full rounded-lg hover:drop-shadow-[0_0_10px_#333] hover:scale-[1.03] transition duration-300 ease-in-out hover:grayscale-0" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-4.jpg" alt=""/>
          </div>
          <div>
              <img class="h-auto max-w-full rounded-lg hover:drop-shadow-[0_0_10px_#333] hover:scale-[1.03] transition duration-300 ease-in-out hover:grayscale-0" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-5.jpg" alt=""/>
          </div>
      </div>
      <div class="grid gap-4">
          <div>
              <img class="h-auto max-w-full rounded-lg hover:drop-shadow-[0_0_10px_#333] hover:scale-[1.03] transition duration-300 ease-in-out hover:grayscale-0" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-6.jpg" alt=""/>
          </div>
          <div>
              <img class="h-auto max-w-full rounded-lg hover:drop-shadow-[0_0_10px_#333] hover:scale-[1.03] transition duration-300 ease-in-out hover:grayscale-0" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-7.jpg" alt=""/>
          </div>
          <div>
              <img class="h-auto max-w-full rounded-lg hover:drop-shadow-[0_0_10px_#333] hover:scale-[1.03] transition duration-300 ease-in-out hover:grayscale-0" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-8.jpg" alt=""/>
          </div>
      </div>
      <div class="grid gap-4">
          <div>
              <img class="h-auto max-w-full rounded-lg hover:drop-shadow-[0_0_10px_#333] hover:scale-[1.03] transition duration-300 ease-in-out hover:grayscale-0" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-9.jpg" alt=""/>
          </div>
          <div>
              <img class="h-auto max-w-full rounded-lg hover:drop-shadow-[0_0_10px_#333] hover:scale-[1.03] transition duration-300 ease-in-out hover:grayscale-0" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-10.jpg" alt=""/>
          </div>
          <div>
              <img class="h-auto max-w-full rounded-lg hover:drop-shadow-[0_0_10px_#333] hover:scale-[1.03] transition duration-300 ease-in-out hover:grayscale-0" src="https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-11.jpg" alt=""/>
          </div>
      </div>
  </div><br />

      
      </>
    );
  };

export default Gallery;
