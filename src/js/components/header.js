/**
 * header.js - Enhanced Header Management
 * Improves mobile navigation and accessibility
 */

const Header = {
    /**
     * Initialize the header component
     */
    init() {
        // Load header content
        this.loadHeader();
    },

    /**
     * Load header content from HTML file
     */
    async loadHeader() {
        const headerElement = document.getElementById('header');
        if (!headerElement) return;

        try {
            // Attempt to load header from file
            const response = await fetch('components/header.html');
            if (!response.ok) {
                throw new Error('Failed to load header component');
            }

            const html = await response.text();
            headerElement.innerHTML = html;

            // Initialize header functionality after loading
            this.initHeaderFunctionality();
        } catch (error) {
            console.error('Error loading header:', error);
            headerElement.innerHTML = this.createFallbackHeader();
        }
    },

    /**
     * Initialize header functionality after content is loaded
     */
    initHeaderFunctionality() {
        // Set active navigation item
        this.setActiveNavItem();

        // Initialize mobile menu
        this.initMobileMenu();

        // Initialize scroll behavior
        this.initScrollBehavior();

        // Initialize accessibility features
        this.initAccessibility();
    },

    /**
     * Set active navigation item based on current page
     */
    setActiveNavItem() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            // Remove active class and aria-current from all links
            link.classList.remove('active');
            link.removeAttribute('aria-current');

            // Check if this link matches the current page
            const href = link.getAttribute('href');
            const isActive =
                (href === currentPage) ||
                (currentPage === 'index.html' && href === 'index.html') ||
                (currentPage === '' && href === 'index.html') ||
                (currentPage.includes('project-detail') && href === 'pages/projects.html') ||
                (currentPage.includes('blog-detail') && href === 'pages/blog.html');

            // Add active class and aria-current to the active link
            if (isActive) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    },

    /**
     * Initialize mobile menu toggle functionality
     */
    initMobileMenu() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navOverlay = document.querySelector('.nav-overlay');

        if (!mobileMenuToggle || !navMenu) return;

        // Toggle menu when button is clicked
        mobileMenuToggle.addEventListener('click', () => {
            this.toggleMobileMenu(mobileMenuToggle, navMenu, navOverlay);
        });

        // Close menu when clicking outside or on a nav link
        document.addEventListener('click', (e) => {
            const isMenuOpen = navMenu.classList.contains('active');

            if (isMenuOpen &&
                !navMenu.contains(e.target) &&
                !mobileMenuToggle.contains(e.target)) {
                this.closeMobileMenu(mobileMenuToggle, navMenu, navOverlay);
            }
        });

        // Close menu when clicking on a nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992) {
                    this.closeMobileMenu(mobileMenuToggle, navMenu, navOverlay);
                }
            });
        });

        // Handle escape key to close menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                this.closeMobileMenu(mobileMenuToggle, navMenu, navOverlay);

                // Return focus to the toggle button
                mobileMenuToggle.focus();
            }
        });
    },

    /**
     * Toggle mobile menu
     * @param {HTMLElement} mobileMenuToggle - Mobile menu toggle button
     * @param {HTMLElement} navMenu - Navigation menu
     * @param {HTMLElement} navOverlay - Navigation overlay
     */
    toggleMobileMenu(mobileMenuToggle, navMenu, navOverlay) {
        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            this.closeMobileMenu(mobileMenuToggle, navMenu, navOverlay);
        } else {
            this.openMobileMenu(mobileMenuToggle, navMenu, navOverlay);
        }
    },

    /**
     * Open mobile menu
     * @param {HTMLElement} mobileMenuToggle - Mobile menu toggle button
     * @param {HTMLElement} navMenu - Navigation menu
     * @param {HTMLElement} navOverlay - Navigation overlay
     */
    openMobileMenu(mobileMenuToggle, navMenu, navOverlay) {
        navMenu.classList.add('active');
        mobileMenuToggle.classList.add('active');

        // Update ARIA attributes
        mobileMenuToggle.setAttribute('aria-expanded', 'true');

        // Show overlay if present
        if (navOverlay) {
            navOverlay.classList.add('active');
        }

        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
    },

    /**
     * Close mobile menu
     * @param {HTMLElement} mobileMenuToggle - Mobile menu toggle button
     * @param {HTMLElement} navMenu - Navigation menu
     * @param {HTMLElement} navOverlay - Navigation overlay
     */
    closeMobileMenu(mobileMenuToggle, navMenu, navOverlay) {
        navMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');

        // Update ARIA attributes
        mobileMenuToggle.setAttribute('aria-expanded', 'false');

        // Hide overlay
        if (navOverlay) {
            navOverlay.classList.remove('active');
        }

        // Restore body scrolling
        document.body.style.overflow = '';
    },

    /**
     * Initialize header scroll behavior
     */
    initScrollBehavior() {
        const header = document.getElementById('header');
        if (!header) return;

        // Add scrolled class when page is scrolled
        const scrollHandler = () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', scrollHandler);

        // Check initial scroll position
        scrollHandler();
    },

    /**
     * Initialize accessibility features for the header
     */
    initAccessibility() {
        // Ensure skip link works correctly
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', function(e) {
                e.preventDefault();
                const mainContent = document.getElementById('main-content');
                if (mainContent) {
                    mainContent.tabIndex = -1;
                    mainContent.focus();

                    // Remove tabindex after focus
                    setTimeout(() => {
                        mainContent.removeAttribute('tabindex');
                    }, 1000);
                }
            });
        }

        // Ensure proper focus management for mobile menu
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('focus', () => {
                // If link is in mobile menu, ensure menu is visible when focused via keyboard
                const navMenu = document.querySelector('.nav-menu');
                const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');

                if (navMenu && mobileMenuToggle && window.innerWidth < 992) {
                    this.openMobileMenu(mobileMenuToggle, navMenu, document.querySelector('.nav-overlay'));
                }
            });
        });
    },

    /**
     * Create fallback header in case loading fails
     * @returns {string} - Fallback header HTML
     */
    createFallbackHeader() {
        return `
            <div class="container">
                <div class="header-inner">
                    <div class="logo">
                        <a href="index.html" class="logo-link">
                            <span class="logo-text">Satya Pratheek</span>
                        </a>
                    </div>
                    <nav class="nav-menu">
                        <ul class="nav-list">
                            <li class="nav-item">
                                <a href="index.html" class="nav-link">Home</a>
                            </li>
                            <li class="nav-item">
                                <a href="pages/about.html" class="nav-link">About</a>
                            </li>
                            <li class="nav-item">
                                <a href="pages/projects.html" class="nav-link">Projects</a>
                            </li>
                            <li class="nav-item">
                                <a href="pages/contact.html" class="nav-link">Contact</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        `;
    }
};

// Initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    Header.init();
});

// Expose to global scope
window.Header = Header;