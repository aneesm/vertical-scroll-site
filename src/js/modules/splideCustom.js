/**
* Splide Custom
*/

// Vendor imports
import Splide from '@splidejs/splide';
import { Video } from '@splidejs/splide-extension-video';

export default function () {
  document.addEventListener('DOMContentLoaded', () => {
    // Function to fetch JSON data
    const fetchData = async () => {
      try {
        const response = await fetch('./src/data/data.json');
        const data = await response.json();
        populateContent(data);
        initializeSliders();
      } catch (error) {
        console.error('Error fetching JSON data:', error);
      }
    };
  
    // Function to populate content with JSON data
    const populateContent = (data) => {
      // Update logo path
      const logo = document.querySelector('.logo img');
      if (logo) {
        logo.setAttribute('src', data.logoPath);
      }
  
      // Populate slides with JSON data
      const mainSlide = document.querySelector('.custom-slide--one');
      mainSlide.setAttribute('data-splide-html-video', data.slides[0].video);
      mainSlide.querySelector('.animate-title').textContent = data.slides[0].title;
      mainSlide.querySelector('.animate-desc').textContent = data.slides[0].description;
  
      const nestedSlide = data.slides[1];
      const nestedSlidesContainer = document.querySelector('.nested-slider .splide__list');
      const nestedSubtitle = document.querySelector('.custom-slide--two .animate-title');
      nestedSubtitle.textContent = nestedSlide.title;
  
      nestedSlide.nestedSlides.forEach((nestedSlideText, nestedIndex) => {
        const nestedSlideElement = nestedSlidesContainer.children[nestedIndex];
        nestedSlideElement.textContent = nestedSlideText;
      });
  
      const backgroundSources = document.querySelectorAll('.custom-slide--two .slider__background source');
      backgroundSources[0].setAttribute('srcset', nestedSlide.background.large);
      backgroundSources[1].setAttribute('srcset', nestedSlide.background.medium);
  
      const backgroundImage = document.querySelector('.custom-slide--two .slider__background img');
      backgroundImage.setAttribute('src', nestedSlide.background.small);
    };
  
    // Function to initialize and refresh sliders
    const initializeSliders = () => {
      // Initialize the main vertical slider
      const mainSlider = new Splide('.main-slider', {
        direction: 'ttb',
        heightRatio: 0.5,
        arrows: false,
        wheel: true,
        cover: true,
        video: {
          autoplay: true,
          mute: true,
          loop: true,
          hideControls: true,
          disableOverlayUI: true,
          pauseOnHover: false,
          pauseOnFocus: false,
        },
      });
  
      // Initialize the nested horizontal slider
      const nestedSlider = new Splide('.nested-slider', {
        height: '300px',
        gap: '20px',
        perPage: 3,
        perMove: 1,
        pagination: false,
        arrows: true,
      });
  
      // Mount the main slider after initializing nested sliders
      mainSlider.mount({ Video });
      nestedSlider.mount();
  
      const titles = document.querySelectorAll('.animate-title');
      const descriptions = document.querySelectorAll('.animate-desc');
  
      const callAnim = () => {
        titles.forEach(title => {
          title.classList.remove('active');
          title.classList.add('active');
        });
  
        descriptions.forEach(desc => {
          desc.classList.remove('active');
          desc.classList.add('active');
        });
      };
  
      // On Load
      callAnim();
  
      // Function to handle adding/removing classes safely
      const toggleClass = (elements, index, className, add) => {
        if (elements[index]) {
          elements[index].classList.toggle(className, add);
        }
      };
  
      // Splide on active
      mainSlider.on('active', Slide => {
        toggleClass(titles, Slide.index, 'active', true);
        toggleClass(descriptions, Slide.index, 'active', true);
      });
  
      mainSlider.on('inactive', Slide => {
        toggleClass(titles, Slide.index, 'active', false);
        toggleClass(descriptions, Slide.index, 'active', false);
      });
  
      nestedSlider.on('active', Slide => {
        toggleClass(titles, Slide.index, 'active', true);
      });
  
      nestedSlider.on('inactive', Slide => {
        toggleClass(titles, Slide.index, 'active', false);
      });
    };
  
    // Fetch and populate content with JSON data
    fetchData();
  });
  
}