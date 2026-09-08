const express=require('express');
const router=express.Router();
const {protect}=require('../middleware/auth');
const Player=require('../models/Player');
const Battle=require('../models/Battle');
const User=require('../models/User');
router.get('/player',protect,async(req,res)=>{try{const p=await Player.findOne({userId:req.user._id});const x=p.progress||{};const total=Number(x.battleCount||0),wins=Number(x.winCount||0);res.json({success:true,data:{totalBattles:total,winRate:total?wins/total:0,totalDamageDealt:Number(x.totalDamageDealt||0),totalDamageTaken:Number(x.totalDamageTaken||0),totalExperience:Number(x.experience||0),totalPoints:Number(p.points||0),favoriteCat:null,playTime:Number(x.playTime||0)}});}catch(e){res.status(500).json({success:false,message:e.message});}});
router.get('/leaderboard',protect,async(req,res)=>{try{const limit=Math.max(1,Math.min(100,Number(req.query.limit||100)));const type=req.query.type||'points';const ps=await Player.find({}).sort(type==='level'?{'progress.level':-1,points:-1}:{points:-1}).limit(limit).lean();const ids=ps.map(p=>p.userId);const users=await User.find({_id:{$in:ids}}).select('username').lean();const names=new Map(users.map(u=>[String(u._id),u.username]));const data=ps.map((p,i)=>({rank:i+1,playerId:String(p._id),username:names.get(String(p.userId))||p.name,level:Number(p.progress?.level||1),score:Number(p.points||0),avatar:null}));res.json({success:true,data});}catch(e){res.status(500).json({success:false,message:e.message});}});
module.exports=router;
