const express=require('express');
const router=express.Router();
const {protect}=require('../middleware/auth');
const Player=require('../models/Player');
const Achievement=require('../models/Achievement');
const out=(a,p)=>{const c=a.condition||{},r=a.reward||{},u=p.progress?.achievements?.[a.id]||false;return{id:a.id,title:a.name||a.id,description:a.description||'',condition:{type:c.type||'general',target:String(c.target||''),value:Number(c.value||c.amount||1)},rewards:{nyankoPoints:Number(r.nyankoPoints||r.points||0),items:Array.isArray(r.items)?r.items:[]},secret:Boolean(a.secret),unlocked:Boolean(u),unlockedAt:u===true?(p.updatedAt?.toISOString?.()||null):null};};
router.get('/',protect,async(req,res)=>{try{const p=await Player.findOne({userId:req.user._id});const as=await Achievement.find({}).lean();let data=as.map(a=>out(a,p));if(req.query.unlocked!==undefined){const v=req.query.unlocked==='true';data=data.filter(a=>a.unlocked===v);}res.json({success:true,data});}catch(e){res.status(500).json({success:false,message:e.message});}});
module.exports=router;
