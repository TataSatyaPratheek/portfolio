/**
 * theme.js - Theme management for portfolio website
 * Handles dark/light theme switching with local storage persistence
 * and system preference detection.
 */

// Theme Manager class
class ThemeManager {
    /**
     * Initialize the theme manager
     * @param {string} storageKey - Local storage key for theme preference (default: 'theme-preference')
     * @param {string} darkThemeClass - CSS class for dark theme (default: 'dark-theme')
     * @param {string} lightThemeClass - CSS class for light theme (default: 'light-theme')
     */
    constructor(storageKey = 'theme-preference', darkThemeClass = 'dark-theme', lightThemeClass = 'light-theme') {
        this.storageKey = storageKey;
        this.darkThemeClass = darkThemeClass;
        this.lightThemeClass = lightThemeClass;
        this.toggleButton = null;
        this.toggleIcon = null;
        
        // Initialize the theme
        this.init();
    }
    
    /**
     * Initialize the theme manager
     */
    init() {
        // Set initial theme (local storage preference, system preference, or default to dark)
        this.setInitialTheme();
        
        // Add listener for system preference changes
        this.addSystemPreferenceListener();
        
        // Initialize the theme toggle button once DOM is fully loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeToggleButton();
            
            // Remove preload class after a short delay to enable transitions
            setTimeout(() => {
                document.body.classList.remove('preload');
            }, 300);
        });
    }
    
    /**
     * Set the initial theme based on preferences
     */
    setInitialTheme() {
        let theme;
        
        // Check for stored preference
        const storedTheme = localStorage.getItem(this.storageKey);
        
        if (storedTheme) {
            // Use stored preference
            theme = storedTheme;
        } else {
            // Check system preference
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            theme = prefersDark ? this.darkThemeClass : this.lightThemeClass;
        }
        
        // Apply theme
        this.applyTheme(theme);
    }
    
    /**
     * Apply theme to document body
     * @param {string} theme - Theme class to apply
     */
    applyTheme(theme) {
        // First, remove both theme classes
        document.body.classList.remove(this.darkThemeClass, this.lightThemeClass);
        
        // Then add the selected theme class
        document.body.classList.add(theme);
        
        // Store preference
        localStorage.setItem(this.storageKey, theme);
        
        // Update toggle button icon
        this.updateToggleIcon();
        
        // Dispatch theme change event
        this.dispatchThemeChangeEvent(theme);
    }
    
    /**
     * Toggle between dark and light themes
     */
    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === this.darkThemeClass ? this.lightThemeClass : this.darkThemeClass;
        
        this.applyTheme(newTheme);
    }
    
    /**
     * Get current theme
     * @returns {string} - Current theme class
     */
    getCurrentTheme() {
        return document.body.classList.contains(this.darkThemeClass) ? this.darkThemeClass : this.lightThemeClass;
    }
    
    /**
     * Check if dark theme is active
     * @returns {boolean} - Whether dark theme is active
     */
    isDarkTheme() {
        return this.getCurrentTheme() === this.darkThemeClass;
    }
    
    /**
     * Update toggle button icon based on current theme
     */
    updateToggleIcon() {
        if (!this.toggleIcon) return;
        
        // Update icon and tooltip
        if (this.isDarkTheme()) {
            this.toggleIcon.className = 'fas fa-moon';
            if (this.toggleButton) {
                this.toggleButton.setAttribute('data-tooltip', 'Switch to Light Theme');
            }
        } else {
            this.toggleIcon.className = 'fas fa-sun';
            if (this.toggleButton) {
                this.toggleButton.setAttribute('data-tooltip', 'Switch to Dark Theme');
            }
        }
    }
    
    /**
     * Initialize theme toggle button
     */
    initializeToggleButton() {
        this.toggleButton = document.getElementById('theme-toggle');
        this.toggleIcon = document.getElementById('theme-icon');
        
        if (!this.toggleButton || !this.toggleIcon) return;
        
        // Add click event listener
        this.toggleButton.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Add keyboard accessibility
        this.toggleButton.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.toggleTheme();
            }
        });
        
        // Update toggle icon based on current theme
        this.updateToggleIcon();
    }
    
    /**
     * Add listener for system preference changes
     */
    addSystemPreferenceListener() {
        if (!window.matchMedia) return;
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', (e) => {
                // Only update if user hasn't set a preference
                if (!localStorage.getItem(this.storageKey)) {
                    this.applyTheme(e.matches ? this.darkThemeClass : this.lightThemeClass);
                }
            });
        } 
        // Older browsers (Safari)
        else if (mediaQuery.addListener) {
            mediaQuery.addListener((e) => {
                // Only update if user hasn't set a preference
                if (!localStorage.getItem(this.storageKey)) {
                    this.applyTheme(e.matches ? this.darkThemeClass : this.lightThemeClass);
                }
            });
        }
    }
    
    /**
     * Dispatch theme change event
     * @param {string} theme - The new theme
     */
    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themechange', {
            detail: {
                theme,
                isDark: theme === this.darkThemeClass,
                isLight: theme === this.lightThemeClass
            },
            bubbles: true
        });
        
        document.dispatchEvent(event);
    }
}

// Initialize theme manager and expose to global scope
window.ThemeManager = new ThemeManager();