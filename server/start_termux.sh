#!/data/data/com.termux/files/usr/bin/bash

# にゃんこ大戦争サーバー起動スクリプト（Termux用）

echo "🐱 にゃんこ大戦争サーバーを起動します..."
echo "========================================"

# 環境設定
export NODE_ENV=development
export PORT=8080
export MONGODB_URI="mongodb://localhost:27017/nyankowars"
export JWT_SECRET="nyanko_termux_secret_2024"
export JWT_EXPIRE="30d"

# ディレクトリ移動
cd "$(dirname "$0")"

# MongoDB起動（Termuxの場合）
if ! pgrep -x "mongod" > /dev/null; then
    echo "🚀 MongoDBを起動しています..."
    termux-setup-storage
    mkdir -p ~/data/db
    mongod --dbpath ~/data/db --fork --logpath ~/data/mongod.log
    sleep 3
fi

# Node.js依存関係確認
if [ ! -d "node_modules" ]; then
    echo "📦 npmパッケージをインストールしています..."
    npm install
fi

# CSVデータ生成
if [ ! -d "data/csv" ]; then
    echo "📊 ゲームデータを生成しています..."
    node scripts/generate_data.js
fi

# サーバー起動
echo "🌐 ゲームサーバーを起動しています..."
echo "========================================"
echo "アクセス先: http://localhost:8080"
echo "APIドキュメント: http://localhost:8080/api-docs"
echo "管理画面: http://localhost:8080/admin"
echo "========================================"

# サーバー起動
npm start