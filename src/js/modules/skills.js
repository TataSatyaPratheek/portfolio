/**
 * skills.js - Module for handling skills data and rendering
 * Manages fetching skills data and rendering skill items.
 */

// Skills Module
const SkillsModule = {
    // Cache for skills data
    skillsData: null,
    
    // Configuration
    config: {
        dataUrl: 'data/skills.json',
        cacheTTL: 3600 // Cache time-to-live in seconds (1 hour)
    },
    
    /**
     * Initialize the skills module
     */
    init() {
        // Load all skills
        this.loadSkills();
    },
    
    /**
     * Fetch skills data from JSON file
     * @returns {Promise<Array>} - Promise that resolves with skills data
     */
    async fetchSkills() {
        // Return cached data if available
        if (this.skillsData !== null) {
            return this.skillsData;
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
                this.skillsData = data;
                return data;
            } else {
                const response = await fetch(this.config.dataUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                this.skillsData = data;
                return data;
            }
        } catch (error) {
            console.error('Error fetching skills data:', error);
            throw error;
        }
    },
    
    /**
     * Load all skills into the skills container
     */
    async loadSkills() {
        const container = document.getElementById('skills-container');
        if (!container) return;
        
        try {
            // Show skeleton loading state
            this.showSkillsLoading();
            
            // Fetch skills data
            const skillsCategories = await this.fetchSkills();
            
            // Clear container
            container.innerHTML = '';
            
            if (skillsCategories.length === 0) {
                container.innerHTML = '<div class="col-12 text-center"><p>No skills found.</p></div>';
                return;
            }
            
            // Render skills by category
            skillsCategories.forEach((category, categoryIndex) => {
                const categoryElement = this.createCategorySection(category, categoryIndex);
                container.appendChild(categoryElement);
            });
            
            // Initialize skill interactions
            this.initSkillInteractions();
        } catch (error) {
            this.showSkillsError('Failed to load skills. Please try again later.');
        }
    },
    
    /**
     * Create a category section element
     * @param {Object} category - Category data with name and skills array
     * @param {number} categoryIndex - Category index for animation delay
     * @returns {HTMLElement} - Category section element
     */
    createCategorySection(category, categoryIndex) {
        // Create category container
        const categoryElement = document.createElement('div');
        categoryElement.className = 'skills-category mb-5';
        categoryElement.setAttribute('data-aos', 'fade-up');
        categoryElement.setAttribute('data-aos-delay', categoryIndex * 100);
        
        // Create category title
        const titleElement = document.createElement('h3');
        titleElement.className = 'category-title mb-4';
        titleElement.textContent = category.category;
        
        // Create row for skills
        const rowElement = document.createElement('div');
        rowElement.className = 'row';
        rowElement.id = `category-${category.category.toLowerCase().replace(/\s+/g, '-')}`;
        
        // Add skills to row
        category.skills.forEach((skill, skillIndex) => {
            const skillElement = this.createSkillItem(skill, skillIndex);
            rowElement.appendChild(skillElement);
        });
        
        // Assemble category section
        categoryElement.appendChild(titleElement);
        categoryElement.appendChild(rowElement);
        
        return categoryElement;
    },
    
    /**
     * Create a skill item element
     * @param {Object} skill - Skill data
     * @param {number} index - Skill index for animation delay
     * @returns {HTMLElement} - Skill item element
     */
    createSkillItem(skill, index) {
        // Create column element
        const colElement = document.createElement('div');
        colElement.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
        colElement.setAttribute('data-aos', 'fade-up');
        colElement.setAttribute('data-aos-delay', (index % 4) * 100);
        
        // Create HTML for projects that use this skill
        let projectsHTML = '';
        if (skill.projects && skill.projects.length > 0) {
            const projectLinks = skill.projects.map(project => 
                `<a href="pages/projects.html#${project.toLowerCase().replace(/\s+/g, '-')}" class="skill-project-link">${project}</a>`
            ).join('');
            
            projectsHTML = `
                <div class="skill-projects mt-2">
                    <small>Used in:</small>
                    <div class="skill-projects-list">
                        ${projectLinks}
                    </div>
                </div>
            `;
        }
        
        // Create skill item HTML
        colElement.innerHTML = `
            <div class="skill-item text-center">
                <div class="skill-icon">
                    <img src="${skill.icon}" alt="${skill.name}" class="img-fluid">
                </div>
                <h4 class="skill-name mt-3">${skill.name}</h4>
                ${skill.level ? `<span class="skill-level badge badge-primary">${skill.level}</span>` : ''}
                ${skill.description ? `<p class="skill-description mt-2">${skill.description}</p>` : ''}
                ${projectsHTML}
            </div>
        `;
        
        return colElement;
    },
    
    /**
     * Initialize skill interactions (hover effects, etc.)
     */
    initSkillInteractions() {
        // Add hover effects for skill items
        const skillItems = document.querySelectorAll('.skill-item');
        
        skillItems.forEach(item => {
            // Add hover class when mouse enters
            item.addEventListener('mouseenter', () => {
                item.classList.add('hovered');
            });
            
            // Remove hover class when mouse leaves
            item.addEventListener('mouseleave', () => {
                item.classList.remove('hovered');
            });
            
            // Add focus handling for keyboard navigation
            item.addEventListener('focusin', () => {
                item.classList.add('focused');
            });
            
            item.addEventListener('focusout', () => {
                item.classList.remove('focused');
            });
        });
    },
    
    // Loading and error states
    
    /**
     * Show loading state for skills list
     */
    showSkillsLoading() {
        // Use skeleton loaders if available
        if (window.Loader) {
            // Find all category skeleton containers
            const categoryContainers = document.querySelectorAll('[id^="skeleton-category-"]');
            
            categoryContainers.forEach(container => {
                // Create 4 skill skeletons per category
                container.innerHTML = '';
                
                for (let i = 0; i < 4; i++) {
                    const skillSkeleton = document.createElement('div');
                    skillSkeleton.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
                    skillSkeleton.innerHTML = `
                        <div class="card-skeleton">
                            <div class="skeleton-body text-center">
                                <div class="skeleton-image mx-auto" style="width: 60px; height: 60px; border-radius: 50%;"></div>
                                <div class="skeleton-title mt-3 mx-auto" style="width: 70%;"></div>
                                <div class="skeleton-badge mt-2 mx-auto" style="width: 40%;"></div>
                                <div class="skeleton-text mt-3 mx-auto" style="width: 90%;"></div>
                            </div>
                        </div>
                    `;
                    container.appendChild(skillSkeleton);
                }
            });
        }
    },
    
    /**
     * Show error message for skills list
     * @param {string} message - Error message to display
     */
    showSkillsError(message) {
        const container = document.getElementById('skills-container');
        if (!container) return;
        
        // Use Utils.showError if available
        if (window.Utils && typeof window.Utils.showError === 'function') {
            window.Utils.showError(container, message, true, () => this.loadSkills());
        } else {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger" role="alert">
                        <p>${message}</p>
                        <button class="btn btn-primary mt-3" onclick="SkillsModule.loadSkills()">Try Again</button>
                    </div>
                </div>
            `;
        }
    }
};

// Expose to global scope
window.SkillsModule = SkillsModule;