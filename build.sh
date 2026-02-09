#!/bin/bash

# Build script for AI Conversation Control extension

echo "🏗️  Building AI Conversation Control..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Compile TypeScript
echo "📦 Compiling TypeScript..."
tsc

if [ $? -ne 0 ]; then
  echo "❌ TypeScript compilation failed"
  exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p dist/extension/icons
mkdir -p dist/extension/popup
mkdir -p dist/extension/onboarding

# Copy manifest
echo "📋 Copying manifest..."
cp extension/manifest.json dist/extension/

# Copy HTML files
echo "🌐 Copying HTML files..."
cp extension/popup/popup.html dist/extension/popup/
cp extension/popup/popup.css dist/extension/popup/
cp extension/onboarding/onboarding.html dist/extension/onboarding/
cp extension/onboarding/onboarding.css dist/extension/onboarding/
cp extension/onboarding/onboarding.js dist/extension/onboarding/

# Create placeholder icons (you should replace these with actual icons)
echo "🎨 Creating placeholder icons..."
# These are just placeholders - replace with actual icon files
for size in 16 48 128; do
  cat > "dist/extension/icons/icon${size}.png" << EOF
PNG placeholder - Replace with actual ${size}x${size} icon
EOF
done

echo "✅ Build complete!"
echo "📦 Extension built in: dist/extension/"
echo ""
echo "To load in Chrome:"
echo "1. Open chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked'"
echo "4. Select the dist/extension directory"
