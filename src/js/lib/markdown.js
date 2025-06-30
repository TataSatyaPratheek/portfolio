/**
 * markdown.js - Lightweight Markdown to HTML converter
 * A simple library for rendering basic Markdown syntax without dependencies.
 * 
 * For production use, consider using a more robust library like marked or markdown-it,
 * but this provides a simple fallback that works for basic formatting.
 */

(function() {
    /**
     * Convert Markdown to HTML
     * @param {string} markdown - Markdown text to convert
     * @returns {string} - HTML representation of the Markdown
     */
    function markdownToHtml(markdown) {
        if (!markdown) return '';
        
        let html = markdown;
        
        // Process code blocks first (they might contain syntax that would otherwise be processed)
        html = processCodeBlocks(html);
        
        // Process headings
        html = processHeadings(html);
        
        // Process bold and italic
        html = processBoldAndItalic(html);
        
        // Process links
        html = processLinks(html);
        
        // Process images
        html = processImages(html);
        
        // Process lists
        html = processLists(html);
        
        // Process paragraphs (after everything else)
        html = processParagraphs(html);
        
        return html;
    }
    
    /**
     * Process code blocks
     * @param {string} markdown - Markdown text
     * @returns {string} - Processed text
     */
    function processCodeBlocks(markdown) {
        // Process code blocks (indented with 4 spaces or fenced with ```)
        let html = markdown;
        
        // Fenced code blocks
        html = html.replace(/```([a-z]*)\n([\s\S]*?)\n```/g, function(match, language, code) {
            const lang = language ? ` class="language-${language}"` : '';
            return `<pre><code${lang}>${escapeHtml(code.trim())}</code></pre>`;
        });
        
        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        return html;
    }
    
    /**
     * Process headings
     * @param {string} markdown - Markdown text
     * @returns {string} - Processed text
     */
    function processHeadings(markdown) {
        let html = markdown;
        
        // Replace ATX-style headings (# Heading)
        html = html.replace(/^(#{1,6})\s+(.+?)$/gm, function(match, hashes, content) {
            const level = hashes.length;
            return `<h${level}>${content.trim()}</h${level}>`;
        });
        
        // Replace Setext-style headings
        // Heading 1
        html = html.replace(/^(.+)\n=+$/gm, '<h1>$1</h1>');
        
        // Heading 2
        html = html.replace(/^(.+)\n-+$/gm, '<h2>$1</h2>');
        
        return html;
    }
    
    /**
     * Process bold and italic
     * @param {string} markdown - Markdown text
     * @returns {string} - Processed text
     */
    function processBoldAndItalic(markdown) {
        let html = markdown;
        
        // Bold (** or __)
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        
        // Italic (* or _)
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
        
        return html;
    }
    
    /**
     * Process links
     * @param {string} markdown - Markdown text
     * @returns {string} - Processed text
     */
    function processLinks(markdown) {
        let html = markdown;
        
        // Inline link: [text](url)
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        
        // Automatic links: <url>
        html = html.replace(/<(https?:\/\/[^>]+)>/g, '<a href="$1">$1</a>');
        
        return html;
    }
    
    /**
     * Process images
     * @param {string} markdown - Markdown text
     * @returns {string} - Processed text
     */
    function processImages(markdown) {
        let html = markdown;
        
        // Image: ![alt](url)
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
        
        return html;
    }
    
    /**
     * Process lists
     * @param {string} markdown - Markdown text
     * @returns {string} - Processed text
     */
    function processLists(markdown) {
        let html = markdown;
        
        // Unordered lists
        // Replace sequences of lines starting with * or - or + with <ul><li>...</li></ul>
        html = html.replace(/(?:^|\n)((?:\s*[-*+]\s+.+\n?)+)/g, function(match, list) {
            // Process each list item
            const items = list.match(/\s*[-*+]\s+(.+)/g).map(item => {
                // Extract content (remove bullet and whitespace)
                const content = item.replace(/\s*[-*+]\s+/, '');
                return `<li>${content}</li>`;
            }).join('');
            
            return `<ul>${items}</ul>`;
        });
        
        // Ordered lists
        // Replace sequences of lines starting with 1. 2. etc with <ol><li>...</li></ol>
        html = html.replace(/(?:^|\n)((?:\s*\d+\.\s+.+\n?)+)/g, function(match, list) {
            // Process each list item
            const items = list.match(/\s*\d+\.\s+(.+)/g).map(item => {
                // Extract content (remove number, dot, and whitespace)
                const content = item.replace(/\s*\d+\.\s+/, '');
                return `<li>${content}</li>`;
            }).join('');
            
            return `<ol>${items}</ol>`;
        });
        
        return html;
    }
    
    /**
     * Process paragraphs
     * @param {string} markdown - Markdown text
     * @returns {string} - Processed text
     */
    function processParagraphs(markdown) {
        let html = markdown;
        
        // Split by double newlines (paragraph breaks)
        const blocks = html.split(/\n\s*\n/);
        
        // Process each block
        html = blocks.map(block => {
            // Skip if the block is already wrapped in HTML
            if (block.trim() === '' || 
                block.trim().startsWith('<h') || 
                block.trim().startsWith('<ul') || 
                block.trim().startsWith('<ol') || 
                block.trim().startsWith('<pre') || 
                block.trim().startsWith('<p')) {
                return block;
            }
            
            // Wrap in paragraph tags
            return `<p>${block.trim()}</p>`;
        }).join('\n\n');
        
        return html;
    }
    
    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    function escapeHtml(text) {
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, m => escapeMap[m]);
    }
    
    // Create MarkdownIt-like object for compatibility
    const markdownit = function() {
        return {
            render: markdownToHtml
        };
    };
    
    // Expose to global scope
    window.markdownit = markdownit;
})();