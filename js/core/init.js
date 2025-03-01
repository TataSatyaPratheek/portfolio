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
                
            case 'about.html':
                // About page initialization
                initAboutPage();
                break;
                
            case 'skills.html':
                // Skills page initialization
                if (window.SkillsModule) {
                    window.SkillsModule.init();
                }
                break;
                
            case 'experience.html':
                // Experience page initialization
                if (window.ExperienceModule) {
                    window.ExperienceModule.init();
                }
                break;
                
            case 'projects.html':
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
                
            case 'blog.html':
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
                
            case 'contact.html':
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
    
    // Initialize everything when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize common components
        initCommonComponents();
        
        // Initialize page-specific content
        initPageContent();
    });
})();