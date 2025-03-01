/**
 * footer.js - Footer component for portfolio website
 * Handles loading the footer and updating dynamic content like copyright year.
 */

// Footer Component
const Footer = {
    /**
     * Initialize the footer component
     */
    init() {
        // Load footer content
        this.loadFooter();
    },
    
    /**
     * Load footer content from HTML file
     */
    async loadFooter() {
        const footerElement = document.getElementById('footer');
        if (!footerElement) return;
        
        try {
            // Attempt to load footer from file
            const response = await fetch('components/footer.html');
            if (!response.ok) {
                throw new Error('Failed to load footer component');
            }
            
            const html = await response.text();
            footerElement.innerHTML = html;
            
            // Update dynamic content after loading
            this.updateDynamicContent();
        } catch (error) {
            console.error('Error loading footer:', error);
            footerElement.innerHTML = this.createFallbackFooter();
        }
    },
    
    /**
     * Update dynamic content in the footer
     */
    updateDynamicContent() {
        // Update copyright year
        this.updateCopyrightYear();
        
        // Initialize footer interactions
        this.initFooterInteractions();
    },
    
    /**
     * Update copyright year to current year
     */
    updateCopyrightYear() {
        const yearElement = document.querySelector('.copyright-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    },
    
    /**
     * Initialize footer interactions
     */
    initFooterInteractions() {
        // Add hover effects for footer links
        const footerLinks = document.querySelectorAll('.footer a');
        
        footerLinks.forEach(link => {
            // Add transition class for smooth hover
            link.classList.add('transition');
            
            // Add aria-label for social links if missing
            if (link.classList.contains('social-link') && !link.getAttribute('aria-label')) {
                // Try to guess the platform from the icon
                const icon = link.querySelector('i');
                if (icon) {
                    const iconClass = Array.from(icon.classList).find(cls => cls.startsWith('fa-'));
                    if (iconClass) {
                        const platform = iconClass.replace('fa-', '').replace(/-/g, ' ');
                        link.setAttribute('aria-label', `${platform} profile`);
                    }
                }
            }
        });
    },
    
    /**
     * Create fallback footer in case loading fails
     * @returns {string} - Fallback footer HTML
     */
    createFallbackFooter() {
        const currentYear = new Date().getFullYear();
        
        return `
            <div class="container">
                <div class="footer-inner">
                    <div class="footer-content text-center">
                        <div class="social-links">
                            <a href="https://linkedin.com/in/satyapratheek-tata" target="_blank" rel="noopener" class="social-link" aria-label="LinkedIn Profile">
                                <i class="fab fa-linkedin-in"></i>
                            </a>
                            <a href="https://github.com/TataSatyaPratheek" target="_blank" rel="noopener" class="social-link" aria-label="GitHub Profile">
                                <i class="fab fa-github"></i>
                            </a>
                            <a href="mailto:satyapratheek.tata@edhec.com" class="social-link" aria-label="Email">
                                <i class="fas fa-envelope"></i>
                            </a>
                        </div>
                        <p class="copyright">
                            &copy; ${currentYear} Satya Pratheek TATA. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
};

// Initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    Footer.init();
});

// Expose to global scope
window.Footer = Footer;