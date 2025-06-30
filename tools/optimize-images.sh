#!/bin/bash
echo "🖼️ Image Optimization Needed:"
echo "❌ profile-picture.jpg (3.2MB) -> should be <200KB"
echo "❌ logo.png (249KB) -> should be <100KB" 
echo "❌ credit-ratings.png (162KB) -> should be <100KB"
echo ""
echo "Use: https://tinypng.com/ or ImageMagick"
echo "convert profile-picture.jpg -quality 85 -resize 800x800^ profile-picture-opt.jpg"
