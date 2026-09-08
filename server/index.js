const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/data/csv', express.static(path.join(__dirname, 'data/csv')));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nyankowars')
    .then(() => console.log('MongoDB接続成功'))
    .catch(err => console.error('MongoDB接続エラー:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/player', require('./routes/player'));
app.use('/api/gacha', require('./routes/gacha'));
app.use('/api/battle', require('./routes/battle'));
app.use('/api/data', require('./routes/data'));
app.use('/api/shop', require('./routes/shop'));
app.use('/api/quests', require('./routes/quests'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/stats', require('./routes/stats'));

app.get('/health', (req,res)=>res.json({status:'healthy',timestamp:new Date().toISOString(),uptime:process.uptime(),database:mongoose.connection.readyState===1?'connected':'disconnected'}));
app.get('/', (req,res)=>res.json({name:'NyankoWars API',version:'1.1.0',status:'ok'}));
app.use((req,res)=>res.status(404).json({success:false,message:'APIエンドポイントが見つかりません'}));
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({success:false,message:'サーバー内部エラー'});});
app.listen(PORT,()=>console.log(`NyankoWars API: http://localhost:${PORT}`));
module.exports=app;
