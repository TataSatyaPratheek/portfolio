/**
 * init.js - Main initialization file for portfolio website
 * Initializes components based on current page and sets up global event handlers.
 */

// Self-executing anonymous function to avoid global scope pollution
(function() {
    // Current page detection
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    /**
     * Initialize common components across all pages
     */
    function initCommonComponents() {
        // Initialize scroll to top button
        initScrollToTop();

        // Initialize keyboard navigation
        initKeyboardNavigation();

        // Remove preloader once page is fully loaded
        window.addEventListener('load', function() {
            const preloader = document.getElementById('preloader');
            if (preloader) {
                setTimeout(function() {
                    preloader.style.opacity = '0';
                    setTimeout(function() {
                        preloader.style.display = 'none';
                    }, 500);
                }, 500);
            }
        });
    }

    /**
     * Initialize scroll to top button
     */
    function initScrollToTop() {
        const scrollToTopBtn = document.getElementById('back-to-top');
        if (!scrollToTopBtn) return;

        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('active');
            } else {
                scrollToTopBtn.classList.remove('active');
            }
        });

        // Scroll to top when clicked
        scrollToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /**
     * Initialize keyboard navigation enhancements
     */
    function initKeyboardNavigation() {
        // Skip to content when pressing tab
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab' && !e.shiftKey && document.activeElement === document.body) {
                const skipLink = document.querySelector('.skip-link');
                if (skipLink) {
                    e.preventDefault();
                    skipLink.focus();
                }
            }
        });
    }

    /**
     * Initialize page-specific content
     */
    function initPageContent() {
        switch (currentPage) {
            case 'index.html':
            case '':
                // Home page initialization
                initHomePage();
                break;

            case 'pages/about.html':
                // About page initialization
                initAboutPage();
                break;

            case 'pages/skills.html':
                // Skills page initialization
                if (window.SkillsModule) {
                    window.SkillsModule.init();
                }
                break;

            case 'pages/experience.html':
                // Experience page initialization
                if (window.ExperienceModule) {
                    window.ExperienceModule.init();
                }
                break;

            case 'pages/projects.html':
                // Projects page initialization
                if (window.ProjectsModule) {
                    window.ProjectsModule.init();
                }
                break;

            case 'project-detail.html':
                // Project detail page initialization
                if (window.ProjectsModule) {
                    window.ProjectsModule.initProjectDetail();
                }
                break;

            case 'pages/blog.html':
                // Blog page initialization
                if (window.BlogsModule) {
                    window.BlogsModule.init();
                }
                break;

            case 'blog-detail.html':
                // Blog detail page initialization
                if (window.BlogsModule) {
                    window.BlogsModule.initBlogDetail();
                }
                break;

            case 'pages/contact.html':
                // Contact page initialization
                if (window.ContactModule) {
                    window.ContactModule.init();
                }
                break;
        }
    }

    /**
     * Initialize home page specific features
     */
    function initHomePage() {
        // Initialize typing effect
        initTypingEffect();

        // Load featured projects
        if (window.ProjectsModule) {
            window.ProjectsModule.loadFeaturedProjects();
        }

        // Load latest blogs
        if (window.BlogsModule) {
            window.BlogsModule.loadLatestBlogs();
        }
    }

    /**
     * Initialize about page specific features
     */
    function initAboutPage() {
        // Initialize timeline animations
        const timelineItems = document.querySelectorAll('.timeline-item');
        if (timelineItems.length) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });

            timelineItems.forEach(item => {
                observer.observe(item);
            });
        }
    }

    /**
     * Initialize typing effect for homepage
     */
    function initTypingEffect() {
        const titleElement = document.getElementById('hero-title');
        if (!titleElement) return;

        const titles = [
            'Software Engineer',
            'Data Scientist',
            'AI Enthusiast',
            'Machine Learning Expert'
        ];

        let currentTitleIndex = 0;
        let currentCharIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100; // milliseconds

        function type() {
            const currentTitle = titles[currentTitleIndex];

            if (isDeleting) {
                // Deleting text
                titleElement.textContent = currentTitle.substring(0, currentCharIndex - 1);
                currentCharIndex--;
                typingSpeed = 50; // Faster when deleting
            } else {
                // Typing text
                titleElement.textContent = currentTitle.substring(0, currentCharIndex + 1);
                currentCharIndex++;
                typingSpeed = 100; // Normal speed when typing
            }

            // If finished typing the current word
            if (!isDeleting && currentCharIndex === currentTitle.length) {
                isDeleting = false;
                typingSpeed = 2000; // Pause at the end of the word
                setTimeout(() => {
                    isDeleting = true;
                }, typingSpeed);
                return;
            }

            // If finished deleting the current word
            if (isDeleting && currentCharIndex === 0) {
                isDeleting = false;
                currentTitleIndex = (currentTitleIndex + 1) % titles.length; // Move to next word
                typingSpeed = 500; // Pause before typing the next word
            }

            // Schedule the next frame
            setTimeout(type, typingSpeed);
        }

        // Start the typing effect
        setTimeout(type, 1000); // Initial delay
    }

    /**
     * Image Optimization and Lazy Loading Module
     */
    const ImageOptimizer = {
        /**
         * Initialize image optimization across the site
         */
        init() {
            this.setupLazyLoading();
            this.handleResponsiveImages();
            this.setupErrorHandling();
            this.optimizePerformance();
        },

        /**
         * Implement lazy loading for images
         */
        setupLazyLoading() {
            // Check if Intersection Observer is supported
            if ('IntersectionObserver' in window) {
                const lazyImages = document.querySelectorAll('img[loading="lazy"]');
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const lazyImage = entry.target;
                            // Handle image load
                            lazyImage.addEventListener('load', () => {
                                lazyImage.classList.add('loaded');
                            });
                            // If data-src is present, swap src
                            if (lazyImage.dataset.src) {
                                lazyImage.src = lazyImage.dataset.src;
                                lazyImage.removeAttribute('data-src');
                            }
                            // Stop observing this image
                            observer.unobserve(lazyImage);
                        }
                    });
                }, {
                    rootMargin: '50px 0px',
                    threshold: 0.01
                });
                // Observe lazy images
                lazyImages.forEach(img => imageObserver.observe(img));
            } else {
                // Fallback for browsers without Intersection Observer
                const lazyImages = document.querySelectorAll('img[loading="lazy"]');
                lazyImages.forEach(img => {
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                });
            }
        },

        /**
         * Handle responsive image sizing and srcset
         */
        handleResponsiveImages() {
            const responsiveImages = document.querySelectorAll('img');
            responsiveImages.forEach(img => {
                // Add srcset for different screen sizes if not already present
                if (!img.srcset) {
                    const originalSrc = img.src;
                    // Generate srcset variations (adjust paths as needed)
                    img.srcset = `
                        ${originalSrc.replace(/\.(\w+)$/, '-small.$1')} 300w,
                        ${originalSrc.replace(/\.(\w+)$/, '-medium.$1')} 768w,
                        ${originalSrc} 1200w
                    `;
                    // Add sizes attribute
                    img.sizes = `
                        (max-width: 300px) 280px,
                        (max-width: 768px) 720px,
                        1200px
                    `;
                }
            });
        },

        /**
         * Setup error handling for images
         */
        setupErrorHandling() {
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                img.addEventListener('error', (e) => {
                    // Fallback image or error state
                    e.target.src = 'assets/images/fallback-image.svg';
                    e.target.alt = 'Image failed to load';
                    e.target.classList.add('image-error');
                });
                // Ensure meaningful alt text
                if (!img.alt) {
                    // Generate a generic alt text based on context
                    const generateAltText = (image) => {
                        const parentSection = image.closest('section');
                        const parentHeading = parentSection?.querySelector('h1, h2, h3');
                        if (parentHeading) {
                            return `Image related to ${parentHeading.textContent.trim()}`;
                        }
                        // Fallback generic alt text
                        return 'Descriptive image';
                    };
                    img.alt = generateAltText(img);
                }
            });
        },

        /**
         * Optimize image performance and preloading
         */
        optimizePerformance() {
            // Preload critical images
            const criticalImages = [
                'assets/images/profile-picture.jpg',
                'assets/images/logo.png'
            ];
            criticalImages.forEach(imageSrc => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = imageSrc;
                document.head.appendChild(link);
            });
            // Optimize background images
            this.optimizeBackgroundImages();
        },

        /**
         * Optimize background images for performance
         */
        optimizeBackgroundImages() {
            // Select elements with background images
            const elementsWithBg = document.querySelectorAll('[data-bg-image]');
            elementsWithBg.forEach(el => {
                const imageSrc = el.getAttribute('data-bg-image');
                // Create an image object to preload
                const img = new Image();
                img.src = imageSrc;
                // Once image is loaded, set as background
                img.onload = () => {
                    el.style.backgroundImage = `url(${imageSrc})`;
                    el.classList.add('bg-image-loaded');
                };
            });
        },

        /**
         * Create responsive image variations (client-side generation)
         * Note: In a real-world scenario, this would typically be done server-side
         * @param {string} originalSrc - Original image source
         * @returns {Object} - Object with different image sizes
         */
        createResponsiveImage(originalSrc) {
            return {
                small: originalSrc.replace(/\.(\w+)$/, '-small.$1'),
                medium: originalSrc.replace(/\.(\w+)$/, '-medium.$1'),
                large: originalSrc
            };
        }
    };

    // Initialize everything when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize common components
        initCommonComponents();

        // Initialize page-specific content
        initPageContent();

        // Initialize image optimization
        ImageOptimizer.init();
    });
})();