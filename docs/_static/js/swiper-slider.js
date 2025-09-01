// Swiper.js Image Slider for Sphinx Documentation
// This is an alternative to the custom slider using the Swiper.js library

// Load Swiper CSS and JS dynamically
function loadSwiper() {
    // Load Swiper CSS
    const swiperCSS = document.createElement('link');
    swiperCSS.rel = 'stylesheet';
    swiperCSS.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
    document.head.appendChild(swiperCSS);

    // Load custom CSS with version to prevent caching issues
    const customCSS = document.createElement('link');
    customCSS.rel = 'stylesheet';
    customCSS.href = '/_static/css/swiper-custom.css?v=' + Date.now();
    document.head.appendChild(customCSS);

    // Load Swiper JS
    const swiperJS = document.createElement('script');
    swiperJS.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
    swiperJS.onload = initializeSwipers;
    document.head.appendChild(swiperJS);
}

function initializeSwipers() {
    const sliderContainers = document.querySelectorAll('.swiper-slider-container');
    
    sliderContainers.forEach((container, index) => {
        // Create Swiper structure
        const swiperWrapper = document.createElement('div');
        swiperWrapper.className = 'swiper-wrapper';
        
        // Move images to swiper-wrapper
        const images = Array.from(container.querySelectorAll('img'));
        images.forEach(img => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.appendChild(img.cloneNode(true));
            swiperWrapper.appendChild(slide);
        });
        
        // Clear container and add Swiper structure
        container.innerHTML = '';
        container.appendChild(swiperWrapper);
        
        // Add navigation
        const prevButton = document.createElement('div');
        prevButton.className = 'swiper-button-prev';
        container.appendChild(prevButton);
        
        const nextButton = document.createElement('div');
        nextButton.className = 'swiper-button-next';
        container.appendChild(nextButton);
        
        // Pagination removed for cleaner interface
        
        // Initialize Swiper
        new Swiper(container, {
            loop: true,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            effect: 'slide', // Changed from 'fade' to 'slide' for sliding animation
            speed: 600,
            slidesPerView: 1,
            spaceBetween: 0,
            grabCursor: true,
            keyboard: {
                enabled: true,
            },
            mousewheel: {
                enabled: true,
            },
        });
    });
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadSwiper();
}); 