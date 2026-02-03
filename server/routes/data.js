const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { protect, isAdmin } = require('../middleware/auth');
const Cat = require('../models/Cat');
const Skill = require('../models/Skill');
const Map = require('../models/Map');
const Enemy = require('../models/Enemy');
const Item = require('../models/Item');
const Boss = require('../models/Boss');
const Quest = require('../models/Quest');
const Setting = require('../models/Setting');
const Achievement = require('../models/Achievement');

// CSVデータディレクトリ
const CSV_DIR = path.join(__dirname, '../data/csv');

// CSVファイル一覧取得
router.get('/csv/list', protect, isAdmin, async (req, res) => {
    try {
        const files = fs.readdirSync(CSV_DIR)
            .filter(file => file.endsWith('.csv'))
            .map(file => {
                const filePath = path.join(CSV_DIR, file);
                const stats = fs.statSync(filePath);
                return {
                    filename: file,
                    size: stats.size,
                    modified: stats.mtime,
                    path: filePath
                };
            });
        
        res.json({ success: true, files });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// CSVファイルを読み込む
router.get('/csv/:filename', protect, isAdmin, async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(CSV_DIR, filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'ファイルが見つかりません' });
        }
        
        const rows = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('end', () => {
                res.json({ success: true, data: rows });
            });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// CSVをMongoDBにインポート
router.post('/csv/import/:collection', protect, isAdmin, async (req, res) => {
    try {
        const collection = req.params.collection;
        const { filename } = req.body;
        const filePath = path.join(CSV_DIR, filename || `${collection}.csv`);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'CSVファイルが見つかりません' });
        }
        
        const rows = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('end', async () => {
                try {
                    let result;
                    switch (collection) {
                        case 'cats':
                            result = await Cat.insertMany(rows);
                            break;
                        case 'skills':
                            result = await Skill.insertMany(rows);
                            break;
                        case 'maps':
                            result = await Map.insertMany(rows);
                            break;
                        case 'enemies':
                            result = await Enemy.insertMany(rows);
                            break;
                        case 'items':
                            result = await Item.insertMany(rows);
                            break;
                        case 'bosses':
                            result = await Boss.insertMany(rows);
                            break;
                        case 'quests':
                            result = await Quest.insertMany(rows);
                            break;
                        case 'settings':
                            result = await Setting.insertMany(rows);
                            break;
                        case 'achievements':
                            result = await Achievement.insertMany(rows);
                            break;
                        default:
                            return res.status(400).json({ success: false, message: '不明なコレクションです' });
                    }
                    
                    res.json({ 
                        success: true, 
                        message: `${collection} インポート完了`,
                        count: result.length 
                    });
                } catch (dbError) {
                    res.status(500).json({ success: false, message: dbError.message });
                }
            });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// エクスポート機能
router.get('/csv/export/:collection', protect, isAdmin, async (req, res) => {
    try {
        const collection = req.params.collection;
        let data;
        
        switch (collection) {
            case 'cats':
                data = await Cat.find({});
                break;
            case 'skills':
                data = await Skill.find({});
                break;
            case 'maps':
                data = await Map.find({});
                break;
            case 'enemies':
                data = await Enemy.find({});
                break;
            case 'items':
                data = await Item.find({});
                break;
            case 'bosses':
                data = await Boss.find({});
                break;
            case 'quests':
                data = await Quest.find({});
                break;
            case 'settings':
                data = await Setting.find({});
                break;
            case 'achievements':
                data = await Achievement.find({});
                break;
            default:
                return res.status(400).json({ success: false, message: '不明なコレクションです' });
        }
        
        if (data.length === 0) {
            return res.status(404).json({ success: false, message: 'データがありません' });
        }
        
        // CSVヘッダー生成（最初のドキュメントのキーを使用）
        const headers = Object.keys(data[0]._doc).filter(key => !key.startsWith('_'));
        const csvContent = [
            headers.join(','),
            ...data.map(item => 
                headers.map(header => 
                    JSON.stringify(item[header])
                ).join(',')
            )
        ].join('\n');
        
        const filename = `${collection}_export_${Date.now()}.csv`;
        const filePath = path.join(CSV_DIR, 'exports', filename);
        
        if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }
        
        fs.writeFileSync(filePath, csvContent, 'utf8');
        
        res.json({ 
            success: true, 
            filename,
            count: data.length,
            downloadUrl: `/api/data/csv/download/exports/${filename}`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ファイルダウンロード
router.get('/csv/download/:type/:filename', protect, isAdmin, async (req, res) => {
    try {
        const { type, filename } = req.params;
        const filePath = path.join(CSV_DIR, type, filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'ファイルが見つかりません' });
        }
        
        res.download(filePath);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// データ統計取得
router.get('/stats', protect, isAdmin, async (req, res) => {
    try {
        const stats = {
            cats: await Cat.countDocuments(),
            skills: await Skill.countDocuments(),
            maps: await Map.countDocuments(),
            enemies: await Enemy.countDocuments(),
            items: await Item.countDocuments(),
            bosses: await Boss.countDocuments(),
            quests: await Quest.countDocuments(),
            settings: await Setting.countDocuments(),
            achievements: await Achievement.countDocuments(),
            players: await require('../models/Player').countDocuments(),
            battles: await require('../models/Battle').countDocuments(),
            gachaLogs: await require('../models/GachaLog').countDocuments()
        };
        
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// データバックアップ
router.post('/backup', protect, isAdmin, async (req, res) => {
    try {
        const backupDir = path.join(__dirname, '../backups', new Date().toISOString().split('T')[0]);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        // 各コレクションをJSONとしてエクスポート
        const collections = ['cats', 'skills', 'maps', 'enemies', 'items', 'bosses', 'quests', 'settings', 'achievements'];
        
        for (const collection of collections) {
            const data = await getCollectionData(collection);
            const filePath = path.join(backupDir, `${collection}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        }
        
        res.json({ 
            success: true, 
            message: 'バックアップ完了',
            backupDir 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// コレクションデータ取得ヘルパー
async function getCollectionData(collection) {
    switch (collection) {
        case 'cats':
            return await Cat.find({});
        case 'skills':
            return await Skill.find({});
        case 'maps':
            return await Map.find({});
        case 'enemies':
            return await Enemy.find({});
        case 'items':
            return await Item.find({});
        case 'bosses':
            return await Boss.find({});
        case 'quests':
            return await Quest.find({});
        case 'settings':
            return await Setting.find({});
        case 'achievements':
            return await Achievement.find({});
        default:
            return [];
    }
}

module.exports = router;