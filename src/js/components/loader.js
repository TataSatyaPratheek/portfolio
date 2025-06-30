/**
 * loader.js - Component for managing loading skeletons and states
 * Provides methods for displaying and removing loading states across the site.
 */

// Loader Component
const Loader = {
    /**
     * Initialize the loader component
     */
    init() {
        // Load skeletons into containers
        this.loadInitialSkeletons();
    },
    
    /**
     * Load initial skeletons into predefined containers
     */
    loadInitialSkeletons() {
        // Find all skeleton containers with ID starting with "skeleton-"
        const skeletonContainers = document.querySelectorAll('[id^="skeleton-"]');
        
        skeletonContainers.forEach(container => {
            // Determine the skeleton type based on ID
            let type = 'card';
            
            if (container.id.includes('project')) {
                type = 'card';
            } else if (container.id.includes('blog')) {
                type = 'card';
            } else if (container.id.includes('experience')) {
                type = 'list';
            } else if (container.id.includes('detail')) {
                type = 'detail';
            }
            
            // Load the appropriate skeleton
            this.showSkeleton(container, type);
        });
    },
    
    /**
     * Show a skeleton loader in a container
     * @param {HTMLElement|string} container - Container element or ID
     * @param {string} type - Skeleton type ('card', 'list', 'detail')
     * @returns {Promise<void>} - Promise that resolves when skeleton is loaded
     */
    async showSkeleton(container, type = 'card') {
        // Get container element if string ID was provided
        if (typeof container === 'string') {
            container = document.getElementById(container);
        }
        
        if (!container) {
            console.error('Container not found');
            return;
        }
        
        try {
            // First try to load the skeleton HTML from file
            const skeletonHTML = await this.loadSkeletonHTML(type);
            container.innerHTML = skeletonHTML;
        } catch (error) {
            console.error(`Failed to load ${type} skeleton:`, error);
            
            // If loading fails, create a basic skeleton
            container.innerHTML = this.createBasicSkeleton(type);
        }
    },
    
    /**
     * Load skeleton HTML from file
     * @param {string} type - Skeleton type
     * @returns {Promise<string>} - Promise that resolves with skeleton HTML
     */
    async loadSkeletonHTML(type) {
        const response = await fetch(`components/loaders/${type}-skeleton.html`);
        if (!response.ok) {
            throw new Error(`Failed to load ${type} skeleton`);
        }
        return await response.text();
    },
    
    /**
     * Create a basic skeleton loader if loading from file fails
     * @param {string} type - Skeleton type
     * @returns {string} - Basic skeleton HTML
     */
    createBasicSkeleton(type) {
        switch (type) {
            case 'card':
                return `
                    <div class="card-skeleton.html" aria-hidden="true">
                        <div class="skeleton-image"></div>
                        <div class="skeleton-body">
                            <div class="skeleton-title"></div>
                            <div class="skeleton-text"></div>
                            <div class="skeleton-text"></div>
                            <div class="skeleton-button"></div>
                        </div>
                    </div>
                `;
                
            case 'list':
                return `
                    <div class="list-skeleton.html" aria-hidden="true">
                        <div class="skeleton-item">
                            <div class="skeleton-item-icon"></div>
                            <div class="skeleton-item-content">
                                <div class="skeleton-item-title"></div>
                                <div class="skeleton-item-text"></div>
                            </div>
                        </div>
                        <div class="skeleton-item">
                            <div class="skeleton-item-icon"></div>
                            <div class="skeleton-item-content">
                                <div class="skeleton-item-title"></div>
                                <div class="skeleton-item-text"></div>
                            </div>
                        </div>
                    </div>
                `;
                
            case 'detail':
                return `
                    <div class="detail-skeleton.html" aria-hidden="true">
                        <div class="skeleton-header">
                            <div class="skeleton-title"></div>
                            <div class="skeleton-meta">
                                <div class="skeleton-meta-item"></div>
                                <div class="skeleton-meta-item"></div>
                            </div>
                        </div>
                        <div class="skeleton-image"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-paragraph"></div>
                            <div class="skeleton-paragraph"></div>
                            <div class="skeleton-paragraph"></div>
                        </div>
                    </div>
                `;
                
            default:
                return `<div class="skeleton-fallback"></div>`;
        }
    },
    
    /**
     * Show loader spinner in a container
     * @param {HTMLElement|string} container - Container element or ID
     * @param {string} size - Spinner size ('sm', 'md', 'lg')
     * @param {string} text - Optional loading text
     */
    showSpinner(container, size = 'md', text = 'Loading...') {
        // Get container element if string ID was provided
        if (typeof container === 'string') {
            container = document.getElementById(container);
        }
        
        if (!container) {
            console.error('Container not found');
            return;
        }
        
        // Create spinner HTML
        const spinnerClass = size === 'sm' ? 'spinner spinner-sm' : (size === 'lg' ? 'spinner spinner-lg' : 'spinner');
        const spinnerHTML = `
            <div class="loader-container text-center" aria-busy="true" aria-live="polite">
                <div class="${spinnerClass}"></div>
                ${text ? `<p class="loader-text mt-2">${text}</p>` : ''}
            </div>
        `;
        
        container.innerHTML = spinnerHTML;
    },
    
    /**
     * Hide loader and show content
     * @param {HTMLElement|string} loaderContainer - Loader container element or ID
     * @param {HTMLElement|string} contentContainer - Content container element or ID
     * @param {string|HTMLElement} content - Content to show
     */
    hideLoader(loaderContainer, contentContainer, content) {
        // Get container elements if string IDs were provided
        if (typeof loaderContainer === 'string') {
            loaderContainer = document.getElementById(loaderContainer);
        }
        
        if (typeof contentContainer === 'string') {
            contentContainer = document.getElementById(contentContainer);
        }
        
        if (!loaderContainer || !contentContainer) {
            console.error('Container not found');
            return;
        }
        
        // Hide loader with fade-out
        loaderContainer.style.opacity = '0';
        
        // Add content to content container
        if (typeof content === 'string') {
            contentContainer.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            contentContainer.innerHTML = '';
            contentContainer.appendChild(content);
        }
        
        // Show content with fade-in
        contentContainer.classList.remove('d-none');
        setTimeout(() => {
            contentContainer.style.opacity = '1';
            
            // Hide loader completely after animation
            setTimeout(() => {
                loaderContainer.classList.add('d-none');
            }, 300);
        }, 300);
    },
    
    /**
     * Show error message if loading fails
     * @param {HTMLElement|string} container - Container element or ID
     * @param {string} message - Error message
     * @param {Function} retryCallback - Function to call when retry button is clicked
     */
    showError(container, message, retryCallback = null) {
        // Use the utility function if available, or fall back to basic error
        if (window.Utils && typeof window.Utils.showError === 'function') {
            window.Utils.showError(
                typeof container === 'string' ? document.getElementById(container) : container, 
                message, 
                !!retryCallback, 
                retryCallback
            );
        } else {
            // Fallback error display if Utils is not available
            if (typeof container === 'string') {
                container = document.getElementById(container);
            }
            
            if (!container) {
                console.error('Container not found');
                return;
            }
            
            const errorHTML = `
                <div class="error-container" role="alert">
                    <div class="error-content">
                        <h2 class="error-title">Unable to Load Content</h2>
                        <p class="error-message">${message}</p>
                        ${retryCallback ? `
                            <button class="btn btn-primary error-retry">
                                <i class="fas fa-sync-alt"></i> Try Again
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
            
            container.innerHTML = errorHTML;
            
            // Add retry event listener if callback provided
            if (retryCallback) {
                const retryButton = container.querySelector('.error-retry');
                if (retryButton) {
                    retryButton.addEventListener('click', retryCallback);
                }
            }
        }
    }
};

// Initialize loader when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    Loader.init();
});

// Expose to global scope
window.Loader = Loader;