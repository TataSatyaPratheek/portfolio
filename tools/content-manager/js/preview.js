/**
 * preview.js - Content preview for Content Manager Tool
 * Generates live previews of content based on form input.
 */

// Preview Manager
const PreviewManager = {
    /**
     * Initialize the preview manager
     */
    init() {
        // Nothing to do on initialization
    },
    
    /**
     * Update preview based on content type and form data
     * @param {string} contentType - Type of content (project, blog, experience, skill)
     * @param {Object} formData - Form data object
     */
    updatePreview(contentType, formData) {
        // Get preview container
        const previewContainer = document.getElementById('preview-container');
        
        // Generate preview based on content type
        switch (contentType) {
            case 'project':
                this.renderProjectPreview(previewContainer, formData);
                break;
                
            case 'blog':
                this.renderBlogPreview(previewContainer, formData);
                break;
                
            case 'experience':
                this.renderExperiencePreview(previewContainer, formData);
                break;
                
            case 'skill':
                this.renderSkillPreview(previewContainer, formData);
                break;
                
            default:
                previewContainer.innerHTML = '<p class="text-muted">No preview available for this content type.</p>';
        }
    },
    
    /**
     * Reset preview container
     */
    resetPreview() {
        const previewContainer = document.getElementById('preview-container');
        previewContainer.innerHTML = '<p class="text-muted">Fill out the form to see a preview.</p>';
    },
    
    /**
     * Render project preview
     * @param {HTMLElement} container - Preview container
     * @param {Object} data - Project data
     */
    renderProjectPreview(container, data) {
        // Create preview card
        const previewCard = document.createElement('div');
        previewCard.className = 'preview-card';
        
        // Create skills badges HTML
        let skillsHtml = '';
        if (data.skills && Array.isArray(data.skills)) {
            skillsHtml = data.skills.map(skill => 
                `<span class="preview-badge">${skill}</span>`
            ).join('');
        } else if (data.skills && typeof data.skills === 'string') {
            skillsHtml = `<span class="preview-badge">${data.skills}</span>`;
        }
        
        // Set card HTML
        previewCard.innerHTML = `
            <div class="preview-card-img-container">
                ${data.image ? `<img src="${this.getImagePlaceholder(data.image)}" class="preview-card-img" alt="${data.alt || data.title}">` : ''}
                ${data.featured ? '<span class="featured-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
            </div>
            <div class="preview-card-body">
                <h3 class="preview-card-title">${data.title || 'Project Title'}</h3>
                <p class="preview-card-text">${this.truncateText(data.description || 'Project description...', 120)}</p>
                <div class="preview-skills-container mb-3">
                    ${skillsHtml}
                </div>
                <button class="btn btn-primary btn-sm">View Details</button>
            </div>
        `;
        
        // Clear container and append preview
        container.innerHTML = '';
        container.appendChild(previewCard);
    },
    
    /**
     * Render blog preview
     * @param {HTMLElement} container - Preview container
     * @param {Object} data - Blog data
     */
    renderBlogPreview(container, data) {
        // Create preview card
        const previewCard = document.createElement('div');
        previewCard.className = 'preview-card';
        
        // Create tags badges HTML
        let tagsHtml = '';
        if (data.tags && Array.isArray(data.tags)) {
            tagsHtml = data.tags.map(tag => 
                `<span class="preview-badge">${tag}</span>`
            ).join('');
        } else if (data.tags && typeof data.tags === 'string') {
            tagsHtml = `<span class="preview-badge">${data.tags}</span>`;
        }
        
        // Format date if available
        const dateString = data.date ? new Date(data.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : '';
        
        // Set card HTML
        previewCard.innerHTML = `
            <div class="preview-card-img-container">
                ${data.image ? `<img src="${this.getImagePlaceholder(data.image)}" class="preview-card-img" alt="${data.alt || data.title}">` : ''}
                ${dateString ? `<span class="date-badge"><i class="far fa-calendar-alt"></i> ${dateString}</span>` : ''}
            </div>
            <div class="preview-card-body">
                <h3 class="preview-card-title">${data.title || 'Blog Title'}</h3>
                <p class="preview-card-text">${this.truncateText(data.description || 'Blog description...', 150)}</p>
                <div class="preview-tags-container mb-3">
                    ${tagsHtml}
                </div>
                <button class="btn btn-primary btn-sm">Read More</button>
            </div>
        `;
        
        // Clear container and append preview
        container.innerHTML = '';
        container.appendChild(previewCard);
    },
    
    /**
     * Render experience preview
     * @param {HTMLElement} container - Preview container
     * @param {Object} data - Experience data
     */
    renderExperiencePreview(container, data) {
        // Create preview element
        const previewEl = document.createElement('div');
        previewEl.className = 'preview-experience';
        
        // Create skills badges HTML
        let skillsHtml = '';
        if (data.skills && Array.isArray(data.skills)) {
            skillsHtml = data.skills.map(skill => 
                `<span class="preview-badge">${skill}</span>`
            ).join('');
        } else if (data.skills && typeof data.skills === 'string') {
            skillsHtml = `<span class="preview-badge">${data.skills}</span>`;
        }
        
        // Create responsibilities list HTML
        let responsibilitiesHtml = '';
        if (data.responsibilities && Array.isArray(data.responsibilities) && data.responsibilities.length > 0) {
            responsibilitiesHtml = `
                <div class="preview-responsibilities mt-3">
                    <h5 class="h6">Responsibilities:</h5>
                    <ul>
                        ${data.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Set preview HTML
        previewEl.innerHTML = `
            <div class="preview-timeline-item">
                <div class="preview-timeline-content p-3 bg-light rounded shadow-sm">
                    <div class="preview-timeline-date">${data.duration || 'Duration'}</div>
                    <h4 class="preview-timeline-title">${data.role || 'Role'}</h4>
                    <h5 class="preview-timeline-company">${data.company || 'Company'}</h5>
                    ${data.description ? `<p class="preview-timeline-description">${data.description}</p>` : ''}
                    ${responsibilitiesHtml}
                    ${skillsHtml ? `
                        <div class="preview-skills mt-3">
                            <h5 class="h6">Skills:</h5>
                            <div class="preview-skills-badges">
                                ${skillsHtml}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Clear container and append preview
        container.innerHTML = '';
        container.appendChild(previewEl);
    },
    
    /**
     * Render skill preview
     * @param {HTMLElement} container - Preview container
     * @param {Object} data - Skill data
     */
    renderSkillPreview(container, data) {
        // Create preview element
        const previewEl = document.createElement('div');
        previewEl.className = 'preview-skill text-center p-3 bg-light rounded shadow-sm';
        
        // Create projects list HTML
        let projectsHtml = '';
        if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
            projectsHtml = `
                <div class="preview-skill-projects mt-2">
                    <small>Used in:</small>
                    <div class="preview-skill-projects-list">
                        ${data.projects.map(project => 
                            `<div class="preview-skill-project-link">${project}</div>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
        // Set preview HTML
        previewEl.innerHTML = `
            <div class="preview-skill-icon mb-3">
                ${data.icon ? `<img src="${this.getImagePlaceholder(data.icon)}" alt="${data.name}" style="width: 60px; height: 60px; margin: 0 auto;">` : 
                    '<div style="width: 60px; height: 60px; background-color: #ddd; border-radius: 50%; margin: 0 auto;"></div>'}
            </div>
            <h4 class="preview-skill-name">${data.name || 'Skill Name'}</h4>
            ${data.level ? `<span class="preview-badge">${data.level}</span>` : ''}
            ${data.description ? `<p class="preview-skill-description mt-2">${data.description}</p>` : ''}
            ${projectsHtml}
        `;
        
        // Clear container and append preview
        container.innerHTML = '';
        container.appendChild(previewEl);
    },
    
    /**
     * Get image placeholder URL
     * @param {string} imagePath - Original image path
     * @returns {string} - Placeholder image URL
     */
    getImagePlaceholder(imagePath) {
        // For preview purposes, just return a placeholder
        // In a real tool, you might want to check if the image exists in your assets
        return imagePath || 'https://via.placeholder.com/300x200';
    },
    
    /**
     * Truncate text to a specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} - Truncated text
     */
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    }
};

// Initialize preview manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.PreviewManager = PreviewManager;
    PreviewManager.init();
});