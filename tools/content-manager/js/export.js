/**
 * export.js - Export functionality for Content Manager Tool
 * Handles copying and downloading JSON data.
 */

// Export Manager
const ExportManager = {
    // Current JSON data
    currentJson: '',
    
    // Current content type
    currentType: '',
    
    /**
     * Initialize export functionality
     * @param {string} contentType - Content type
     * @param {string} json - JSON string to export
     */
    initExport(contentType, json) {
        // Store current JSON and content type
        this.currentJson = json;
        this.currentType = contentType;
        
        // Initialize copy button
        this.initCopyButton();
        
        // Initialize download button
        this.initDownloadButton();
    },
    
    /**
     * Initialize copy to clipboard button
     */
    initCopyButton() {
        const copyButton = document.getElementById('copy-json');
        
        if (!copyButton) return;
        
        // Add click event listener
        copyButton.addEventListener('click', () => {
            this.copyToClipboard();
        });
    },
    
    /**
     * Initialize download JSON button
     */
    initDownloadButton() {
        const downloadButton = document.getElementById('download-json');
        
        if (!downloadButton) return;
        
        // Add click event listener
        downloadButton.addEventListener('click', () => {
            this.downloadJson();
        });
    },
    
    /**
     * Copy JSON to clipboard
     */
    copyToClipboard() {
        // Check if clipboard API is available
        if (!navigator.clipboard) {
            this.fallbackCopyToClipboard();
            return;
        }
        
        // Copy to clipboard using Clipboard API
        navigator.clipboard.writeText(this.currentJson)
            .then(() => {
                this.showFeedback('JSON copied to clipboard!', 'success');
            })
            .catch(err => {
                console.error('Failed to copy JSON:', err);
                this.fallbackCopyToClipboard();
            });
    },
    
    /**
     * Fallback method for copying to clipboard
     */
    fallbackCopyToClipboard() {
        // Create temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = this.currentJson;
        textarea.style.position = 'fixed';  // Prevent scrolling to bottom
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            // Execute copy command
            const successful = document.execCommand('copy');
            if (successful) {
                this.showFeedback('JSON copied to clipboard!', 'success');
            } else {
                this.showFeedback('Failed to copy JSON. Please try manually selecting and copying the text.', 'warning');
            }
        } catch (err) {
            console.error('Failed to copy JSON:', err);
            this.showFeedback('Failed to copy JSON. Please try manually selecting and copying the text.', 'warning');
        }
        
        // Clean up
        document.body.removeChild(textarea);
    },
    
    /**
     * Download JSON as file
     */
    downloadJson() {
        // Create filename based on content type and timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const filename = `${this.currentType}-${timestamp}.json`;
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(this.currentJson));
        downloadLink.setAttribute('download', filename);
        downloadLink.style.display = 'none';
        
        // Add to document, click, and remove
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Show feedback
        this.showFeedback(`JSON downloaded as ${filename}`, 'success');
    },
    
    /**
     * Show feedback message
     * @param {string} message - Feedback message
     * @param {string} type - Message type (success, warning, danger)
     */
    showFeedback(message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alert.style.bottom = '20px';
        alert.style.right = '20px';
        alert.style.maxWidth = '300px';
        alert.style.zIndex = '9999';
        
        // Set alert content
        alert.innerHTML = `
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        `;
        
        // Add to document
        document.body.appendChild(alert);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(alert);
            }, 150);
        }, 3000);
        
        // Add click event for manual dismissal
        const closeButton = alert.querySelector('.close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                alert.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(alert);
                }, 150);
            });
        }
    }
};

// Make ExportManager globally available
window.ExportManager = ExportManager;