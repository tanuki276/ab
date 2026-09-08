const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Player = require('../models/Player');
const Quest = require('../models/Quest');

const response = (q, p) => {
    const c = q.condition || {}, r = q.reward || {};
    const progress = Number(p.progress?.quests?.[q.id] || 0);
    return { id: q.id, type: c.type || 'general', title: q.name || q.id, description: q.description || '', condition: { type: c.type || 'general', target: String(c.target || ''), amount: Number(c.amount || c.value || 1) }, rewards: { experience: Number(r.experience || r.exp || 0), nyankoPoints: Number(r.nyankoPoints || r.points || 0), items: Array.isArray(r.items) ? r.items : [] }, timeLimit: r.timeLimit || null, repeatable: Boolean(q.repeatable), progress, completed: progress >= Number(c.amount || c.value || 1) };
};
router.get('/', protect, async (req, res) => { try { const p = await Player.findOne({ userId: req.user._id }); const filter = req.query.type ? { 'condition.type': req.query.type } : {}; const qs = await Quest.find(filter).lean(); res.json({ success: true, data: qs.map(q => response(q, p)) }); } catch (e) { res.status(500).json({ success:false,message:e.message }); } });
router.post('/:id/claim', protect, async (req, res) => { try { const p = await Player.findOne({ userId: req.user._id }); const q = await Quest.findOne({ id: req.params.id }).lean(); if (!q) return res.status(404).json({success:false,message:'クエストが見つかりません'}); const data = response(q,p); if (!data.completed) return res.status(400).json({success:false,message:'クエスト未達成です'}); const claimed = p.progress?.claimedQuests || {}; if (claimed[q.id] && !q.repeatable) return res.status(400).json({success:false,message:'受取済みです'}); const r=q.reward||{}; p.points += Number(r.nyankoPoints||r.points||0); p.progress={...(p.progress||{}),experience:Number(p.progress?.experience||0)+Number(r.experience||r.exp||0),claimedQuests:{...claimed,[q.id]:true}}; await p.save(); res.json({success:true,data:{quest:data,rewards:{experience:Number(r.experience||r.exp||0),nyankoPoints:Number(r.nyankoPoints||r.points||0),items:Array.isArray(r.items)?r.items:[]},message:'報酬を受け取りました'}}); } catch(e){res.status(500).json({success:false,message:e.message});} });
module.exports=router;
