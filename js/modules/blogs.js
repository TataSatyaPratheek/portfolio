/**
 * blogs.js - Module for handling blog data and rendering
 * Manages fetching blog data, rendering blog cards and detail pages.
 */

// Blogs Module
const BlogsModule = {
    // Cache for blogs data
    blogsData: null,
    
    // Configuration
    config: {
        dataUrl: 'data/blog.json',
        perPage: 6, // Number of blogs to load per page
        cacheTTL: 3600 // Cache time-to-live in seconds (1 hour)
    },
    
    /**
     * Initialize the blogs module
     */
    init() {
        // Load all blogs
        this.loadAllBlogs();
    },
    
    /**
     * Initialize blog detail page
     */
    initBlogDetail() {
        // Get blog title from URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const blogTitle = urlParams.get('title');
        
        if (blogTitle) {
            // Load blog details
            this.loadBlogDetail(blogTitle);
        } else {
            // Show error message if no blog title
            this.showBlogError('No blog post specified. Please select a post from the blog page.');
        }
    },
    
    /**
     * Fetch blogs data from JSON file
     * @returns {Promise<Array>} - Promise that resolves with blogs data
     */
    async fetchBlogs() {
        // Return cached data if available
        if (this.blogsData !== null) {
            return this.blogsData;
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
                this.blogsData = data;
                return data;
            } else {
                const response = await fetch(this.config.dataUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                this.blogsData = data;
                return data;
            }
        } catch (error) {
            console.error('Error fetching blogs data:', error);
            throw error;
        }
    },
    
    /**
     * Load all blogs into the blogs container
     */
    async loadAllBlogs() {
        const container = document.getElementById('blogs-container');
        if (!container) return;
        
        try {
            // Show skeleton loading state
            this.showBlogsLoading();
            
            // Fetch blogs data
            const blogs = await this.fetchBlogs();
            
            // Clear container
            container.innerHTML = '';
            
            if (blogs.length === 0) {
                container.innerHTML = '<div class="col-12 text-center"><p>No blog posts found.</p></div>';
                return;
            }
            
            // Render all blogs
            this.renderBlogs(blogs, container);
        } catch (error) {
            this.showBlogsError('Failed to load blog posts. Please try again later.');
        }
    },
    
    /**
     * Load latest blogs into the latest blogs container
     */
    async loadLatestBlogs() {
        const container = document.getElementById('latest-blogs-container');
        if (!container) return;
        
        try {
            // Show skeleton loading state
            this.showLatestBlogsLoading();
            
            // Fetch blogs data
            const blogs = await this.fetchBlogs();
            
            // Clear container
            container.innerHTML = '';
            
            if (blogs.length === 0) {
                container.innerHTML = '<div class="col-12 text-center"><p>No blog posts found.</p></div>';
                return;
            }
            
            // Sort blogs by date (newest first) if date is available
            const sortedBlogs = [...blogs].sort((a, b) => {
                if (a.date && b.date) {
                    return new Date(b.date) - new Date(a.date);
                }
                return 0;
            });
            
            // Get latest 2 blogs
            const latestBlogs = sortedBlogs.slice(0, 2);
            
            // Render latest blogs
            this.renderBlogs(latestBlogs, container);
        } catch (error) {
            this.showLatestBlogsError('Failed to load latest blog posts. Please try again later.');
        }
    },
    
    /**
     * Load blog detail by title/slug
     * @param {string} blogTitle - Blog title or slug
     */
    async loadBlogDetail(blogTitle) {
        try {
            // Show skeleton loading state
            this.showBlogDetailLoading();
            
            // Fetch blogs data
            const blogs = await this.fetchBlogs();
            
            // Find the blog by title or slug
            const blog = blogs.find(b => 
                b.slug === blogTitle || 
                b.title.toLowerCase().replace(/\s+/g, '-') === blogTitle.toLowerCase()
            );
            
            if (!blog) {
                this.showBlogError('Blog post not found. It may have been moved or deleted.');
                return;
            }
            
            // Update page title and metadata
            this.updateBlogDetailMetadata(blog);
            
            // Render blog detail
            this.renderBlogDetail(blog);
            
            // Load related projects if any
            if (blog.related_projects && blog.related_projects.length > 0) {
                this.loadRelatedProjects(blog.related_projects);
            } else {
                // Hide related projects section if none
                const relatedSection = document.querySelector('.blog-related-projects');
                if (relatedSection) {
                    relatedSection.style.display = 'none';
                }
            }
        } catch (error) {
            this.showBlogError('Failed to load blog post. Please try again later.');
        }
    },
    
    /**
     * Render blogs as cards in a container
     * @param {Array} blogs - Array of blog objects
     * @param {HTMLElement} container - Container to render blogs in
     */
    renderBlogs(blogs, container) {
        blogs.forEach((blog, index) => {
            const blogCard = this.createBlogCard(blog, index);
            container.appendChild(blogCard);
        });
    },
    
    /**
     * Create a blog card element
     * @param {Object} blog - Blog data
     * @param {number} index - Blog index for animation delay
     * @returns {HTMLElement} - Blog card element
     */
    createBlogCard(blog, index) {
        // Create column element
        const colElement = document.createElement('div');
        colElement.className = 'col-lg-6 col-md-6 mb-4';
        colElement.setAttribute('data-aos', 'fade-up');
        colElement.setAttribute('data-aos-delay', (index % 2) * 100);
        
        // Create blog URL
        const blogUrl = blog.link || `blog-detail.html?title=${blog.slug || blog.title.toLowerCase().replace(/\s+/g, '-')}`;
        
        // Create tag badges HTML
        const tagBadges = blog.tags.map(tag => 
            `<span class="badge badge-primary mr-1">${tag}</span>`
        ).join('');
        
        // Create date string
        const dateString = blog.date ? this.formatDate(blog.date) : '';
        
        // Create card HTML
        colElement.innerHTML = `
            <div class="card blog-card h-100 shadow-sm">
                <div class="card-img-container">
                    <img src="${blog.image}" class="card-img-top" alt="${blog.alt || blog.title}" loading="lazy">
                    ${dateString ? `<span class="date-badge"><i class="far fa-calendar-alt" aria-hidden="true"></i> ${dateString}</span>` : ''}
                </div>
                <div class="card-body d-flex flex-column">
                    <h3 class="card-title h5">${blog.title}</h3>
                    <p class="card-text flex-grow-1">${this.truncateText(blog.shortDescription || blog.description, 150)}</p>
                    <div class="tags-container mb-3">
                        ${tagBadges}
                    </div>
                    <a href="${blogUrl}" class="btn btn-primary mt-auto" aria-label="Read more about ${blog.title}">Read More</a>
                </div>
            </div>
        `;
        
        return colElement;
    },
    
    /**
     * Render blog detail page
     * @param {Object} blog - Blog data
     */
    renderBlogDetail(blog) {
        // Hide skeleton loader
        const skeleton = document.getElementById('blog-detail-skeleton');
        const errorContainer = document.getElementById('blog-error');
        const articleContainer = document.querySelector('.blog-article');
        
        if (!skeleton || !errorContainer || !articleContainer) return;
        
        // Update page title
        document.getElementById('blog-title').textContent = blog.title;
        document.getElementById('blog-breadcrumb-title').textContent = blog.title;
        
        // Update image
        const blogImage = document.getElementById('blog-image');
        if (blogImage) {
            blogImage.src = blog.image;
            blogImage.alt = blog.alt || blog.title;
        }
        
        // Update metadata
        const blogDate = document.getElementById('blog-date');
        if (blogDate && blog.date) {
            blogDate.textContent = this.formatDate(blog.date);
        }
        
        const blogAuthor = document.getElementById('blog-author');
        if (blogAuthor && blog.author) {
            blogAuthor.textContent = blog.author;
        }
        
        const blogReadTime = document.getElementById('blog-read-time');
        if (blogReadTime && blog.readTime) {
            blogReadTime.textContent = blog.readTime;
        }
        
        // Update description
        const blogDescription = document.getElementById('blog-description');
        if (blogDescription) {
            blogDescription.textContent = blog.description;
        }
        
        // Update tags
        const blogTags = document.getElementById('blog-tags');
        if (blogTags) {
            blogTags.innerHTML = blog.tags.map(tag => 
                `<span class="badge badge-primary mr-2 mb-2">${tag}</span>`
            ).join('');
        }
        
        // Update blog content
        const blogContent = document.getElementById('blog-content');
        if (blogContent) {
            // Check if content should be rendered as markdown
            if (blog.isMarkdown && window.markdownit) {
                blogContent.innerHTML = window.markdownit().render(blog.content);
            } else {
                blogContent.textContent = blog.content;
            }
        }
        
        // Hide skeleton and show content
        skeleton.style.display = 'none';
        errorContainer.classList.add('d-none');
        articleContainer.classList.remove('d-none');
    },
    
    /**
     * Load related projects for a blog post
     * @param {Array} relatedProjects - Array of related project titles
     */
    async loadRelatedProjects(relatedProjects) {
        // If ProjectsModule is available, use it to load related projects
        if (window.ProjectsModule && typeof window.ProjectsModule.loadRelatedProjects === 'function') {
            window.ProjectsModule.loadRelatedProjects(relatedProjects);
        } else {
            // Hide related projects section if ProjectsModule is not available
            const relatedSection = document.querySelector('.blog-related-projects');
            if (relatedSection) {
                relatedSection.style.display = 'none';
            }
        }
    },
    
    /**
     * Update blog detail metadata (title, description, etc.)
     * @param {Object} blog - Blog data
     */
    updateBlogDetailMetadata(blog) {
        // Update document title
        document.title = `${blog.title} - Blog | Portfolio`;
        
        // Update Open Graph metadata
        const metaTags = {
            'og:title': `${blog.title} - Blog`,
            'og:description': blog.description,
            'og:image': blog.image,
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
    
    // Loading and error states
    
    /**
     * Show loading state for blogs list
     */
    showBlogsLoading() {
        // Use skeleton loaders if available
        if (window.Loader) {
            // Find all blog skeleton containers
            const skeletonContainers = document.querySelectorAll('[id^="skeleton-blog-"]');
            skeletonContainers.forEach(container => {
                window.Loader.showSkeleton(container, 'card');
            });
        }
    },
    
    /**
     * Show loading state for latest blogs
     */
    showLatestBlogsLoading() {
        // Use skeleton loaders if available
        if (window.Loader) {
            for (let i = 1; i <= 2; i++) {
                const skeletonContainer = document.getElementById(`skeleton-blog-${i}`);
                if (skeletonContainer) {
                    window.Loader.showSkeleton(skeletonContainer, 'card');
                }
            }
        }
    },
    
    /**
     * Show loading state for blog detail
     */
    showBlogDetailLoading() {
        const skeletonContainer = document.getElementById('blog-detail-skeleton');
        if (skeletonContainer) {
            if (window.Loader) {
                window.Loader.showSkeleton(skeletonContainer, 'detail');
            } else {
                skeletonContainer.innerHTML = '<div class="spinner"></div>';
            }
        }
    },
    
    /**
     * Show error message for blogs list
     * @param {string} message - Error message to display
     */
    showBlogsError(message) {
        const container = document.getElementById('blogs-container');
        if (!container) return;
        
        // Use Utils.showError if available
        if (window.Utils && typeof window.Utils.showError === 'function') {
            window.Utils.showError(container, message, true, () => this.loadAllBlogs());
        } else {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger" role="alert">
                        <p>${message}</p>
                        <button class="btn btn-primary mt-3" onclick="BlogsModule.loadAllBlogs()">Try Again</button>
                    </div>
                </div>
            `;
        }
    },
    
    /**
     * Show error message for latest blogs
     * @param {string} message - Error message to display
     */
    showLatestBlogsError(message) {
        const container = document.getElementById('latest-blogs-container');
        if (!container) return;
        
        // Use Utils.showError if available
        if (window.Utils && typeof window.Utils.showError === 'function') {
            window.Utils.showError(container, message, true, () => this.loadLatestBlogs());
        } else {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger" role="alert">
                        <p>${message}</p>
                        <button class="btn btn-primary mt-3" onclick="BlogsModule.loadLatestBlogs()">Try Again</button>
                    </div>
                </div>
            `;
        }
    },
    
    /**
     * Show error message for blog detail
     * @param {string} message - Error message to display
     */
    showBlogError(message) {
        const errorContainer = document.getElementById('blog-error');
        const articleContainer = document.querySelector('.blog-article');
        const skeletonContainer = document.getElementById('blog-detail-skeleton');
        
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
                    <a href="blog.html" class="btn btn-primary mt-3">Back to Blog</a>
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
    }
};

// Expose to global scope
window.BlogsModule = BlogsModule;