/**
 * contact.js - Module for handling contact form functionality
 * Manages form validation, submission, and feedback.
 */

// Contact Module
const ContactModule = {
    // Form elements
    form: null,
    submitButton: null,
    alertContainer: null,
    
    // Configuration
    config: {
        // Change this to a real endpoint if you're using a form service like Formspree
        formEndpoint: '#',
        
        // Fields to validate
        requiredFields: ['name', 'email', 'message'],
        
        // Validation messages
        validationMessages: {
            required: 'This field is required',
            email: 'Please enter a valid email address',
            minLength: 'Please enter at least {0} characters'
        }
    },
    
    /**
     * Initialize the contact module
     */
    init() {
        // Get form elements
        this.form = document.getElementById('contact-form');
        
        if (!this.form) return;
        
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.alertContainer = document.getElementById('form-alert');
        
        // Initialize form validation
        this.initFormValidation();
        
        // Initialize form submission
        this.initFormSubmission();
    },
    
    /**
     * Initialize form validation
     */
    initFormValidation() {
        if (!this.form) return;
        
        // Add validation for each required field
        this.config.requiredFields.forEach(fieldName => {
            const field = this.form.elements[fieldName];
            if (!field) return;
            
            // Add blur event listener
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
            
            // Add input event listener to clear error when typing
            field.addEventListener('input', () => {
                this.clearFieldError(field);
            });
        });
        
        // Add submit event listener
        this.form.addEventListener('submit', (e) => {
            // Prevent default form submission
            e.preventDefault();
            
            // Validate all fields
            const isValid = this.validateForm();
            
            // If valid, submit the form
            if (isValid) {
                this.submitForm();
            }
        });
    },
    
    /**
     * Initialize form submission
     */
    initFormSubmission() {
        // Since GitHub Pages is static, we can't process the form server-side.
        // In a real implementation, you would use a service like Formspree or Netlify Forms.
        // For now, we'll just simulate form submission.
    },
    
    /**
     * Validate an individual field
     * @param {HTMLElement} field - Form field to validate
     * @returns {boolean} - Whether the field is valid
     */
    validateField(field) {
        // Get field name and value
        const name = field.name;
        const value = field.value.trim();
        
        // Clear any existing error
        this.clearFieldError(field);
        
        // Check for required fields
        if (this.config.requiredFields.includes(name) && value === '') {
            this.showFieldError(field, this.config.validationMessages.required);
            return false;
        }
        
        // Check email format
        if (name === 'email' && value !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showFieldError(field, this.config.validationMessages.email);
                return false;
            }
        }
        
        // Check minimum length for message
        if (name === 'message' && value.length < 10) {
            const message = this.config.validationMessages.minLength.replace('{0}', '10');
            this.showFieldError(field, message);
            return false;
        }
        
        // Field is valid
        field.classList.add('is-valid');
        return true;
    },
    
    /**
     * Show error message for a field
     * @param {HTMLElement} field - Form field
     * @param {string} message - Error message
     */
    showFieldError(field, message) {
        // Add invalid class to field
        field.classList.add('is-invalid');
        
        // Get or create error message element
        let errorElement = field.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('invalid-feedback')) {
            errorElement = document.createElement('div');
            errorElement.className = 'invalid-feedback';
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
        
        // Set error message
        errorElement.textContent = message;
        
        // Set aria attributes for accessibility
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', `${field.name}-error`);
        errorElement.id = `${field.name}-error`;
        
        // Focus field if not already focused
        if (document.activeElement !== field) {
            field.focus();
        }
    },
    
    /**
     * Clear error message for a field
     * @param {HTMLElement} field - Form field
     */
    clearFieldError(field) {
        // Remove invalid class and aria attributes
        field.classList.remove('is-invalid', 'is-valid');
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
        
        // Remove error message element
        const errorElement = field.nextElementSibling;
        if (errorElement && errorElement.classList.contains('invalid-feedback')) {
            errorElement.textContent = '';
        }
    },
    
    /**
     * Validate all form fields
     * @returns {boolean} - Whether the form is valid
     */
    validateForm() {
        if (!this.form) return false;
        
        let isValid = true;
        
        // Validate each required field
        this.config.requiredFields.forEach(fieldName => {
            const field = this.form.elements[fieldName];
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    },
    
    /**
     * Submit the form
     */
    submitForm() {
        if (!this.form || !this.submitButton) return;
        
        // Show loading state
        this.setSubmitButtonLoading(true);
        
        // In a real implementation, you would submit the form to your endpoint.
        // Since GitHub Pages is static, we'll simulate a successful submission.
        setTimeout(() => {
            // Show success message
            this.showFormAlert('success', 'Thank you for your message! Since this is a GitHub Pages site, this form does not actually send emails. In a real website, you would use a service like Formspree or Netlify Forms.');
            
            // Reset form
            this.form.reset();
            
            // Reset loading state
            this.setSubmitButtonLoading(false);
            
            // Clear validation classes
            Array.from(this.form.elements).forEach(field => {
                field.classList.remove('is-invalid', 'is-valid');
            });
        }, 1500);
    },
    
    /**
     * Set submit button loading state
     * @param {boolean} isLoading - Whether button should show loading state
     */
    setSubmitButtonLoading(isLoading) {
        if (!this.submitButton) return;
        
        if (isLoading) {
            // Disable button and show loading spinner
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
        } else {
            // Re-enable button and restore text
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = 'Send Message';
        }
    },
    
    /**
     * Show alert message for the form
     * @param {string} type - Alert type ('success', 'danger', 'warning', 'info')
     * @param {string} message - Alert message
     */
    showFormAlert(type, message) {
        if (!this.alertContainer) return;
        
        // Set alert type and message
        this.alertContainer.className = `alert alert-${type}`;
        this.alertContainer.textContent = message;
        this.alertContainer.style.display = 'block';
        
        // Set ARIA attributes for accessibility
        this.alertContainer.setAttribute('role', 'alert');
        this.alertContainer.setAttribute('aria-live', 'assertive');
        
        // Scroll to alert
        this.alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Auto-hide alert after 10 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                this.alertContainer.style.display = 'none';
            }, 10000);
        }
    }
};

// Expose to global scope
window.ContactModule = ContactModule;