#!/bin/bash

# Next.jsアプリをビルド
echo "Building Next.js app..."
npm run build

# Capacitorプロジェクトを同期
echo "Syncing Capacitor project..."
npx cap sync

# iOSプロジェクトを開く
echo "Opening iOS project..."
npx cap open ios

# Androidプロジェクトを開く
echo "Opening Android project..."
npx cap open android

echo "Build process completed!"
