/**
 * experience.js - Module for handling experience data and rendering
 * Manages fetching experience data and rendering experience timeline.
 */

// Experience Module
const ExperienceModule = {
    // Cache for experience data
    experienceData: null,
    
    // Configuration
    config: {
        dataUrl: 'data/experience.json',
        cacheTTL: 3600 // Cache time-to-live in seconds (1 hour)
    },
    
    /**
     * Initialize the experience module
     */
    init() {
        // Load all experience items
        this.loadExperience();
    },
    
    /**
     * Fetch experience data from JSON file
     * @returns {Promise<Array>} - Promise that resolves with experience data
     */
    async fetchExperience() {
        // Return cached data if available
        if (this.experienceData !== null) {
            return this.experienceData;
        }
        
        try {
            // Use utils.fetchData if available, otherwise use fetch directly
            if (window.Utils && typeof window.Utils.fetchData === 'function') {
                const data = await window.Utils.fetchData(
                    this.config.dataUrl, 
                    {}, 
                    true, 
                    this.config.cacheTTL
                );
                this.experienceData = data;
                return data;
            } else {
                const response = await fetch(this.config.dataUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                this.experienceData = data;
                return data;
            }
        } catch (error) {
            console.error('Error fetching experience data:', error);
            throw error;
        }
    },
    
    /**
     * Load all experience items into the experience container
     */
    async loadExperience() {
        const container = document.getElementById('experience-container');
        if (!container) return;
        
        try {
            // Show skeleton loading state
            this.showExperienceLoading();
            
            // Fetch experience data
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
            
            // Sort experiences by date (newest first) if date is available
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
            this.showExperienceError('Failed to load experience data. Please try again later.');
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