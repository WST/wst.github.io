#!/bin/bash

# Script to update all favicon and app icons from icon.png
# Usage: ./update-icons.sh

set -e  # Exit on any error

echo "🔄 Updating favicon and app icons..."

# Check if icon.png exists
if [ ! -f "static/icon.png" ]; then
    echo "❌ Error: static/icon.png not found!"
    exit 1
fi

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick (convert) is not installed!"
    echo "Install it with: sudo apt-get install imagemagick"
    exit 1
fi

# Create static directory if it doesn't exist
mkdir -p static

# Generate all icon sizes
echo "📱 Generating favicon (16x16)..."
convert static/icon.png -resize 16x16 static/icon-16x16.png

echo "📱 Generating favicon (32x32)..."
convert static/icon.png -resize 32x32 static/icon-32x32.png

echo "🍎 Generating Apple Touch Icon (180x180)..."
convert static/icon.png -resize 180x180 static/apple-touch-icon.png

echo "🤖 Generating Android Chrome Icon (192x192)..."
convert static/icon.png -resize 192x192 static/android-chrome-192x192.png

echo "🤖 Generating Android Chrome Icon (512x512)..."
convert static/icon.png -resize 512x512 static/android-chrome-512x512.png

# Update web manifest
echo "📄 Updating web manifest..."
cat > static/site.webmanifest << 'EOF'
{
  "name": "Ilya Averkov",
  "short_name": "Ilya Averkov",
  "description": "Backend developer. DevOps engineer. Network administrator.",
  "icons": [
    {
      "src": "/static/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/static/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#000000",
  "background_color": "#000000",
  "display": "standalone",
  "start_url": "/"
}
EOF

echo "✅ All icons updated successfully!"
echo "📁 Generated files:"
ls -la static/*.png static/site.webmanifest

echo ""
echo "🎉 Icons are ready for all platforms:"
echo "   • Desktop browsers (16x16, 32x32)"
echo "   • iOS Safari (180x180)"
echo "   • Android Chrome (192x192, 512x512)"
echo "   • PWA support (web manifest)" 