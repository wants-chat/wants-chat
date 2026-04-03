#!/bin/bash
# Setup script to pre-install node_modules for all templates
# Run this once to create pre-built node_modules that can be copied during deployment

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      Setting up pre-built templates for Fluxez            ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Backend template
echo ""
echo "📦 Installing backend template dependencies..."
cd "$SCRIPT_DIR/backend"
npm install --legacy-peer-deps
if [ $? -eq 0 ]; then
    echo "✅ Backend template ready"
else
    echo "❌ Backend template failed"
    exit 1
fi

# Frontend template
echo ""
echo "📦 Installing frontend template dependencies..."
cd "$SCRIPT_DIR/frontend"
npm install --legacy-peer-deps
if [ $? -eq 0 ]; then
    echo "✅ Frontend template ready"
else
    echo "❌ Frontend template failed"
    exit 1
fi

# Mobile template
echo ""
echo "📦 Installing mobile template dependencies..."
cd "$SCRIPT_DIR/mobile"
npm install --legacy-peer-deps
if [ $? -eq 0 ]; then
    echo "✅ Mobile template ready"
else
    echo "❌ Mobile template failed"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                 All templates ready!                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Templates are now pre-built with node_modules."
echo "The deployment service will automatically copy from these templates."
