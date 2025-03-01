/**
 * utils.js - Core utility functions for the portfolio website
 * Contains functions for data fetching, error handling, and DOM manipulation.
 */

// Create a namespace for utility functions
const Utils = {
    /**
     * Fetch data with standardized error handling and caching integration
     * @param {string} url - URL to fetch data from
     * @param {Object} options - Fetch options
     * @param {boolean} useCache - Whether to use cache (default: true)
     * @param {number} cacheTTL - Cache time to live in seconds (default: 3600 = 1 hour)
     * @returns {Promise<any>} - Promise that resolves with the fetched data
     */
    async fetchData(url, options = {}, useCache = true, cacheTTL = 3600) {
        try {
            // Check if data is in cache and not expired
            if (useCache && window.CacheManager) {
                const cachedData = window.CacheManager.get(url);
                if (cachedData) {
                    return cachedData;
                }
            }
            
            // Fetch data
            const response = await fetch(url, options);
            
            // Check for HTTP errors
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // Parse JSON
            const data = await response.json();
            
            // Store in cache if caching is enabled
            if (useCache && window.CacheManager) {
                window.CacheManager.set(url, data, cacheTTL);
            }
            
            return data;
        } catch (error) {
            // Log error and rethrow
            console.error(`Error fetching data from ${url}:`, error);
            throw error;
        }
    },

    /**
     * Show error message in a container
     * @param {HTMLElement} container - Container element to show error in
     * @param {string} message - Error message to display
     * @param {boolean} retry - Whether to show retry button (default: true)
     * @param {Function} retryCallback - Function to call when retry button is clicked
     */
    showError(container, message, retry = true, retryCallback = null) {
        // Load error component
        this.loadComponent('components/error-message.html')
            .then(errorHTML => {
                // Insert error component
                container.innerHTML = errorHTML;
                
                // Update error message
                const errorMessage = container.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.textContent = message;
                }
                
                // Handle retry button
                const retryButton = container.querySelector('.error-retry');
                if (retryButton) {
                    if (retry && retryCallback) {
                        retryButton.addEventListener('click', retryCallback);
                    } else {
                        retryButton.style.display = 'none';
                    }
                }
            })
            .catch(error => {
                // Fallback error message if component fails to load
                console.error('Failed to load error component:', error);
                container.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <p>${message}</p>
                    </div>
                `;
            });
    },

    /**
     * Load HTML component from a file
     * @param {string} url - URL of the component
     * @returns {Promise<string>} - Promise that resolves with the component HTML
     */
    async loadComponent(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load component from ${url}`);
            }
            return await response.text();
        } catch (error) {
            console.error(`Error loading component from ${url}:`, error);
            throw error;
        }
    },

    /**
     * Insert a skeleton loader into a container
     * @param {HTMLElement} container - Container element to insert skeleton into
     * @param {string} type - Type of skeleton ('card', 'list', 'detail')
     */
    async insertSkeleton(container, type = 'card') {
        try {
            const skeletonHTML = await this.loadComponent(`components/loaders/${type}-skeleton.html`);
            container.innerHTML = skeletonHTML;
        } catch (error) {
            console.error(`Failed to load ${type} skeleton:`, error);
            // Simple fallback skeleton
            container.innerHTML = '<div class="skeleton-fallback"></div>';
        }
    },

    /**
     * Get URL parameters
     * @returns {Object} - Object containing URL parameters
     */
    getUrlParams() {
        const params = {};
        const queryString = window.location.search.substring(1);
        const urlParams = new URLSearchParams(queryString);
        
        for (const [key, value] of urlParams.entries()) {
            params[key] = value;
        }
        
        // Also parse hash
        if (window.location.hash) {
            params.hash = window.location.hash.substring(1);
        }
        
        return params;
    },

    /**
     * Format date string
     * @param {string} dateString - Date string to format
     * @param {Object} options - Formatting options for toLocaleDateString
     * @returns {string} - Formatted date string
     */
    formatDate(dateString, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', options);
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString; // Return original string on error
        }
    },

    /**
     * Create HTML element with attributes and content
     * @param {string} tag - Element tag name
     * @param {Object} attributes - Element attributes
     * @param {string|HTMLElement|Array} content - Element content
     * @returns {HTMLElement} - Created element
     */
    createElement(tag, attributes = {}, content = null) {
        const element = document.createElement(tag);
        
        // Set attributes
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                for (const [dataKey, dataValue] of Object.entries(value)) {
                    element.dataset[dataKey] = dataValue;
                }
            } else {
                element.setAttribute(key, value);
            }
        }
        
        // Set content
        if (content !== null) {
            if (Array.isArray(content)) {
                content.forEach(item => {
                    if (typeof item === 'string') {
                        element.appendChild(document.createTextNode(item));
                    } else if (item instanceof HTMLElement) {
                        element.appendChild(item);
                    }
                });
            } else if (typeof content === 'string') {
                element.textContent = content;
            } else if (content instanceof HTMLElement) {
                element.appendChild(content);
            }
        }
        
        return element;
    },

    /**
     * Truncate text to a specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @param {string} suffix - Suffix to add (default: '...')
     * @returns {string} - Truncated text
     */
    truncateText(text, maxLength, suffix = '...') {
        if (!text || text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + suffix;
    },

    /**
     * Debounce function to limit how often a function can be called
     * @param {Function} func - Function to debounce
     * @param {number} wait - Debounce wait time in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Add event listener with automatic removal when element is destroyed
     * @param {HTMLElement} element - Element to add listener to
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     * @param {Object} options - Event listener options
     */
    safeEventListener(element, event, callback, options = {}) {
        if (!element) return;
        
        element.addEventListener(event, callback, options);
        
        // Create mutation observer to detect when element is removed from DOM
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.removedNodes.forEach(removedNode => {
                    if (removedNode === element || removedNode.contains(element)) {
                        element.removeEventListener(event, callback, options);
                        observer.disconnect();
                    }
                });
            });
        });
        
        // Start observing
        observer.observe(document.body, { childList: true, subtree: true });
    }
};

// Expose to global scope
window.Utils = Utils;