// Enhanced Image Slider for Sphinx Documentation
class ImageSlider {
    constructor(containerId, images) {
        this.container = document.getElementById(containerId);
        this.images = images;
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 4000; // 4 seconds
        this.isAutoPlaying = true;
        this.init();
    }

    init() {
        if (!this.container || this.images.length === 0) return;

        // Create slider container
        this.sliderContainer = document.createElement('div');
        this.sliderContainer.className = 'image-slider';
        this.sliderContainer.style.cssText = `
            position: relative;
            width: 100%;
            max-width: 100%;
            margin: 20px 0;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        `;

        // Create image element with transition
        this.imageElement = document.createElement('img');
        this.imageElement.style.cssText = `
            width: 100%;
            height: auto;
            display: block;
            transition: opacity 0.5s ease-in-out;
            opacity: 1;
        `;

        // Create navigation buttons
        this.prevButton = document.createElement('button');
        this.prevButton.innerHTML = '&#10094;';
        this.prevButton.className = 'slider-btn prev-btn';
        this.prevButton.style.cssText = `
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0,0,0,0.7);
            color: white;
            border: none;
            padding: 12px 16px;
            cursor: pointer;
            border-radius: 50%;
            font-size: 18px;
            z-index: 10;
            transition: all 0.3s ease;
            opacity: 0.8;
        `;

        this.nextButton = document.createElement('button');
        this.nextButton.innerHTML = '&#10095;';
        this.nextButton.className = 'slider-btn next-btn';
        this.nextButton.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0,0,0,0.7);
            color: white;
            border: none;
            padding: 12px 16px;
            cursor: pointer;
            border-radius: 50%;
            font-size: 18px;
            z-index: 10;
            transition: all 0.3s ease;
            opacity: 0.8;
        `;

        // Create indicators
        this.indicatorsContainer = document.createElement('div');
        this.indicatorsContainer.className = 'slider-indicators';
        this.indicatorsContainer.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 5px;
            z-index: 10;
        `;

        // Create counter
        this.counter = document.createElement('div');
        this.counter.className = 'slider-counter';
        this.counter.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            z-index: 10;
        `;

        // Create auto-play toggle button
        this.autoPlayButton = document.createElement('button');
        this.autoPlayButton.innerHTML = '⏸';
        this.autoPlayButton.className = 'slider-autoplay-btn';
        this.autoPlayButton.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            cursor: pointer;
            z-index: 10;
            transition: all 0.3s ease;
        `;

        // Assemble slider
        this.sliderContainer.appendChild(this.imageElement);
        this.sliderContainer.appendChild(this.prevButton);
        this.sliderContainer.appendChild(this.nextButton);
        this.sliderContainer.appendChild(this.indicatorsContainer);
        this.sliderContainer.appendChild(this.counter);
        this.sliderContainer.appendChild(this.autoPlayButton);

        // Replace original content
        this.container.innerHTML = '';
        this.container.appendChild(this.sliderContainer);

        // Create indicators
        this.createIndicators();

        // Add event listeners
        this.prevButton.addEventListener('click', () => this.prev());
        this.nextButton.addEventListener('click', () => this.next());
        this.autoPlayButton.addEventListener('click', () => this.toggleAutoPlay());

        // Add hover effects
        this.sliderContainer.addEventListener('mouseenter', () => this.pauseAutoPlay());
        this.sliderContainer.addEventListener('mouseleave', () => this.resumeAutoPlay());

        // Show first image
        this.showImage(0);
        
        // Start auto-play
        this.startAutoPlay();
    }

    createIndicators() {
        this.indicators = [];
        for (let i = 0; i < this.images.length; i++) {
            const indicator = document.createElement('span');
            indicator.className = 'indicator';
            indicator.style.cssText = `
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: rgba(255,255,255,0.5);
                cursor: pointer;
                transition: background 0.3s;
            `;
            indicator.addEventListener('click', () => this.showImage(i));
            this.indicatorsContainer.appendChild(indicator);
            this.indicators.push(indicator);
        }
    }

    showImage(index) {
        // Fade out effect
        this.imageElement.style.opacity = '0';
        
        setTimeout(() => {
            this.currentIndex = index;
            this.imageElement.src = this.images[index].src;
            this.imageElement.alt = this.images[index].alt;
            
            // Fade in effect
            setTimeout(() => {
                this.imageElement.style.opacity = '1';
            }, 50);
            
            this.updateCounter();
            this.updateIndicators();
        }, 250);
    }

    updateCounter() {
        this.counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
    }

    updateIndicators() {
        this.indicators.forEach((indicator, index) => {
            indicator.style.background = index === this.currentIndex 
                ? 'rgba(255,255,255,1)' 
                : 'rgba(255,255,255,0.5)';
        });
    }

    startAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
        this.autoPlayInterval = setInterval(() => {
            if (this.isAutoPlaying) {
                this.next();
            }
        }, this.autoPlayDelay);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    pauseAutoPlay() {
        this.isAutoPlaying = false;
        this.autoPlayButton.innerHTML = '▶';
    }

    resumeAutoPlay() {
        this.isAutoPlaying = true;
        this.autoPlayButton.innerHTML = '⏸';
    }

    toggleAutoPlay() {
        if (this.isAutoPlaying) {
            this.pauseAutoPlay();
        } else {
            this.resumeAutoPlay();
        }
    }

    prev() {
        const newIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.images.length - 1;
        this.showImage(newIndex);
        this.resetAutoPlayTimer();
    }

    next() {
        const newIndex = this.currentIndex < this.images.length - 1 ? this.currentIndex + 1 : 0;
        this.showImage(newIndex);
        this.resetAutoPlayTimer();
    }

    resetAutoPlayTimer() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.startAutoPlay();
        }
    }
}

// Auto-initialize sliders when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Find all slider containers
    const sliderContainers = document.querySelectorAll('.image-slider-container');
    
    sliderContainers.forEach(container => {
        const images = Array.from(container.querySelectorAll('img')).map(img => ({
            src: img.src,
            alt: img.alt
        }));
        
        if (images.length > 1) {
            new ImageSlider(container.id, images);
        }
    });

    // Add hover effects for buttons
    document.addEventListener('mouseover', function(e) {
        if (e.target.classList.contains('slider-btn') || e.target.classList.contains('slider-autoplay-btn')) {
            e.target.style.opacity = '1';
            e.target.style.transform = e.target.classList.contains('prev-btn') || e.target.classList.contains('next-btn') 
                ? 'translateY(-50%) scale(1.1)' 
                : 'scale(1.1)';
        }
    });

    document.addEventListener('mouseout', function(e) {
        if (e.target.classList.contains('slider-btn') || e.target.classList.contains('slider-autoplay-btn')) {
            e.target.style.opacity = '0.8';
            e.target.style.transform = e.target.classList.contains('prev-btn') || e.target.classList.contains('next-btn') 
                ? 'translateY(-50%) scale(1)' 
                : 'scale(1)';
        }
    });
}); 