/**
 * experience.js - Enhanced Module for Experience Data Handling
 * Includes improved error logging and data validation
 */

const ExperienceModule = {
    // Configuration with improved error handling
    config: {
        dataUrl: 'data/experience.json',
        requiredFields: ['id', 'company', 'role', 'startDate', 'duration'],
        cacheTTL: 3600 // 1 hour cache
    },

    // Cache for experience data
    experienceData: null,

    /**
     * Validate experience data against required fields
     * @param {Array} experiences - Experience entries to validate
     * @returns {Array} - Validated experience entries
     */
    validateExperiences(experiences) {
        return experiences.filter(experience => {
            // Check all required fields are present
            const isValid = this.config.requiredFields.every(field => {
                if (!experience[field]) {
                    console.warn(`Experience entry missing required field: ${field}`, experience);
                    return false;
                }
                return true;
            });

            // Additional validation for responsibilities and achievements
            if (experience.responsibilities && !Array.isArray(experience.responsibilities)) {
                console.warn('Responsibilities must be an array', experience);
                return false;
            }
            if (experience.achievements && !Array.isArray(experience.achievements)) {
                console.warn('Achievements must be an array', experience);
                return false;
            }

            // Validate date format
            try {
                if (experience.startDate) {
                    new Date(experience.startDate);
                }
                if (experience.endDate) {
                    new Date(experience.endDate);
                }
            } catch (dateError) {
                console.warn('Invalid date format', experience);
                return false;
            }

            return isValid;
        });
    },

    /**
     * Enhanced experience data fetching with validation
     * @returns {Promise<Array>} - Validated experience data
     */
    async fetchExperience() {
        // Return cached data if available
        if (this.experienceData !== null) {
            return this.experienceData;
        }

        try {
            // Determine fetch method
            const fetchMethod = window.Utils && typeof window.Utils.fetchData === 'function'
                ? window.Utils.fetchData
                : fetch;
            const options = fetchMethod === fetch
                ? {}
                : { useCache: true, cacheTTL: this.config.cacheTTL };

            // Fetch data
            const response = await fetchMethod(this.config.dataUrl, options);

            // Handle different fetch response types
            const rawData = response.data || response;

            // Validate experiences
            const validExperiences = this.validateExperiences(rawData);

            // Cache validated data
            this.experienceData = validExperiences;

            // Log warning if no valid experiences found
            if (validExperiences.length === 0) {
                console.warn('No valid experience entries found in the data source.');
            }

            return validExperiences;
        } catch (error) {
            console.error('Error fetching experience data:', error);

            // Provide a meaningful error message
            const errorMessage = this.getErrorMessage(error);

            // Trigger error handling
            this.handleFetchError(errorMessage);

            throw error;
        }
    },

    /**
     * Get user-friendly error message
     * @param {Error} error - Fetch error
     * @returns {string} - Formatted error message
     */
    getErrorMessage(error) {
        if (error.name === 'TypeError') {
            return 'Network error. Please check your internet connection.';
        }
        if (error.name === 'SyntaxError') {
            return 'Invalid data format. The experience data might be corrupted.';
        }
        return error.message || 'Failed to load experience entries. Please try again later.';
    },

    /**
     * Handle fetch errors with user-friendly feedback
     * @param {string} message - Error message
     */
    handleFetchError(message) {
        // Show error in the experience container
        const container = document.getElementById('experience-container');
        if (container) {
            // Use Utils.showError if available
            if (window.Utils && typeof window.Utils.showError === 'function') {
                window.Utils.showError(
                    container,
                    message,
                    true,  // Show retry button
                    () => this.loadExperience()  // Retry callback
                );
            } else {
                // Fallback error display
                container.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-danger" role="alert">
                            <p>${message}</p>
                            <button class="btn btn-primary mt-3" onclick="ExperienceModule.loadExperience()">Try Again</button>
                        </div>
                    </div>
                `;
            }
        }
    },

    /**
     * Initialize the experience module
     */
    init() {
        // Load all experience items
        this.loadExperience();
    },

    /**
     * Load experience entries with enhanced error handling
     */
    async loadExperience() {
        const container = document.getElementById('experience-container');
        if (!container) return;

        try {
            // Show loading state
            this.showExperienceLoading();

            // Fetch and validate experience entries
            const experiences = await this.fetchExperience();

            // Clear container
            container.innerHTML = '';

            if (experiences.length === 0) {
                container.innerHTML = '<div class="text-center"><p>No experience entries found.</p></div>';
                return;
            }

            // Create timeline container
            const timelineElement = document.createElement('div');
            timelineElement.className = 'experience-timeline';
            container.appendChild(timelineElement);

            // Sort experiences by date (newest first)
            const sortedExperiences = [...experiences].sort((a, b) => {
                if (a.startDate && b.startDate) {
                    return new Date(b.startDate) - new Date(a.startDate);
                }
                return 0;
            });

            // Render experience items
            sortedExperiences.forEach((experience, index) => {
                const experienceItem = this.createExperienceItem(experience, index);
                timelineElement.appendChild(experienceItem);
            });

            // Initialize intersection observer for animation
            this.initTimelineAnimation();
        } catch (error) {
            // Error handling is done in fetchExperience method
            console.error('Experience loading failed:', error);
        }
    },

    /**
     * Create an experience item element for the timeline
     * @param {Object} experience - Experience data
     * @param {number} index - Experience index for alternating sides
     * @returns {HTMLElement} - Experience item element
     */
    createExperienceItem(experience, index) {
        // Create timeline item
        const itemElement = document.createElement('div');
        itemElement.className = `timeline-item ${index % 2 === 0 ? 'left' : 'right'}`;
        itemElement.setAttribute('data-aos', index % 2 === 0 ? 'fade-right' : 'fade-left');
        itemElement.setAttribute('data-aos-delay', (index % 4) * 100);

        // Create responsibilities list
        let responsibilitiesHTML = '';
        if (experience.responsibilities && experience.responsibilities.length > 0) {
            const listItems = experience.responsibilities.map(responsibility =>
                `<li>${responsibility}</li>`
            ).join('');

            responsibilitiesHTML = `
                <div class="responsibilities mt-3">
                    <h4 class="h6">Responsibilities:</h4>
                    <ul>
                        ${listItems}
                    </ul>
                </div>
            `;
        }

        // Create achievements list
        let achievementsHTML = '';
        if (experience.achievements && experience.achievements.length > 0) {
            const listItems = experience.achievements.map(achievement =>
                `<li>${achievement}</li>`
            ).join('');

            achievementsHTML = `
                <div class="achievements mt-3">
                    <h4 class="h6">Achievements:</h4>
                    <ul>
                        ${listItems}
                    </ul>
                </div>
            `;
        }

        // Create skills badges
        let skillsHTML = '';
        if (experience.skills && experience.skills.length > 0) {
            const badges = experience.skills.map(skill =>
                `<span class="badge badge-primary mr-2 mb-2">${skill}</span>`
            ).join('');

            skillsHTML = `
                <div class="skills mt-3">
                    <h4 class="h6">Skills Used:</h4>
                    <div class="skills-badges">
                        ${badges}
                    </div>
                </div>
            `;
        }

        // Create publications list
        let publicationsHTML = '';
        if (experience.publications && experience.publications.length > 0) {
            const listItems = experience.publications.map(publication =>
                `<li>
                    <strong>${publication.title}</strong>
                    ${publication.venue ? ` - ${publication.venue}` : ''}
                    ${publication.year ? ` (${publication.year})` : ''}
                </li>`
            ).join('');

            publicationsHTML = `
                <div class="publications mt-3">
                    <h4 class="h6">Publications:</h4>
                    <ul>
                        ${listItems}
                    </ul>
                </div>
            `;
        }

        // Create testimonial
        let testimonialHTML = '';
        if (experience.testimonial && experience.testimonial.text) {
            testimonialHTML = `
                <div class="testimonial mt-4">
                    <blockquote class="testimonial-text">
                        "${experience.testimonial.text}"
                        ${experience.testimonial.author ? `<footer class="testimonial-author">— ${experience.testimonial.author}${experience.testimonial.position ? `, <cite>${experience.testimonial.position}</cite>` : ''}</footer>` : ''}
                    </blockquote>
                </div>
            `;
        }

        // Create experience HTML
        itemElement.innerHTML = `
            <div class="timeline-content shadow-sm">
                <div class="timeline-date">${experience.duration}</div>
                <h3 class="timeline-title">${experience.role}</h3>
                <h4 class="timeline-company">
                    ${experience.companyUrl ? `<a href="${experience.companyUrl}" target="_blank" rel="noopener">${experience.company}</a>` : experience.company}
                    ${experience.location ? `<span class="timeline-location"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${experience.location}</span>` : ''}
                </h4>
                ${experience.description ? `<p class="timeline-description">${experience.description}</p>` : ''}
                ${responsibilitiesHTML}
                ${achievementsHTML}
                ${skillsHTML}
                ${publicationsHTML}
                ${testimonialHTML}
            </div>
        `;

        return itemElement;
    },

    /**
     * Initialize timeline animation with Intersection Observer
     */
    initTimelineAnimation() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        if (timelineItems.length === 0) return;

        // Create intersection observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        });

        // Observe each timeline item
        timelineItems.forEach(item => {
            observer.observe(item);
        });
    },

    // Loading and error states

    /**
     * Show loading state for experience list
     */
    showExperienceLoading() {
        const container = document.getElementById('experience-container');
        if (!container) return;

        const skeletonContainer = document.getElementById('experience-skeleton');

        if (skeletonContainer) {
            // Use skeleton loader if available
            if (window.Loader) {
                window.Loader.showSkeleton(skeletonContainer, 'list');
            } else {
                // Fallback loading indicator
                skeletonContainer.innerHTML = `
                    <div class="text-center py-5">
                        <div class="spinner mb-3"></div>
                        <p>Loading experience timeline...</p>
                    </div>
                `;
            }
        } else {
            // Direct container loading
            container.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner mb-3"></div>
                    <p>Loading experience timeline...</p>
                </div>
            `;
        }
    },

    /**
     * Show error message for experience list
     * @param {string} message - Error message to display
     */
    showExperienceError(message) {
        const container = document.getElementById('experience-container');
        if (!container) return;

        // Use Utils.showError if available
        if (window.Utils && typeof window.Utils.showError === 'function') {
            window.Utils.showError(container, message, true, () => this.loadExperience());
        } else {
            container.innerHTML = `
                <div class="text-center">
                    <div class="alert alert-danger" role="alert">
                        <p>${message}</p>
                        <button class="btn btn-primary mt-3" onclick="ExperienceModule.loadExperience()">Try Again</button>
                    </div>
                </div>
            `;
        }
    }
};

// Expose to global scope
window.ExperienceModule = ExperienceModule;