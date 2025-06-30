/**
 * projects.js - Enhanced Module for Projects Data Handling
 * Includes improved error logging and data validation
 */

const ProjectsModule = {
    // Configuration with improved error handling
    config: {
        dataUrl: 'data/projects.json',
        perPage: 6,
        requiredFields: ['id', 'title', 'description', 'skills'],
        cacheTTL: 3600 // 1 hour cache
    },

    // Cache for projects data
    projectsData: null,

    /**
     * Validate project data against required fields
     * @param {Array} projects - Project entries to validate
     * @returns {Array} - Validated project entries
     */
    validateProjects(projects) {
        return projects.filter(project => {
            // Check all required fields are present
            const isValid = this.config.requiredFields.every(field => {
                if (!project[field]) {
                    console.warn(`Project entry missing required field: ${field}`, project);
                    return false;
                }
                return true;
            });

            // Additional validation for content structure
            if (project.content && Array.isArray(project.content)) {
                const contentValid = project.content.every(item =>
                    item.type && ['paragraph', 'heading', 'list', 'image', 'code'].includes(item.type)
                );
                if (!contentValid) {
                    console.warn('Invalid content structure in project entry', project);
                    return false;
                }
            }
            return isValid;
        });
    },

    /**
     * Enhanced projects data fetching with validation
     * @returns {Promise<Array>} - Validated projects data
     */
    async fetchProjects() {
        // Return cached data if available
        if (this.projectsData !== null) {
            return this.projectsData;
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

            // Validate projects
            const validProjects = this.validateProjects(rawData);

            // Cache validated data
            this.projectsData = validProjects;

            // Log warning if no valid projects found
            if (validProjects.length === 0) {
                console.warn('No valid project entries found in the data source.');
            }

            return validProjects;
        } catch (error) {
            console.error('Error fetching projects data:', error);

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
            return 'Invalid data format. The projects data might be corrupted.';
        }
        return error.message || 'Failed to load projects. Please try again later.';
    },

    /**
     * Handle fetch errors with user-friendly feedback
     * @param {string} message - Error message
     */
    handleFetchError(message) {
        // Show error in various containers
        const containers = [
            document.getElementById('projects-container'),
            document.getElementById('featured-projects-container')
        ];
        containers.forEach(container => {
            if (container) {
                // Use Utils.showError if available
                if (window.Utils && typeof window.Utils.showError === 'function') {
                    window.Utils.showError(
                        container,
                        message,
                        true,  // Show retry button
                        () => this.loadAllProjects()  // Retry callback
                    );
                } else {
                    // Fallback error display
                    container.innerHTML = `
                        <div class="col-12">
                            <div class="alert alert-danger" role="alert">
                                <p>${message}</p>
                                <button class="btn btn-primary mt-3" onclick="ProjectsModule.loadAllProjects()">Try Again</button>
                            </div>
                        </div>
                    `;
                }
            }
        });
    },

    /**
     * Initialize the projects module
     */
    init() {
        // Load all projects
        this.loadAllProjects();

        // Initialize filters if present
        this.initFilters();

        // Initialize load more functionality if button exists
        this.initLoadMore();
    },

    /**
     * Initialize project detail page
     */
    initProjectDetail() {
        // Get project ID from URL hash or query parameter
        const urlParams = window.Utils ? window.Utils.getUrlParams() : {};
        const projectId = urlParams.hash || urlParams.id || '';

        if (projectId) {
            // Load project details
            this.loadProjectDetail(projectId);
        } else {
            // Show error message if no project ID
            this.showProjectError('No project specified. Please select a project from the projects page.');
        }
    },

    /**
     * Load all projects into the projects container
     */
    async loadAllProjects() {
        const container = document.getElementById('projects-container');
        if (!container) return;

        try {
            // Show skeleton loading state
            this.showProjectsLoading();

            // Fetch projects data
            const projects = await this.fetchProjects();

            // Clear container
            container.innerHTML = '';

            if (projects.length === 0) {
                container.innerHTML = '<div class="col-12 text-center"><p>No projects found.</p></div>';
                return;
            }

            // Initially display only the first batch of projects
            const initialProjects = projects.slice(0, this.config.perPage);
            this.renderProjects(initialProjects, container);

            // Show or hide load more button based on project count
            this.updateLoadMoreButton(projects.length > this.config.perPage);

            // Store the total count for load more functionality
            container.dataset.totalProjects = projects.length;
            container.dataset.loadedProjects = initialProjects.length;
        } catch (error) {
            this.showProjectsError('Failed to load projects. Please try again later.');
        }
    },

    /**
     * Load featured projects into the featured projects container
     */
    async loadFeaturedProjects() {
        const container = document.getElementById('featured-projects-container');
        if (!container) return;

        try {
            // Show skeleton loading state
            this.showFeaturedProjectsLoading();

            // Fetch projects data
            const projects = await this.fetchProjects();

            // Clear container
            container.innerHTML = '';

            // Filter featured projects
            const featuredProjects = projects.filter(project => project.featured);

            if (featuredProjects.length === 0) {
                container.innerHTML = '<div class="col-12 text-center"><p>No featured projects found.</p></div>';
                return;
            }

            // Render featured projects
            this.renderProjects(featuredProjects, container);
        } catch (error) {
            this.showFeaturedProjectsError('Failed to load featured projects. Please try again later.');
        }
    },

    /**
     * Load project detail by ID
     * @param {string} projectId - Project ID or slug
     */
    async loadProjectDetail(projectId) {
        try {
            // Show skeleton loading state
            this.showProjectDetailLoading();

            // Fetch projects data
            const projects = await this.fetchProjects();

            // Find the project by ID or slug
            const project = projects.find(p =>
                p.id === projectId ||
                p.slug === projectId ||
                p.title.toLowerCase().replace(/\s+/g, '-') === projectId.toLowerCase()
            );

            if (!project) {
                this.showProjectError('Project not found. It may have been moved or deleted.');
                return;
            }

            // Update page title and metadata
            this.updateProjectDetailMetadata(project);

            // Render project detail
            this.renderProjectDetail(project);

            // Load related projects if any
            if (project.related_projects && project.related_projects.length > 0) {
                this.loadRelatedProjects(project.related_projects);
            } else {
                // Hide related projects section if none
                const relatedSection = document.querySelector('.related-projects');
                if (relatedSection) {
                    relatedSection.style.display = 'none';
                }
            }
        } catch (error) {
            this.showProjectError('Failed to load project details. Please try again later.');
        }
    },

    /**
     * Render projects as cards in a container
     * @param {Array} projects - Array of project objects
     * @param {HTMLElement} container - Container to render projects in
     */
    renderProjects(projects, container) {
        projects.forEach((project, index) => {
            const projectCard = this.createProjectCard(project, index);
            container.appendChild(projectCard);
        });
    },

    /**
     * Create a project card element
     * @param {Object} project - Project data
     * @param {number} index - Project index for animation delay
     * @returns {HTMLElement} - Project card element
     */
    createProjectCard(project, index) {
        // Create column element
        const colElement = document.createElement('div');
        colElement.className = 'col-lg-4 col-md-6 mb-4';
        colElement.setAttribute('data-category', project.category || '');
        colElement.setAttribute('data-aos', 'fade-up');
        colElement.setAttribute('data-aos-delay', (index % 3) * 100);

        // Create project URL
        const projectUrl = project.link || `project-detail.html#${project.id || project.slug || project.title.toLowerCase().replace(/\s+/g, '-')}`;

        // Create skill badges HTML
        const skillBadges = project.skills.map(skill =>
            `<span class="badge badge-primary mr-1">${skill}</span>`
        ).join('');

        // Create card HTML
        colElement.innerHTML = `
            <div class="card project-card h-100 shadow-sm">
                <div class="card-img-container">
                    <img src="${project.image}" class="card-img-top" alt="${project.alt || project.title}" loading="lazy">
                    ${project.featured ? '<span class="featured-badge"><i class="fas fa-star" aria-hidden="true"></i> Featured</span>' : ''}
                </div>
                <div class="card-body d-flex flex-column">
                    <h3 class="card-title h5">${project.title}</h3>
                    <p class="card-text flex-grow-1">${this.truncateText(project.shortDescription || project.description, 120)}</p>
                    <div class="skills-container mb-3">
                        ${skillBadges}
                    </div>
                    <a href="${projectUrl}" class="btn btn-primary mt-auto" aria-label="View details of ${project.title}">View Details</a>
                </div>
            </div>
        `;

        return colElement;
    },

    /**
     * Render project detail page
     * @param {Object} project - Project data
     */
    renderProjectDetail(project) {
        // Hide skeleton loader
        const skeleton = document.getElementById('project-detail-skeleton');
        const errorContainer = document.getElementById('project-error');
        const articleContainer = document.querySelector('.project-article');

        if (!skeleton || !errorContainer || !articleContainer) return;

        // Update page title
        document.getElementById('project-title').textContent = project.title;
        document.getElementById('project-breadcrumb-title').textContent = project.title;

        // Update image
        const projectImage = document.getElementById('project-image');
        if (projectImage) {
            projectImage.src = project.image;
            projectImage.alt = project.alt || project.title;
        }

        // Update metadata
        const projectDate = document.getElementById('project-date');
        if (projectDate && project.date) {
            projectDate.textContent = this.formatDate(project.date);
        }

        const projectCategory = document.getElementById('project-category');
        if (projectCategory && project.category) {
            projectCategory.textContent = project.category;
        }

        // Update description
        const projectDescription = document.getElementById('project-description');
        if (projectDescription) {
            projectDescription.textContent = project.description;
        }

        // Update skills
        const projectSkills = document.getElementById('project-skills');
        if (projectSkills) {
            projectSkills.innerHTML = project.skills.map(skill =>
                `<span class="badge badge-primary mr-2 mb-2">${skill}</span>`
            ).join('');
        }

        // Update project details
        const projectDetails = document.getElementById('project-details');
        if (projectDetails && project.content) {
            // Render content based on format (array or string)
            if (Array.isArray(project.content)) {
                projectDetails.innerHTML = this.renderStructuredContent(project.content);
            } else {
                projectDetails.textContent = project.content;
            }
        }

        // Update links
        const githubLink = document.getElementById('github-link');
        const liveLink = document.getElementById('live-demo-link');

        if (githubLink) {
            if (project.github) {
                githubLink.href = project.github;
                githubLink.style.display = 'inline-flex';
            } else {
                githubLink.style.display = 'none';
            }
        }

        if (liveLink) {
            if (project.liveDemo) {
                liveLink.href = project.liveDemo;
                liveLink.style.display = 'inline-flex';
            } else {
                liveLink.style.display = 'none';
            }
        }

        // Update citations
        const citationsContainer = document.getElementById('project-citations');
        if (citationsContainer) {
            if (project.citations && project.citations.length > 0) {
                citationsContainer.innerHTML = '';
                project.citations.forEach(citation => {
                    const li = document.createElement('li');
                    li.textContent = citation;
                    citationsContainer.appendChild(li);
                });
            } else {
                citationsContainer.innerHTML = '<li>No citations available</li>';
            }
        }

        // Hide skeleton and show content
        skeleton.style.display = 'none';
        errorContainer.classList.add('d-none');
        articleContainer.classList.remove('d-none');
    },

    /**
     * Render structured content from content array
     * @param {Array} content - Array of content objects
     * @returns {string} - HTML string
     */
    renderStructuredContent(content) {
        let html = '';

        content.forEach(item => {
            switch (item.type) {
                case 'paragraph':
                    html += `<p>${item.text}</p>`;
                    break;

                case 'heading':
                    const level = item.level || 2;
                    html += `<h${level}>${item.text}</h${level}>`;
                    break;

                case 'list':
                    if (item.items && item.items.length) {
                        html += '<ul>';
                        item.items.forEach(listItem => {
                            html += `<li>${listItem}</li>`;
                        });
                        html += '</ul>';
                    }
                    break;

                case 'image':
                    html += `
                        <figure class="project-figure">
                            <img src="${item.src}" alt="${item.alt || ''}" class="img-fluid">
                            ${item.caption ? `<figcaption>${item.caption}</figcaption>` : ''}
                        </figure>
                    `;
                    break;

                case 'code':
                    html += `
                        <div class="project-code">
                            <pre><code class="language-${item.language || 'javascript'}">${this.escapeHtml(item.code)}</code></pre>
                        </div>
                    `;
                    break;

                default:
                    // For unknown types, just include the text if available
                    if (item.text) {
                        html += `<p>${item.text}</p>`;
                    }
            }
        });

        return html;
    },

    /**
     * Load related projects
     * @param {Array} relatedProjects - Array of related project titles
     */
    async loadRelatedProjects(relatedProjects) {
        const container = document.getElementById('project-related-projects');
        if (!container) return;

        try {
            // Show loading state
            container.innerHTML = '<div class="col-12 text-center"><div class="spinner"></div></div>';

            // Fetch all projects
            const projects = await this.fetchProjects();

            // Filter related projects
            const relatedProjectsData = projects.filter(project =>
                relatedProjects.includes(project.id) ||
                relatedProjects.includes(project.title)
            );

            // Clear container
            container.innerHTML = '';

            if (relatedProjectsData.length === 0) {
                container.innerHTML = '<div class="col-12"><p>No related projects found.</p></div>';
                return;
            }

            // Render related projects
            this.renderProjects(relatedProjectsData, container);
        } catch (error) {
            container.innerHTML = '<div class="col-12"><p>Failed to load related projects.</p></div>';
        }
    },

    /**
     * Update project detail metadata (title, description, etc.)
     * @param {Object} project - Project data
     */
    updateProjectDetailMetadata(project) {
        // Update document title
        document.title = `${project.title} - Project | Portfolio`;

        // Update Open Graph metadata
        const metaTags = {
            'og:title': `${project.title} - Project`,
            'og:description': project.description,
            'og:image': project.image,
            'og:url': window.location.href
        };

        // Update meta tags
        for (const [property, content] of Object.entries(metaTags)) {
            const metaTag = document.querySelector(`meta[property="${property}"]`);
            if (metaTag) {
                metaTag.setAttribute('content', content);
            }
        }
    },

    /**
     * Initialize project filters
     */
    initFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        if (filterButtons.length === 0) return;

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active filter button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Get filter category
                const filterCategory = button.getAttribute('data-filter');

                // Filter projects
                this.filterProjects(filterCategory);
            });
        });
    },

        /**
     * Filter projects by category
     * @param {string} category - Category to filter by (or 'all' for all projects)
     */
        filterProjects(category) {
            const projectCards = document.querySelectorAll('#projects-container > div');
    
            projectCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        },
    
        /**
         * Initialize load more functionality
         */
        initLoadMore() {
            const loadMoreButton = document.getElementById('load-more-projects');
            if (!loadMoreButton) return;
    
            loadMoreButton.addEventListener('click', async () => {
                // Show loading state
                const btnText = loadMoreButton.querySelector('.btn-text');
                const btnLoader = loadMoreButton.querySelector('.btn-loader');
    
                if (btnText && btnLoader) {
                    btnText.style.display = 'none';
                    btnLoader.classList.remove('d-none');
                }
    
                try {
                    await this.loadMoreProjects();
                } catch (error) {
                    console.error('Error loading more projects:', error);
                    // Show error message
                    if (btnText && btnLoader) {
                        btnText.textContent = 'Error Loading Projects';
                        btnText.style.display = 'inline';
                        btnLoader.classList.add('d-none');
                    }
                }
            });
        },
    
        /**
         * Load more projects
         */
        async loadMoreProjects() {
            const container = document.getElementById('projects-container');
            const loadMoreButton = document.getElementById('load-more-projects');
    
            if (!container || !loadMoreButton) return;
    
            // Get current loaded count and total count
            const loadedCount = parseInt(container.dataset.loadedProjects) || 0;
            const totalCount = parseInt(container.dataset.totalProjects) || 0;
    
            // If all projects are loaded, hide button and return
            if (loadedCount >= totalCount) {
                this.updateLoadMoreButton(false);
                return;
            }
    
            try {
                // Fetch all projects
                const projects = await this.fetchProjects();
    
                // Get next batch of projects
                const nextBatch = projects.slice(loadedCount, loadedCount + this.config.perPage);
    
                // Render next batch
                this.renderProjects(nextBatch, container);
    
                // Update loaded count
                const newLoadedCount = loadedCount + nextBatch.length;
                container.dataset.loadedProjects = newLoadedCount;
    
                // Update load more button visibility
                this.updateLoadMoreButton(newLoadedCount < totalCount);
    
                // Reset button state
                const btnText = loadMoreButton.querySelector('.btn-text');
                const btnLoader = loadMoreButton.querySelector('.btn-loader');
    
                if (btnText && btnLoader) {
                    btnText.textContent = 'Load More';
                    btnText.style.display = 'inline';
                    btnLoader.classList.add('d-none');
                }
            } catch (error) {
                throw error;
            }
        },
    
        /**
         * Update load more button visibility
         * @param {boolean} visible - Whether button should be visible
         */
        updateLoadMoreButton(visible) {
            const loadMoreButton = document.getElementById('load-more-projects');
            if (!loadMoreButton) return;
    
            if (visible) {
                loadMoreButton.style.display = 'inline-block';
            } else {
                loadMoreButton.style.display = 'none';
            }
        },
    
        // Loading and error states
    
        /**
         * Show loading state for projects list
         */
        showProjectsLoading() {
            // Use skeleton loaders if available
            if (window.Loader) {
                for (let i = 1; i <= 6; i++) {
                    const skeletonContainer = document.getElementById(`skeleton-project-${i}`);
                    if (skeletonContainer) {
                        window.Loader.showSkeleton(skeletonContainer, 'card');
                    }
                }
            }
        },
    
        /**
         * Show loading state for featured projects
         */
        showFeaturedProjectsLoading() {
            // Use skeleton loaders if available
            if (window.Loader) {
                for (let i = 1; i <= 3; i++) {
                    const skeletonContainer = document.getElementById(`skeleton-project-${i}`);
                    if (skeletonContainer) {
                        window.Loader.showSkeleton(skeletonContainer, 'card');
                    }
                }
            }
        },
    
        /**
         * Show loading state for project detail
         */
        showProjectDetailLoading() {
            const skeletonContainer = document.getElementById('project-detail-skeleton');
            if (skeletonContainer) {
                if (window.Loader) {
                    window.Loader.showSkeleton(skeletonContainer, 'detail');
                } else {
                    skeletonContainer.innerHTML = '<div class="spinner"></div>';
                }
            }
        },
    
        /**
         * Show error message for projects list
         * @param {string} message - Error message to display
         */
        showProjectsError(message) {
            const container = document.getElementById('projects-container');
            if (!container) return;
    
            // Use Utils.showError if available
            if (window.Utils && typeof window.Utils.showError === 'function') {
                window.Utils.showError(container, message, true, () => this.loadAllProjects());
            } else {
                container.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-danger" role="alert">
                            <p>${message}</p>
                            <button class="btn btn-primary mt-3" onclick="ProjectsModule.loadAllProjects()">Try Again</button>
                        </div>
                    </div>
                `;
            }
        },
    
        /**
         * Show error message for featured projects
         * @param {string} message - Error message to display
         */
        showFeaturedProjectsError(message) {
            const container = document.getElementById('featured-projects-container');
            if (!container) return;
    
            // Use Utils.showError if available
            if (window.Utils && typeof window.Utils.showError === 'function') {
                window.Utils.showError(container, message, true, () => this.loadFeaturedProjects());
            } else {
                container.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-danger" role="alert">
                            <p>${message}</p>
                            <button class="btn btn-primary mt-3" onclick="ProjectsModule.loadFeaturedProjects()">Try Again</button>
                        </div>
                    </div>
                `;
            }
        },
    
        /**
         * Show error message for project detail
         * @param {string} message - Error message to display
         */
        showProjectError(message) {
            const errorContainer = document.getElementById('project-error');
            const articleContainer = document.querySelector('.project-article');
            const skeletonContainer = document.getElementById('project-detail-skeleton');
    
            if (!errorContainer || !articleContainer || !skeletonContainer) return;
    
            // Hide skeleton and article
            skeletonContainer.style.display = 'none';
            articleContainer.classList.add('d-none');
    
            // Show error
            errorContainer.classList.remove('d-none');
    
            // Use Utils.showError if available
            if (window.Utils && typeof window.Utils.showError === 'function') {
                window.Utils.showError(errorContainer, message, false);
            } else {
                errorContainer.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        <p>${message}</p>
                        <a href="pages/projects.html" class="btn btn-primary mt-3">Back to Projects</a>
                    </div>
                `;
            }
        },
    
        // Utility methods
    
        /**
         * Format date string
         * @param {string} dateString - Date string to format
         * @returns {string} - Formatted date string
         */
        formatDate(dateString) {
            // Use Utils.formatDate if available
            if (window.Utils && typeof window.Utils.formatDate === 'function') {
                return window.Utils.formatDate(dateString);
            }
    
            // Simple fallback formatter
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch (error) {
                console.error('Error formatting date:', error);
                return dateString; // Return original string on error
            }
        },
    
        /**
         * Truncate text to a specified length
         * @param {string} text - Text to truncate
         * @param {number} maxLength - Maximum length
         * @returns {string} - Truncated text
         */
        truncateText(text, maxLength) {
            // Use Utils.truncateText if available
            if (window.Utils && typeof window.Utils.truncateText === 'function') {
                return window.Utils.truncateText(text, maxLength);
            }
    
            // Simple fallback truncation
            if (!text || text.length <= maxLength) {
                return text;
            }
            return text.substring(0, maxLength) + '...';
        },
    
        /**
         * Escape HTML special characters
         * @param {string} html - HTML string to escape
         * @returns {string} - Escaped HTML string
         */
        escapeHtml(html) {
            const el = document.createElement('div');
            el.textContent = html;
            return el.innerHTML;
        }
    };
    
    // Expose to global scope
    window.ProjectsModule = ProjectsModule;