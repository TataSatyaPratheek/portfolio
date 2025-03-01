/**
 * form.js - Form handling for Content Manager Tool
 * Manages form display, field changes, and form submission.
 */

// Form Manager
const FormManager = {
    // Current content type
    currentType: 'project',
    
    // SimpleMDE instances
    markdownEditors: {},
    
    /**
     * Initialize the form manager
     */
    init() {
        // Set current year in footer
        document.querySelector('.current-year').textContent = new Date().getFullYear();
        
        // Initialize theme
        this.initTheme();
        
        // Initialize content type buttons
        this.initContentTypeButtons();
        
        // Load initial form
        this.loadForm('project');
        
        // Initialize form submit handler
        this.initFormSubmit();
        
        // Initialize form reset button
        this.initFormReset();
    },
    
    /**
     * Initialize theme functionality
     */
    initTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        
        // Check for saved theme preference or use system preference
        const savedTheme = localStorage.getItem('cm-theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Set initial theme
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark-theme');
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
        
        // Add theme toggle event
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            
            if (document.body.classList.contains('dark-theme')) {
                localStorage.setItem('cm-theme', 'dark');
                themeIcon.className = 'fas fa-sun';
            } else {
                localStorage.setItem('cm-theme', 'light');
                themeIcon.className = 'fas fa-moon';
            }
            
            // Reinitialize markdown editors for proper theming
            this.reinitializeMarkdownEditors();
        });
    },
    
    /**
     * Initialize content type selection buttons
     */
    initContentTypeButtons() {
        const contentTypeButtons = document.querySelectorAll('[data-content-type]');
        
        contentTypeButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                contentTypeButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Get content type
                const contentType = button.getAttribute('data-content-type');
                
                // Load form for this content type
                this.loadForm(contentType);
            });
        });
    },
    
    /**
     * Load form for specified content type
     * @param {string} contentType - Content type to load form for
     */
    loadForm(contentType) {
        // Set current type
        this.currentType = contentType;
        
        // Get form template
        const formTemplate = document.getElementById(`${contentType}-form-template`);
        
        if (!formTemplate) {
            console.error(`Form template not found for content type: ${contentType}`);
            return;
        }
        
        // Get form container
        const formContainer = document.getElementById('form-container');
        
        // Clone template content
        const formContent = formTemplate.cloneNode(true);
        formContent.removeAttribute('id');
        formContent.style.display = 'block';
        
        // Clear form container and append new form
        formContainer.innerHTML = '';
        formContainer.appendChild(formContent);
        
        // Initialize any special form elements
        this.initSpecialFormElements();
        
        // Initialize markdown editors
        this.initMarkdownEditors();
        
        // Initialize field change handlers for live preview
        this.initFieldChangeHandlers();
        
        // Reset preview
        if (window.PreviewManager) {
            window.PreviewManager.resetPreview();
        }
    },
    
    /**
     * Initialize special form elements (e.g., custom category selection)
     */
    initSpecialFormElements() {
        // Handle custom category selection for skills
        const categorySelect = document.getElementById('skill-category');
        const otherCategoryGroup = document.getElementById('other-category-group');
        
        if (categorySelect && otherCategoryGroup) {
            categorySelect.addEventListener('change', () => {
                if (categorySelect.value === 'Other') {
                    otherCategoryGroup.style.display = 'block';
                } else {
                    otherCategoryGroup.style.display = 'none';
                }
            });
        }
        
        // Auto-generate ID and slug from title
        const titleInputs = {
            project: document.getElementById('project-title'),
            blog: document.getElementById('blog-title'),
            experience: document.getElementById('experience-company'),
            skill: document.getElementById('skill-name')
        };
        
        const idInputs = {
            project: document.getElementById('project-id'),
            blog: document.getElementById('blog-id'),
            experience: document.getElementById('experience-id'),
            skill: null
        };
        
        const slugInputs = {
            project: document.getElementById('project-slug'),
            blog: document.getElementById('blog-slug'),
            experience: null,
            skill: null
        };
        
        // Add event listeners for title inputs
        Object.keys(titleInputs).forEach(type => {
            const titleInput = titleInputs[type];
            const idInput = idInputs[type];
            const slugInput = slugInputs[type];
            
            if (titleInput) {
                titleInput.addEventListener('input', () => {
                    const titleValue = titleInput.value.trim();
                    
                    // Generate ID if ID input exists and is empty
                    if (idInput && idInput.value === '') {
                        idInput.value = this.generateSlug(titleValue);
                    }
                    
                    // Generate slug if slug input exists and is empty
                    if (slugInput && slugInput.value === '') {
                        slugInput.value = this.generateSlug(titleValue);
                    }
                });
            }
        });
    },
    
    /**
     * Initialize markdown editors for textarea fields with markdown-editor class
     */
    initMarkdownEditors() {
        // Clear any existing editor instances
        this.markdownEditors = {};
        
        // Find all markdown editor textareas
        const markdownTextareas = document.querySelectorAll('textarea.markdown-editor');
        
        markdownTextareas.forEach(textarea => {
            // Initialize SimpleMDE
            const editor = new SimpleMDE({
                element: textarea,
                spellChecker: false,
                autofocus: false,
                placeholder: textarea.getAttribute('placeholder') || 'Write your content here...',
                toolbar: [
                    'bold', 'italic', 'heading', '|', 
                    'quote', 'unordered-list', 'ordered-list', '|',
                    'link', 'image', '|',
                    'preview', 'side-by-side', 'fullscreen', '|',
                    'guide'
                ]
            });
            
            // Store editor instance
            this.markdownEditors[textarea.id] = editor;
            
            // Add change event handler for preview
            editor.codemirror.on('change', () => {
                // Trigger change event on the original textarea
                textarea.value = editor.value();
                textarea.dispatchEvent(new Event('change', { bubbles: true }));
            });
        });
    },
    
    /**
     * Reinitialize markdown editors (e.g., after theme change)
     */
    reinitializeMarkdownEditors() {
        // Store editor values
        const editorValues = {};
        
        Object.keys(this.markdownEditors).forEach(id => {
            editorValues[id] = this.markdownEditors[id].value();
        });
        
        // Reinitialize editors
        this.initMarkdownEditors();
        
        // Restore values
        Object.keys(this.markdownEditors).forEach(id => {
            if (editorValues[id]) {
                this.markdownEditors[id].value(editorValues[id]);
            }
        });
    },
    
    /**
     * Initialize field change handlers for live preview
     */
    initFieldChangeHandlers() {
        // Get all form fields
        const formFields = document.querySelectorAll('#content-form input, #content-form textarea, #content-form select');
        
        // Add change event handlers
        formFields.forEach(field => {
            field.addEventListener('input', () => {
                this.updatePreview();
            });
            
            field.addEventListener('change', () => {
                this.updatePreview();
            });
        });
    },
    
    /**
     * Update preview based on current form values
     */
    updatePreview() {
        // Only update if PreviewManager exists
        if (window.PreviewManager) {
            const formData = this.getFormData();
            window.PreviewManager.updatePreview(this.currentType, formData);
        }
    },
    
    /**
     * Initialize form submit handler
     */
    initFormSubmit() {
        const form = document.getElementById('content-form');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = this.getFormData();
            
            // Format JSON
            const jsonOutput = this.formatJson(formData);
            
            // Display JSON output
            this.displayJsonOutput(jsonOutput);
            
            // Enable export buttons
            this.enableExportButtons(jsonOutput);
            
            // Update preview one last time
            this.updatePreview();
        });
    },
    
    /**
     * Initialize form reset button
     */
    initFormReset() {
        const resetButton = document.getElementById('reset-form');
        
        resetButton.addEventListener('click', () => {
            // Reset the form
            document.getElementById('content-form').reset();
            
            // Reset markdown editors
            Object.keys(this.markdownEditors).forEach(id => {
                this.markdownEditors[id].value('');
            });
            
            // Reset preview
            if (window.PreviewManager) {
                window.PreviewManager.resetPreview();
            }
            
            // Reset JSON output
            document.getElementById('json-output').innerHTML = '<p class="text-muted">JSON will appear here after form submission.</p>';
            
            // Disable export buttons
            document.getElementById('copy-json').disabled = true;
            document.getElementById('download-json').disabled = true;
        });
    },
    
    /**
     * Get form data as object
     * @returns {Object} - Form data object
     */
    getFormData() {
        const form = document.getElementById('content-form');
        const formData = {};
        
        // Process each form field
        Array.from(form.elements).forEach(field => {
            // Skip buttons and fields without names
            if (!field.name || field.type === 'submit' || field.type === 'button' || field.type === 'reset') {
                return;
            }
            
            // Handle checkboxes
            if (field.type === 'checkbox') {
                // Handle nested properties (e.g., testimonial.text)
                if (field.name.includes('.')) {
                    const parts = field.name.split('.');
                    const parent = parts[0];
                    const child = parts[1];
                    
                    if (!formData[parent]) {
                        formData[parent] = {};
                    }
                    
                    formData[parent][child] = field.checked;
                } else {
                    formData[field.name] = field.checked;
                }
                return;
            }
            
            // Get field value (use markdown editor value if available)
            let value = field.name in this.markdownEditors ? 
                this.markdownEditors[field.id].value() : 
                field.value.trim();
            
            // Handle multi-line text fields that should be arrays
            if (this.isArrayField(field.name) && value) {
                value = value.split('\n')
                    .map(line => line.trim())
                    .filter(line => line !== '');
            }
            
            // Handle nested properties (e.g., testimonial.text)
            if (field.name.includes('.')) {
                const parts = field.name.split('.');
                const parent = parts[0];
                const child = parts[1];
                
                if (!formData[parent]) {
                    formData[parent] = {};
                }
                
                formData[parent][child] = value;
            } else {
                formData[field.name] = value;
            }
        });
        
        // Special handling for skills content type
        if (this.currentType === 'skill') {
            // Use custom category if "Other" is selected
            if (formData.category === 'Other' && formData.customCategory) {
                formData.category = formData.customCategory;
                delete formData.customCategory;
            }
        }
        
        return formData;
    },
    
    /**
     * Check if a field should be treated as an array
     * @param {string} fieldName - Field name
     * @returns {boolean} - Whether field should be an array
     */
    isArrayField(fieldName) {
        const arrayFields = [
            'skills', 'tags', 'citations', 'related_projects', 'responsibilities', 
            'achievements', 'projects', 'libraries'
        ];
        
        return arrayFields.includes(fieldName);
    },
    
    /**
     * Format JSON with indentation
     * @param {Object} data - Data to format
     * @returns {string} - Formatted JSON string
     */
    formatJson(data) {
        return JSON.stringify(data, null, 2);
    },
    
    /**
     * Display JSON output
     * @param {string} json - JSON string to display
     */
    displayJsonOutput(json) {
        const outputContainer = document.getElementById('json-output');
        outputContainer.innerHTML = `<pre>${this.escapeHtml(json)}</pre>`;
    },
    
    /**
     * Enable export buttons
     * @param {string} json - JSON string for export
     */
    enableExportButtons(json) {
        // Enable copy button
        const copyButton = document.getElementById('copy-json');
        copyButton.disabled = false;
        
        // Enable download button
        const downloadButton = document.getElementById('download-json');
        downloadButton.disabled = false;
        
        // Initialize export functionality if ExportManager exists
        if (window.ExportManager) {
            window.ExportManager.initExport(this.currentType, json);
        }
    },
    
    /**
     * Generate slug from text
     * @param {string} text - Text to generate slug from
     * @returns {string} - Generated slug
     */
    generateSlug(text) {
        return text.toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-')     // Replace spaces with hyphens
            .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
            .trim();
    },
    
    /**
     * Escape HTML special characters
     * @param {string} html - HTML string to escape
     * @returns {string} - Escaped HTML string
     */
    escapeHtml(html) {
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};

// Initialize form manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    FormManager.init();
});