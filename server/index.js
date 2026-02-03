const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// アプリケーション設定
const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// レート制限
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分
    max: 100 // 各IPからの最大リクエスト数
});
app.use('/api/', limiter);

// 静的ファイル
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/data/csv', express.static(path.join(__dirname, 'data/csv')));

// データベース接続
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nyankowars', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB接続成功'))
.catch(err => console.error('❌ MongoDB接続エラー:', err));

// ルート
const authRoutes = require('./routes/auth');
const playerRoutes = require('./routes/player');
const gachaRoutes = require('./routes/gacha');
const battleRoutes = require('./routes/battle');
const dataRoutes = require('./routes/data');

app.use('/api/auth', authRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/gacha', gachaRoutes);
app.use('/api/battle', battleRoutes);
app.use('/api/data', dataRoutes);

// ヘルスチェック
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// 管理ダッシュボード（簡易版）
app.get('/admin', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>にゃんこ大戦争 - 管理画面</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .container { max-width: 1200px; margin: 0 auto; }
                h1 { color: #333; }
                .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
                .stat-card { background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; }
                .stat-value { font-size: 2em; font-weight: bold; color: #6200EE; }
                .actions { margin: 30px 0; }
                .btn { display: inline-block; padding: 10px 20px; margin: 5px; background: #6200EE; color: white; text-decoration: none; border-radius: 5px; }
                .csv-list { margin-top: 20px; }
                .csv-item { background: white; border: 1px solid #ddd; padding: 10px; margin: 5px 0; display: flex; justify-content: space-between; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🐱 にゃんこ大戦争 管理画面</h1>
                <div class="stats" id="stats"></div>
                <div class="actions">
                    <a href="#" class="btn" onclick="generateCSV()">CSV生成</a>
                    <a href="#" class="btn" onclick="importAllCSV()">全インポート</a>
                    <a href="#" class="btn" onclick="backupData()">バックアップ</a>
                </div>
                <div class="csv-list" id="csvList"></div>
            </div>
            <script>
                async function loadStats() {
                    const res = await fetch('/api/data/stats');
                    const data = await res.json();
                    if (data.success) {
                        const stats = data.stats;
                        document.getElementById('stats').innerHTML = \`
                            <div class="stat-card"><div class="stat-label">プレイヤー</div><div class="stat-value">\${stats.players}</div></div>
                            <div class="stat-card"><div class="stat-label">にゃんこ</div><div class="stat-value">\${stats.cats}</div></div>
                            <div class="stat-card"><div class="stat-label">マップ</div><div class="stat-value">\${stats.maps}</div></div>
                            <div class="stat-card"><div class="stat-label">バトル</div><div class="stat-value">\${stats.battles}</div></div>
                        \`;
                    }
                }
                
                async function loadCSVFiles() {
                    const res = await fetch('/api/data/csv/list');
                    const data = await res.json();
                    if (data.success) {
                        const list = document.getElementById('csvList');
                        list.innerHTML = '<h3>CSVファイル一覧</h3>';
                        data.files.forEach(file => {
                            const item = document.createElement('div');
                            item.className = 'csv-item';
                            item.innerHTML = \`
                                <span>\${file.filename} (\${(file.size / 1024).toFixed(2)} KB)</span>
                                <div>
                                    <button onclick="importCSV('\${file.filename}')">インポート</button>
                                    <button onclick="viewCSV('\${file.filename}')">表示</button>
                                </div>
                            \`;
                            list.appendChild(item);
                        });
                    }
                }
                
                async function importCSV(filename) {
                    const collection = filename.replace('.csv', '');
                    const res = await fetch(\`/api/data/csv/import/\${collection}\`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ filename })
                    });
                    const data = await res.json();
                    alert(data.message);
                    loadStats();
                }
                
                async function generateCSV() {
                    const res = await fetch('/scripts/generate_data.js');
                    if (res.ok) {
                        alert('CSVデータを生成しました。ページをリロードしてください。');
                        location.reload();
                    }
                }
                
                async function importAllCSV() {
                    const collections = ['cats', 'skills', 'maps', 'enemies', 'items', 'bosses', 'quests', 'settings', 'achievements'];
                    for (const collection of collections) {
                        const res = await fetch(\`/api/data/csv/import/\${collection}\`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        });
                        const data = await res.json();
                        console.log(\`\${collection}: \${data.message}\`);
                    }
                    alert('すべてのCSVデータをインポートしました');
                    loadStats();
                }
                
                async function backupData() {
                    const res = await fetch('/api/data/backup', { method: 'POST' });
                    const data = await res.json();
                    alert(data.message);
                }
                
                // 初期化
                loadStats();
                loadCSVFiles();
            </script>
        </body>
        </html>
    `);
});

// 404エラーハンドリング
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'APIエンドポイントが見つかりません' });
});

// エラーハンドリング
app.use((err, req, res, next) => {
    console.error('サーバーエラー:', err);
    res.status(500).json({ 
        success: false, 
        message: 'サーバー内部エラー',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`🚀 サーバー起動: http://localhost:${PORT}`);
    console.log(`📊 管理画面: http://localhost:${PORT}/admin`);
    console.log(`🩺 ヘルスチェック: http://localhost:${PORT}/health`);
});

module.exports = app;