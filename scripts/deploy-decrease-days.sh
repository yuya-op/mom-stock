#!/bin/bash

# Supabase Edge Function をデプロイするスクリプト
echo "Deploying decrease_days function to Supabase..."

# Supabase CLI がインストールされているか確認
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# 関数をデプロイ
supabase functions deploy decrease_days --no-verify-jwt

echo "Function deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Go to Supabase Dashboard > Edge Functions"
echo "2. Find the 'decrease_days' function"
echo "3. Set up a scheduled task with cron expression: 0 0 * * *"
echo "4. This will run the function every day at midnight UTC"
