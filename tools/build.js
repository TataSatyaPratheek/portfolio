#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Building portfolio...');

// Copy CSS files to dist
const copyCSS = () => {
    const cssFiles = ['style.css', 'theme.css'];
    const componentFiles = ['animations.css', 'cards.css', 'footer.css', 'forms.css', 'header.css'];
    
    // Combine all CSS into one file
    let combinedCSS = '';
    
    cssFiles.forEach(file => {
        if (fs.existsSync(`src/css/${file}`)) {
            combinedCSS += fs.readFileSync(`src/css/${file}`, 'utf8') + '\n';
        }
    });
    
    componentFiles.forEach(file => {
        if (fs.existsSync(`src/css/components/${file}`)) {
            combinedCSS += fs.readFileSync(`src/css/components/${file}`, 'utf8') + '\n';
        }
    });
    
    fs.writeFileSync('dist/css/main.css', combinedCSS);
    console.log('✅ CSS bundled');
};

// Copy optimized images

const copyImages = () => {
    if (fs.existsSync('assets/images')) {
        const images = fs.readdirSync('assets/images');
        images.forEach(img => {
            // Skip backup files
            if (!img.includes('-backup') && !img.includes('-opt')) {
                fs.copyFileSync(`assets/images/${img}`, `dist/images/${img}`);
            }
        });
        console.log('✅ Images copied (excluding backups)');
    }
};

copyCSS();
copyImages();
console.log('🎉 Build complete!');

// Add JS bundling function
const copyJS = () => {
    const jsFiles = [
        'core/utils.js',
        'core/cache.js', 
        'core/theme.js',
        'core/init.js',
        'components/loader.js',
        'components/header.js',
        'components/footer.js',
        'lib/markdown.js',
        'modules/blogs.js',
        'modules/contact.js',
        'modules/experience.js',
        'modules/projects.js',
        'modules/skills.js'
    ];
    
    let combinedJS = '';
    jsFiles.forEach(file => {
        if (fs.existsSync(`src/js/${file}`)) {
            combinedJS += fs.readFileSync(`src/js/${file}`, 'utf8') + '\n';
        }
    });
    
    fs.writeFileSync('dist/js/main.js', combinedJS);
    console.log('✅ JavaScript bundled');
};

// Update the execution section
copyCSS();
copyJS();
copyImages();

// Check for oversized images

const checkImageSizes = () => {
    const images = fs.readdirSync('assets/images');
    images.forEach(img => {
        // Skip backup files in size checking too
        if (!img.includes('-backup') && !img.includes('-opt')) {
            const stats = fs.statSync(`assets/images/${img}`);
            const sizeMB = stats.size / (1024 * 1024);
            if (sizeMB > 0.2) {
                console.log(`⚠️  Large image: ${img} (${sizeMB.toFixed(1)}MB) - optimize recommended`);
            }
        }
    });
};

checkImageSizes();
