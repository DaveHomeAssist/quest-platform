#!/bin/sh
# Build script for Vercel — flatten monorepo into dist/
set -e

mkdir -p dist/mlb dist/festival dist/shared

# Copy shared core
cp -r shared/js dist/shared/js

# Copy MLB product
cp -r products/mlb/* dist/mlb/

# Copy Festival product
cp -r products/festival/* dist/festival/

echo "Build complete: dist/mlb + dist/festival + dist/shared"
