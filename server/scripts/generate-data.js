const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB接続
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nyankowars');

// CSV保存ディレクトリ
const csvDir = path.join(__dirname, '../data/csv');
if (!fs.existsSync(csvDir)) {
    fs.mkdirSync(csvDir, { recursive: true });
}

// 1. キャラクターデータ（猫）生成
const generateCatsCSV = () => {
    const cats = [
        // ID,名前,レアリティ,タイプ,基本攻撃力,基本防御力,基本体力,成長率,コスト,説明
        ['cat001', '通常にゃんこ', 'normal', 'basic', '10', '5', '100', '1.0', '100', 'バランスの取れた基本のにゃんこ'],
        ['cat002', '戦士にゃんこ', 'rare', 'warrior', '20', '15', '150', '1.2', '200', '攻撃力が高い戦士タイプ'],
        ['cat003', '魔法にゃんこ', 'epic', 'mage', '30', '5', '120', '1.5', '300', '遠距離攻撃が得意な魔法使い'],
        ['cat004', '騎士にゃんこ', 'rare', 'tank', '15', '30', '200', '1.1', '250', '防御力が高いタンクタイプ'],
        ['cat005', '忍者にゃんこ', 'epic', 'assassin', '40', '10', '90', '1.8', '350', '素早く敵を仕留める暗殺者'],
        ['cat006', '僧侶にゃんこ', 'rare', 'healer', '10', '10', '130', '1.0', '180', '味方を回復するサポーター'],
        ['cat007', 'ドラゴンにゃんこ', 'legendary', 'dragon', '50', '25', '250', '2.0', '500', '最強クラスの火力を持つ'],
        ['cat008', '天使にゃんこ', 'legendary', 'angel', '25', '20', '180', '1.8', '450', '特殊スキルを持つ神聖な存在'],
        ['cat009', '海賊にゃんこ', 'epic', 'pirate', '35', '15', '140', '1.6', '320', '金貨を多く獲得できる'],
        ['cat010', 'ロボにゃんこ', 'epic', 'robot', '28', '25', '160', '1.4', '310', '機械仕掛けの耐久型'],
        ['cat011', 'ゾンビにゃんこ', 'rare', 'undead', '18', '12', '300', '1.1', '220', '体力が非常に高い'],
        ['cat012', 'サイボーグにゃんこ', 'epic', 'cyborg', '32', '18', '170', '1.7', '340', 'ハイテク装備の強化型'],
        ['cat013', 'プリンセスにゃんこ', 'legendary', 'royal', '22', '22', '190', '1.9', '480', '全ステータスが高い王族'],
        ['cat014', 'ヴァンパイアにゃんこ', 'epic', 'vampire', '38', '14', '130', '1.7', '330', '体力吸収スキルを持つ'],
        ['cat015', 'ベホマにゃんこ', 'rare', 'priest', '12', '15', '160', '1.2', '210', '大回復スキルを持つ'],
        ['cat016', 'ギガンテスにゃんこ', 'legendary', 'giant', '45', '35', '400', '1.5', '550', '超巨大で圧倒的な火力'],
        ['cat017', 'フェニックスにゃんこ', 'legendary', 'phoenix', '30', '20', '220', '2.2', '520', '復活スキルを持つ不死鳥'],
        ['cat018', 'サイクロプスにゃんこ', 'epic', 'cyclops', '42', '28', '240', '1.6', '380', '一撃必殺の目つぶし攻撃'],
        ['cat019', 'ケルベロスにゃんこ', 'epic', 'beast', '36', '22', '210', '1.7', '360', '3つの頭を持つ魔獣'],
        ['cat020', 'ゴーレムにゃんこ', 'rare', 'golem', '20', '40', '350', '1.0', '280', '鉄壁の防御力']
    ];

    const header = [
        'ID', '名前', 'レアリティ', 'タイプ', '基本攻撃力', '基本防御力', 
        '基本体力', '成長率', 'コスト', '説明'
    ].join(',');

    const rows = cats.map(cat => cat.join(','));
    const content = [header, ...rows].join('\n');

    fs.writeFileSync(path.join(csvDir, 'cats.csv'), content, 'utf8');
    console.log('✅ cats.csv 生成完了 (20種類)');
};

// 2. スキルデータ生成
const generateSkillsCSV = () => {
    const skills = [
        // ID,名前,タイプ,効果値,消費MP,説明,対象,発動確率
        ['skill001', '爪でひっかく', 'attack', '1.2', '0', '通常攻撃の1.2倍のダメージ', '単体', '100'],
        ['skill002', 'にゃんこパンチ', 'attack', '1.5', '10', '強力な一撃', '単体', '100'],
        ['skill003', 'にゃんこキック', 'attack', '1.8', '15', '威力の高い蹴り技', '単体', '100'],
        ['skill004', '連続攻撃', 'attack', '1.0', '5', '2回連続で攻撃', '単体', '100'],
        ['skill005', '全体攻撃', 'attack', '0.7', '20', '敵全体にダメージ', '全体', '100'],
        ['skill006', '防御アップ', 'buff', '0.5', '10', '味方単体の防御力50%アップ', '味方単体', '100'],
        ['skill007', '攻撃アップ', 'buff', '0.5', '10', '味方単体の攻撃力50%アップ', '味方単体', '100'],
        ['skill008', '回復', 'heal', '30', '10', '味方単体のHPを回復', '味方単体', '100'],
        ['skill009', '大回復', 'heal', '100', '20', '味方単体のHPを大回復', '味方単体', '100'],
        ['skill010', '全体回復', 'heal', '50', '30', '味方全体のHPを回復', '味方全体', '100'],
        ['skill011', '毒攻撃', 'dot', '0.3', '15', '3ターン毒ダメージ', '単体', '80'],
        ['skill012', '麻痺攻撃', 'debuff', '0.0', '20', '1ターン行動不能', '単体', '60'],
        ['skill013', '防御ダウン', 'debuff', '0.3', '15', '敵単体の防御力30%ダウン', '敵単体', '90'],
        ['skill014', '攻撃ダウン', 'debuff', '0.3', '15', '敵単体の攻撃力30%ダウン', '敵単体', '90'],
        ['skill015', 'クリティカル', 'attack', '2.5', '25', '必ずクリティカル', '単体', '100'],
        ['skill016', '回避アップ', 'buff', '0.4', '10', '味方単体の回避率アップ', '味方単体', '100'],
        ['skill017', '反撃', 'counter', '1.0', '0', '攻撃を受けた時に自動発動', '単体', '30'],
        ['skill018', '復活', 'revive', '0.5', '50', '戦闘不能の味方を復活', '味方単体', '100'],
        ['skill019', 'MP回復', 'heal_mp', '20', '0', '味方単体のMP回復', '味方単体', '100'],
        ['skill020', '全体MP回復', 'heal_mp', '10', '25', '味方全体のMP回復', '味方全体', '100']
    ];

    const header = [
        'ID', '名前', 'タイプ', '効果値', '消費MP', '説明', '対象', '発動確率'
    ].join(',');

    const rows = skills.map(skill => skill.join(','));
    const content = [header, ...rows].join('\n');

    fs.writeFileSync(path.join(csvDir, 'skills.csv'), content, 'utf8');
    console.log('✅ skills.csv 生成完了 (20種類)');
};

// 3. マップデータ生成
const generateMapsCSV = () => {
    const maps = [
        // ID,名前,章,ステージ,敵IDリスト,敵レベル,獲得経験値,獲得ポイント,クリア条件,制限ターン
        ['map001', '草原の入り口', '1', '1', 'enemy001,enemy002', '1', '100', '50', '敵全滅', '20'],
        ['map002', '森の小道', '1', '2', 'enemy001,enemy002,enemy003', '1', '120', '60', '敵全滅', '20'],
        ['map003', '洞窟の奥', '1', '3', 'enemy002,enemy003,enemy004', '2', '150', '75', '敵全滅', '25'],
        ['map004', '湖のほとり', '1', '4', 'enemy003,enemy004,enemy005', '2', '180', '90', '敵全滅', '25'],
        ['map005', '魔王城前', '1', '5', 'enemy004,enemy005,boss001', '3', '250', '150', 'ボス撃破', '30'],
        ['map006', '灼熱の砂漠', '2', '1', 'enemy006,enemy007', '3', '200', '100', '敵全滅', '20'],
        ['map007', '遺跡の内部', '2', '2', 'enemy007,enemy008,enemy009', '4', '240', '120', '敵全滅', '25'],
        ['map008', '古代神殿', '2', '3', 'enemy008,enemy009,enemy010', '5', '280', '140', '敵全滅', '25'],
        ['map009', '溶岩地帯', '2', '4', 'enemy009,enemy010,enemy011', '5', '320', '160', '敵全滅', '30'],
        ['map010', '炎の山頂', '2', '5', 'enemy010,enemy011,boss002', '6', '400', '200', 'ボス撃破', '35'],
        ['map011', '氷河平原', '3', '1', 'enemy012,enemy013', '6', '300', '150', '敵全滅', '20'],
        ['map012', '氷の洞窟', '3', '2', 'enemy013,enemy014,enemy015', '7', '360', '180', '敵全滅', '25'],
        ['map013', '雪山の頂', '3', '3', 'enemy014,enemy015,enemy016', '8', '420', '210', '敵全滅', '25'],
        ['map014', '永久凍土', '3', '4', 'enemy015,enemy016,enemy017', '9', '480', '240', '敵全滅', '30'],
        ['map015', '極寒の宮殿', '3', '5', 'enemy016,enemy017,boss003', '10', '600', '300', 'ボス撃破', '35'],
        ['map016', '空中庭園', '4', '1', 'enemy018,enemy019', '10', '400', '200', '敵全滅', '20'],
        ['map017', '雲の上の城', '4', '2', 'enemy019,enemy020,enemy021', '11', '480', '240', '敵全滅', '25'],
        ['map018', '天空の回廊', '4', '3', 'enemy020,enemy021,enemy022', '12', '560', '280', '敵全滅', '25'],
        ['map019', '神々の間', '4', '4', 'enemy021,enemy022,enemy023', '13', '640', '320', '敵全滅', '30'],
        ['map020', '天界の門', '4', '5', 'enemy022,enemy023,boss004', '15', '800', '400', 'ボス撃破', '35']
    ];

    const header = [
        'ID', '名前', '章', 'ステージ', '敵IDリスト', '敵レベル', 
        '獲得経験値', '獲得ポイント', 'クリア条件', '制限ターン'
    ].join(',');

    const rows = maps.map(map => map.join(','));
    const content = [header, ...rows].join('\n');

    fs.writeFileSync(path.join(csvDir, 'maps.csv'), content, 'utf8');
    console.log('✅ maps.csv 生成完了 (20マップ)');
};

// 4. 敵データ生成
const generateEnemiesCSV = () => {
    const enemies = [
        // ID,名前,タイプ,攻撃力,防御力,体力,速度,獲得経験値,獲得ポイント,出現確率,特殊スキル
        ['enemy001', 'スライム', 'normal', '5', '3', '50', '0.8', '10', '5', '40', 'skill001'],
        ['enemy002', 'ゴブリン', 'normal', '8', '5', '80', '1.0', '15', '8', '35', 'skill001'],
        ['enemy003', 'オーク', 'normal', '12', '8', '120', '0.9', '20', '12', '30', 'skill002'],
        ['enemy004', 'スケルトン', 'undead', '10', '6', '100', '1.1', '18', '10', '25', 'skill011'],
        ['enemy005', 'コボルト', 'normal', '7', '4', '70', '1.2', '12', '6', '40', 'skill001'],
        ['enemy006', 'マンドラゴラ', 'plant', '15', '10', '150', '0.7', '25', '15', '20', 'skill015'],
        ['enemy007', 'ミノタウロス', 'beast', '25', '20', '200', '0.8', '35', '20', '15', 'skill003'],
        ['enemy008', 'ハーピー', 'flying', '18', '12', '130', '1.5', '28', '18', '25', 'skill005'],
        ['enemy009', 'ケンタウロス', 'beast', '22', '15', '180', '1.3', '32', '22', '20', 'skill004'],
        ['enemy010', 'グリフィン', 'flying', '30', '25', '250', '1.4', '40', '25', '10', 'skill006'],
        ['enemy011', 'フェニックス', 'bird', '35', '20', '220', '1.6', '45', '30', '5', 'skill018'],
        ['enemy012', '氷の精霊', 'ice', '20', '15', '160', '1.2', '30', '20', '25', 'skill013'],
        ['enemy013', '雪だるま', 'ice', '15', '25', '200', '0.6', '25', '15', '30', 'skill007'],
        ['enemy014', '氷竜', 'dragon', '40', '30', '300', '1.3', '50', '35', '10', 'skill015'],
        ['enemy015', 'トロール', 'giant', '28', '18', '240', '0.9', '38', '25', '20', 'skill002'],
        ['enemy016', 'ウィルオウィスプ', 'spirit', '22', '5', '100', '1.8', '26', '18', '30', 'skill005'],
        ['enemy017', '氷の巨人', 'giant', '45', '35', '400', '0.7', '60', '40', '5', 'skill003'],
        ['enemy018', '天使の兵士', 'angel', '30', '25', '220', '1.5', '42', '28', '15', 'skill008'],
        ['enemy019', 'ペガサス', 'flying', '32', '28', '260', '1.7', '46', '32', '10', 'skill009'],
        ['enemy020', 'セラフ', 'angel', '38', '30', '280', '1.6', '52', '36', '8', 'skill010']
    ];

    const header = [
        'ID', '名前', 'タイプ', '攻撃力', '防御力', '体力', '速度', 
        '獲得経験値', '獲得ポイント', '出現確率', '特殊スキル'
    ].join(',');

    const rows = enemies.map(enemy => enemy.join(','));
    const content = [header, ...rows].join('\n');

    fs.writeFileSync(path.join(csvDir, 'enemies.csv'), content, 'utf8');
    console.log('✅ enemies.csv 生成完了 (20種類)');
};

// 5. アイテムデータ生成
const generateItemsCSV = () => {
    const items = [
        // ID,名前,タイプ,効果値,値段,説明,最大所持数,使用可能場所
        ['item001', '回復薬', 'heal', '50', '100', 'HPを50回復する', '99', 'any'],
        ['item002', '強回復薬', 'heal', '200', '300', 'HPを200回復する', '99', 'any'],
        ['item003', '万能薬', 'heal_all', '100', '500', '味方全体のHPを100回復する', '99', 'any'],
        ['item004', '復活薬', 'revive', '50', '1000', '戦闘不能の味方を復活させる', '99', 'any'],
        ['item005', '攻撃薬', 'buff_atk', '0.3', '400', '攻撃力を30%アップする', '99', 'any'],
        ['item006', '防御薬', 'buff_def', '0.3', '400', '防御力を30%アップする', '99', 'any'],
        ['item007', 'スピード薬', 'buff_spd', '0.5', '600', '速度を50%アップする', '99', 'any'],
        ['item008', 'MP回復薬', 'heal_mp', '30', '200', 'MPを30回復する', '99', 'any'],
        ['item009', '強MP回復薬', 'heal_mp', '100', '600', 'MPを100回復する', '99', 'any'],
        ['item010', '毒消し', 'cure', '0', '150', '毒状態を治療する', '99', 'any'],
        ['item011', '目覚まし草', 'cure', '0', '150', '麻痺状態を治療する', '99', 'any'],
        ['item012', '聖なる水', 'cure', '0', '150', '呪い状態を治療する', '99', 'any'],
        ['item013', 'にゃんこ缶', 'heal', '30', '50', 'HPを30回復する（にゃんこ専用）', '99', 'any'],
        ['item014', '特製にゃんこ缶', 'heal', '100', '150', 'HPを100回復する（にゃんこ専用）', '99', 'any'],
        ['item015', 'にゃんこパワー', 'buff_atk', '0.5', '250', '攻撃力を50%アップ（にゃんこ専用）', '99', 'any'],
        ['item016', 'にゃんこガード', 'buff_def', '0.5', '250', '防御力を50%アップ（にゃんこ専用）', '99', 'any'],
        ['item017', 'にゃんこスピード', 'buff_spd', '0.8', '350', '速度を80%アップ（にゃんこ専用）', '99', 'any'],
        ['item018', '進化の石', 'evolve', '0', '5000', 'にゃんこを進化させる', '99', 'town'],
        ['item019', '強化の書', 'enhance', '0', '2000', 'にゃんこのスキルレベルを上げる', '99', 'town'],
        ['item020', 'ガチャチケット', 'gacha', '0', '1000', 'ガチャを1回引ける', '99', 'town']
    ];

    const header = [
        'ID', '名前', 'タイプ', '効果値', '値段', '説明', '最大所持数', '使用可能場所'
    ].join(',');

    const rows = items.map(item => item.join(','));
    const content = [header, ...rows].join('\n');

    fs.writeFileSync(path.join(csvDir, 'items.csv'), content, 'utf8');
    console.log('✅ items.csv 生成完了 (20種類)');
};

// 6. ボスデータ生成
const generateBossesCSV = () => {
    const bosses = [
        // ID,名前,章,攻撃力,防御力,体力,速度,特殊スキル1,特殊スキル2,特殊スキル3,弱体効果,ドロップアイテム
        ['boss001', '魔王にゃんこ', '1', '50', '30', '500', '1.0', 'skill003', 'skill006', 'skill009', 'fire', 'item004'],
        ['boss002', '炎の魔王', '2', '80', '50', '800', '0.9', 'skill005', 'skill015', 'skill008', 'water', 'item005'],
        ['boss003', '氷の女王', '3', '70', '60', '700', '1.2', 'skill013', 'skill007', 'skill012', 'fire', 'item006'],
        ['boss004', '天空の神', '4', '100', '80', '1000', '1.5', 'skill010', 'skill015', 'skill018', 'lightning', 'item018'],
        ['boss005', '暗黒竜王', '5', '120', '100', '1200', '1.3', 'skill005', 'skill015', 'skill020', 'light', 'item019'],
        ['boss006', '大地の巨人', '6', '90', '150', '1500', '0.7', 'skill002', 'skill007', 'skill017', 'air', 'item020'],
        ['boss007', '海の支配者', '7', '110', '70', '900', '1.4', 'skill011', 'skill014', 'skill009', 'lightning', 'item015'],
        ['boss008', '冥界の王', '8', '130', '90', '1100', '1.6', 'skill012', 'skill015', 'skill018', 'holy', 'item016'],
        ['boss009', '混沌の化身', '9', '150', '120', '1300', '1.8', 'skill005', 'skill010', 'skill015', 'all', 'item017'],
        ['boss010', '終焉の主', '10', '200', '150', '2000', '2.0', 'skill015', 'skill018', 'skill020', 'none', 'item018,item019,item020']
    ];

    const header = [
        'ID', '名前', '章', '攻撃力', '防御力', '体力', '速度', 
        '特殊スキル1', '特殊スキル2', '特殊スキル3', '弱体効果', 'ドロップアイテム'
    ].join(',');

    const rows = bosses.map(boss => boss.join(','));
    const content = [header, ...rows].join('\n');

    fs.writeFileSync(path.join(csvDir, 'bosses.csv'), content, 'utf8');
    console.log('✅ bosses.csv 生成完了 (10種類)');
};

// 7. モデルデータ（機械学習用）
const generateModelsCSV = () => {
    // バトル予測モデル用データ
    const battleData = [
        // 戦闘ID,プレイヤー戦闘力,敵戦闘力,プレイヤー勝利数,敵勝利数,勝敗結果,戦闘時間(秒),使用スキル数
        ['battle001', '1500', '1200', '10', '5', 'win', '120', '8'],
        ['battle002', '1800', '2000', '15', '8', 'lose', '180', '12'],
        ['battle003', '2200', '1900', '20', '12', 'win', '150', '10'],
        ['battle004', '1600', '1700', '12', '9', 'lose', '200', '15'],
        ['battle005', '2500', '2100', '25', '15', 'win', '130', '9'],
        ['battle006', '1900', '2200', '18', '11', 'lose', '190', '14'],
        ['battle007', '2300', '2000', '22', '13', 'win', '140', '11'],
        ['battle008', '1700', '1800', '14', '10', 'lose', '210', '16'],
        ['battle009', '2600', '2300', '27', '16', 'win', '125', '8'],
        ['battle010', '2000', '2400', '19', '12', 'lose', '195', '13']
    ];

    const header = [
        '戦闘ID', 'プレイヤー戦闘力', '敵戦闘力', 'プレイヤー勝利数', '敵勝利数', 
        '勝敗結果', '戦闘時間(秒)', '使用スキル数'
    ].join(',');

    const rows = battleData.map(data => data.join(','));
    const content = [header, ...rows].join('\n');

    fs.writeFileSync(path.join(csvDir, 'battle_models.csv'), content, 'utf8');
    console.log('✅ battle_models.csv 生成完了 (10レコード)');
};

// 8. プレイヤースタッツデータ
const generatePlayerStatsCSV = () => {
    const stats = [
        // プレイヤーID,レベル,総獲得経験値,総獲得ポイント,バトル数,勝利数,敗北数,平均戦闘時間,最長連勝
        ['player001', '10', '5000', '2500', '50', '35', '15', '150', '8'],
        ['player002', '15', '10000', '5000', '80', '60', '20', '140', '12'],
        ['player003', '20', '20000', '10000', '120', '95', '25', '130', '15'],
        ['player004', '25', '35000', '17500', '180', '140', '40', '125', '18'],
        ['player005', '30', '50000', '25000', '250', '200', '50', '120', '22'],
        ['player006', '35', '70000', '35000', '320', '260', '60', '115', '25'],
        ['player007', '40', '100000', '50000', '400', '330', '70', '110', '30'],
        ['player008', '45', '135000', '67500', '480', '400', '80', '105', '35'],
        ['player009', '50', '175000', '87500', '560', '470', '90', '100', '40'],
        ['player010', '55', '220000', '110000', '650', '550', '100', '95', '45']
    ];

    const header = [
        'プレイヤーID', 'レベル', '総獲得経験値', '総獲得ポイント', 'バトル数', 
        '勝利数', '敗北数', '平均戦闘時間', '最長連勝'
    ].join(',');

    const rows = stats.map(stat => stat.join(','));
    const content = [header, ...rows].join('\n');

    fs.writeFileSync(path.join(csvDir, 'player_stats.csv'), content, 'utf8');
    console.log('✅ player_stats.csv 生成完了 (10レコード)');
};

// 9. ガチャ確率データ
const generateGachaRatesCSV = () => {
    const rates = [
        // ガチャタイプ,レアリティ,確率(%),最低保証回数,アイテムIDリスト
        ['normal', 'normal', '60', '10', 'cat001,cat002,cat003,cat004'],
        ['normal', 'rare', '25', '20', 'cat005,cat006,cat007,cat008'],
        ['normal', 'epic', '10', '50', 'cat009,cat010,cat011,cat012'],
        ['normal', 'legendary', '5', '100', 'cat013,cat014,cat015,cat016'],
        ['premium', 'normal', '40', '5', 'cat001,cat002,cat003,cat004'],
        ['premium', 'rare', '30', '10', 'cat005,cat006,cat007,cat008'],
        ['premium', 'epic', '20', '20', 'cat009,cat010,cat011,cat012'],
        ['premium', 'legendary', '10', '30', 'cat013,cat014,cat015,cat016'],
        ['event', 'normal', '50', '3', 'cat017,cat018,cat019,cat020'],
        ['event', 'rare', '25', '5', 'cat009,cat010,cat011,cat012'],
        ['event', 'epic', '15', '10', 'cat013,cat014,cat015,cat016'],
        ['event', 'legendary', '10', '15', 'cat017,cat018,cat019,cat020']
    ];

    const header = [
        'ガチャタイプ', 'レアリティ', '確率(%)', '最低保証回数', 'アイテムIDリスト'
    ].join(',');

    const rows = rates.map(rate => rate.join(','));
    const content = [header, ...rows].join('\n');

    fs.writeFileSync(path.join(csvDir, 'gacha_rates.csv'), content, 'utf8');
    console.log('✅ gacha_rates.csv 生成完了 (12レコード)');
};

// 10. シナリオデータ
const generateScenariosCSV = () => {
    const scenarios = [
        // ID,章,シーン,キャラクター,セリフ,背景,BGM,選択肢,次のシーン
        ['scene001', '1', '1', 'narrator', 'にゃんこたちの冒険が始まる...', 'field01', 'bgm01', '', 'scene002'],
        ['scene002', '1', '2', 'hero_cat', '今日も平和だにゃん！', 'field01', 'bgm01', '', 'scene003'],
        ['scene003', '1', '3', 'villager_cat', '魔王が村を襲っているにゃん！', 'village01', 'bgm02', '助ける/逃げる', 'scene004/scene005'],
        ['scene004', '1', '4', 'hero_cat', '魔王を倒しに行くにゃん！', 'village01', 'bgm03', '', 'scene006'],
        ['scene005', '1', '5', 'hero_cat', 'やっぱり逃げるにゃん...', 'field01', 'bgm04', '', 'gameover'],
        ['scene006', '1', '6', 'boss_cat', 'ふっふっふ、よく来たな！', 'castle01', 'bgm05', '戦う/交渉する', 'scene007/scene008'],
        ['scene007', '1', '7', 'hero_cat', '悪い猫は許さないにゃん！', 'castle01', 'bgm06', '', 'battle001'],
        ['scene008', '1', '8', 'boss_cat', '面白いことを言うにゃん...', 'castle01', 'bgm07', '', 'battle002'],
        ['scene009', '2', '1', 'narrator', '第2章：砂漠の謎', 'desert01', 'bgm08', '', 'scene010'],
        ['scene010', '2', '2', 'hero_cat', 'ここが砂漠か...暑いにゃん', 'desert01', 'bgm09', '', 'scene011'],
        ['scene011', '2', '3', 'mystery_cat', '古代の秘宝を探しているにゃん？', 'ruins01', 'bgm10', 'はい/いいえ', 'scene012/scene013'],
        ['scene012', '2', '4', 'mystery_cat', 'ならば私と協力するにゃん', 'ruins01', 'bgm11', '', 'scene014'],
        ['scene013', '2', '5', 'mystery_cat', '残念にゃん...', 'ruins01', 'bgm12', '', 'battle003'],
        ['scene014', '2', '6', 'hero_cat', 'どんな秘宝なのにゃん？', 'ruins01', 'bgm13', '', 'scene015'],
        ['scene015', '2', '7', 'mystery_cat', '伝説のにゃんこ石にゃん！', 'ruins02', 'bgm14', '', 'battle004']
    ];

    const header = [
        'ID', '章', 'シーン', 'キャラクター', 'セリフ', '背景', 'BGM', '選択肢', '次のシーン'
    ].join(',');

    const rows = scenarios.map(scene => scene.join(','));
    const content = [header, ...rows].join('\n');

    fs.writeFileSync(path.join(csvDir, 'scenarios.csv'), content, 'utf8');
    console.log('✅ scenarios.csv 生成完了 (15シーン)');
};

// 11. クエストデータ
const generateQuestsCSV = () => {
    const quests = [
        // ID,タイプ,タイトル,説明,達成条件,報酬経験値,報酬ポイント,報酬アイテム,制限時間,繰り返し可能
        ['quest001', 'main', '魔王を倒せ！', '村を襲う魔王を倒す', 'boss001を倒す', '500', '250', 'item004', 'none', 'false'],
        ['quest002', 'main', '砂漠の秘宝', '古代の秘宝を探す', 'item018を入手', '800', '400', 'item018', 'none', 'false'],
        ['quest003', 'main', '氷の女王', '氷の洞窟の女王を倒す', 'boss003を倒す', '1200', '600', 'item006', 'none', 'false'],
        ['quest004', 'main', '天空の試練', '天界の門を突破する', 'boss004を倒す', '2000', '1000', 'item020', 'none', 'false'],
        ['quest005', 'daily', '魔物退治', 'スライムを10体倒す', 'enemy001を10体倒す', '100', '50', 'item001', '24h', 'true'],
        ['quest006', 'daily', '採集クエスト', '回復薬を5個集める', 'item001を5個入手', '150', '75', 'item002', '24h', 'true'],
        ['quest007', 'daily', '訓練', 'バトルを5回行う', 'バトル5回実施', '200', '100', 'item003', '24h', 'true'],
        ['quest008', 'weekly', '冒険者の証', '100体の敵を倒す', '敵を100体倒す', '1000', '500', 'item007', '7d', 'true'],
        ['quest009', 'weekly', 'コレクター', '10種類のアイテムを集める', 'アイテム10種類収集', '1200', '600', 'item008', '7d', 'true'],
        ['quest010', 'event', '夏祭り', '花火大会の準備を手伝う', '特定アイテムを5個集める', '800', '400', 'item013', '3d', 'false']
    ];

    const header = [
        'ID', 'タイプ', 'タイトル', '説明', '達成条件', '報酬経験値', 
        '報酬ポイント', '報酬アイテム', '制限時間', '繰り返し可能'
    ].join(',');

    const rows = quests.map(quest => quest.join(','));
    const content = [header, ...rows].join('\n');

    fs.writeFileSync(path.join(csvDir, 'quests.csv'), content, 'utf8');
    console.log('✅ quests.csv 生成完了 (10クエスト)');
};

// 12. 設定データ
const generateSettingsCSV = () => {
    const settings = [
        // キー,値,説明,カテゴリ
        ['game_version', '1.0.0', 'ゲームバージョン', 'system'],
        ['max_energy', '100', '最大エネルギー', 'player'],
        ['energy_regen_rate', '1', 'エネルギー回復レート(分)', 'player'],
        ['gacha_cost', '100', 'ガチャ1回のコスト', 'gacha'],
        ['battle_energy_cost', '10', 'バトル1回の消費エネルギー', 'battle'],
        ['max_cat_level', '100', '猫の最大レベル', 'cat'],
        ['max_inventory_slots', '200', '最大所持スロット', 'inventory'],
        ['friend_max', '50', '最大フレンド数', 'social'],
        ['stamina_recovery_time', '3', 'スタミナ回復時間(分)', 'player'],
        ['daily_login_bonus', 'true', '日替わりログインボーナス', 'event'],
        ['pvp_enabled', 'true', 'PvP機能', 'pvp'],
        ['chat_enabled', 'true', 'チャット機能', 'social'],
        ['max_deck_size', '5', 'デッキの最大枚数', 'battle'],
        ['item_stack_size', '99', 'アイテムの最大スタック数', 'inventory'],
        ['auto_save_interval', '300', '自動保存間隔(秒)', 'system']
    ];

    const header = [
        'キー', '値', '説明', 'カテゴリ'
    ].join(',');

    const rows = settings.map(setting => setting.join(','));
    const content = [header, ...rows].join('\n');

    fs.writeFileSync(path.join(csvDir, 'settings.csv'), content, 'utf8');
    console.log('✅ settings.csv 生成完了 (15設定)');
};

// 13. アチーブメントデータ
const generateAchievementsCSV = () => {
    const achievements = [
        // ID,タイトル,説明,達成条件,報酬ポイント,報酬アイテム,シークレット
        ['ach001', '冒険者スタート', '初めてバトルに勝利する', 'バトル1回勝利', '100', 'item001', 'false'],
        ['ach002', '魔王退治', '魔王を初めて倒す', 'boss001を倒す', '500', 'item004', 'false'],
        ['ach003', 'コレクター', '10種類の猫を集める', '猫を10種類入手', '300', 'item005', 'false'],
        ['ach004', '富豪にゃんこ', 'にゃんこポイントを10,000獲得', 'NP10000獲得', '1000', 'item008', 'false'],
        ['ach005', '伝説の冒険者', 'レベル50に到達', 'レベル50達成', '2000', 'item018', 'false'],
        ['ach006', 'ガチャマスター', 'ガチャを100回引く', 'ガチャ100回実行', '1500', 'item020', 'false'],
        ['ach007', '友情の証', 'フレンドを10人追加', 'フレンド10人', '500', 'item009', 'false'],
        ['ach008', 'クエストコンプリート', 'すべてのメインクエストを完了', 'メインクエスト全完了', '3000', 'item019', 'false'],
        ['ach009', '無敗の王者', '連続で10回勝利する', '10連勝', '2000', 'item017', 'true'],
        ['ach010', '真のコンプリート', 'すべての猫を収集', '全猫種収集', '5000', 'item018,item019,item020', 'true']
    ];

    const header = [
        'ID', 'タイトル', '説明', '達成条件', '報酬ポイント', '報酬アイテム', 'シークレット'
    ].join(',');

    const rows = achievements.map(ach => ach.join(','));
    const content = [header, ...rows].join('\n');

    fs.writeFileSync(path.join(csvDir, 'achievements.csv'), content, 'utf8');
    console.log('✅ achievements.csv 生成完了 (10アチーブメント)');
};

// 14. ログデータ形式
const generateLogFormatsCSV = () => {
    const logFormats = [
        // ログタイプ,フォーマット,説明,サンプル
        ['battle_start', 'timestamp,player_id,battle_id,enemy_ids', 'バトル開始ログ', '2024-01-01 10:00:00,player001,battle001,enemy001,enemy002'],
        ['battle_end', 'timestamp,player_id,battle_id,result,damage_dealt,damage_taken', 'バトル終了ログ', '2024-01-01 10:05:00,player001,battle001,win,1500,800'],
        ['gacha', 'timestamp,player_id,gacha_type,result_cat_id,rarity', 'ガチャログ', '2024-01-01 10:10:00,player001,normal,cat005,rare'],
        ['login', 'timestamp,player_id,ip_address,device', 'ログインログ', '2024-01-01 10:00:00,player001,192.168.1.1,Android'],
        ['logout', 'timestamp,player_id,play_time', 'ログアウトログ', '2024-01-01 12:00:00,player001,7200'],
        ['item_use', 'timestamp,player_id,item_id,quantity,context', 'アイテム使用ログ', '2024-01-01 10:15:00,player001,item001,1,battle'],
        ['shop_purchase', 'timestamp,player_id,item_id,quantity,price', 'ショップ購入ログ', '2024-01-01 10:20:00,player001,item002,2,600'],
        ['level_up', 'timestamp,player_id,old_level,new_level', 'レベルアップログ', '2024-01-01 10:25:00,player001,10,11'],
        ['error', 'timestamp,player_id,error_code,error_message,stack_trace', 'エラーログ', '2024-01-01 10:30:00,player001,ERR001,Connection timeout,null'],
        ['chat', 'timestamp,player_id,channel,message_length', 'チャットログ', '2024-01-01 10:35:00,player001,general,50']
    ];

    const header = [
        'ログタイプ', 'フォーマット', '説明', 'サンプル'
    ].join(',');

    const rows = logFormats.map(log => log.join(','));
    const content = [header, ...rows].join('\n');

    fs.writeFileSync(path.join(csvDir, 'log_formats.csv'), content, 'utf8');
    console.log('✅ log_formats.csv 生成完了 (10フォーマット)');
};

// すべてのCSVを生成
const generateAllCSV = async () => {
    console.log('📁 CSVデータ生成開始...');
    console.log('=======================');
    
    try {
        generateCatsCSV();
        generateSkillsCSV();
        generateMapsCSV();
        generateEnemiesCSV();
        generateItemsCSV();
        generateBossesCSV();
        generateModelsCSV();
        generatePlayerStatsCSV();
        generateGachaRatesCSV();
        generateScenariosCSV();
        generateQuestsCSV();
        generateSettingsCSV();
        generateAchievementsCSV();
        generateLogFormatsCSV();
        
        console.log('=======================');
        console.log('✅ すべてのCSVデータ生成完了！');
        console.log(`📂 保存先: ${csvDir}`);
        
        // CSVをMongoDBにインポートするスクリプトの生成
        generateImportScript();
        
    } catch (error) {
        console.error('❌ CSV生成エラー:', error);
    } finally {
        mongoose.connection.close();
    }
};

// MongoDBインポートスクリプト生成
const generateImportScript = () => {
    const importScript = `
#!/bin/bash
# CSV to MongoDB インポートスクリプト
# Termuxで実行: bash import_csv.sh

echo "📊 CSVデータをMongoDBにインポートします..."

# MongoDB接続設定
MONGO_HOST="localhost"
MONGO_PORT="27017"
MONGO_DB="nyankowars"
DATA_DIR="./data/csv"

# コレクションを削除してからインポート
echo "🗑️ 既存のコレクションを削除..."
mongo --host $MONGO_HOST:$MONGO_PORT $MONGO_DB --eval "
    db.cats.drop();
    db.skills.drop();
    db.maps.drop();
    db.enemies.drop();
    db.items.drop();
    db.bosses.drop();
    db.quests.drop();
    db.settings.drop();
    db.achievements.drop();
    print('コレクション削除完了');
"

# CSVをインポート
echo "📥 CSVデータをインポート..."
mongoimport --host $MONGO_HOST:$MONGO_PORT --db $MONGO_DB --collection cats --type csv --file $DATA_DIR/cats.csv --headerline
mongoimport --host $MONGO_HOST:$MONGO_PORT --db $MONGO_DB --collection skills --type csv --file $DATA_DIR/skills.csv --headerline
mongoimport --host $MONGO_HOST:$MONGO_PORT --db $MONGO_DB --collection maps --type csv --file $DATA_DIR/maps.csv --headerline
mongoimport --host $MONGO_HOST:$MONGO_PORT --db $MONGO_DB --collection enemies --type csv --file $DATA_DIR/enemies.csv --headerline
mongoimport --host $MONGO_HOST:$MONGO_PORT --db $MONGO_DB --collection items --type csv --file $DATA_DIR/items.csv --headerline
mongoimport --host $MONGO_HOST:$MONGO_PORT --db $MONGO_DB --collection bosses --type csv --file $DATA_DIR/bosses.csv --headerline
mongoimport --host $MONGO_HOST:$MONGO_PORT --db $MONGO_DB --collection quests --type csv --file $DATA_DIR/quests.csv --headerline
mongoimport --host $MONGO_HOST:$MONGO_PORT --db $MONGO_DB --collection settings --type csv --file $DATA_DIR/settings.csv --headerline
mongoimport --host $MONGO_HOST:$MONGO_PORT --db $MONGO_DB --collection achievements --type csv --file $DATA_DIR/achievements.csv --headerline

echo "✅ インポート完了！"
echo "📊 データ確認:"
mongo --host $MONGO_HOST:$MONGO_PORT $MONGO_DB --eval "
    print('cats: ' + db.cats.countDocuments());
    print('skills: ' + db.skills.countDocuments());
    print('maps: ' + db.maps.countDocuments());
    print('enemies: ' + db.enemies.countDocuments());
    print('items: ' + db.items.countDocuments());
    print('bosses: ' + db.bosses.countDocuments());
    print('quests: ' + db.quests.countDocuments());
    print('settings: ' + db.settings.countDocuments());
    print('achievements: ' + db.achievements.countDocuments());
"
`;

    fs.writeFileSync(path.join(__dirname, '../import_csv.sh'), importScript, 'utf8');
    fs.chmodSync(path.join(__dirname, '../import_csv.sh'), '755');
    
    console.log('✅ import_csv.sh 生成完了 (Termux用インポートスクリプト)');
};

// 実行
generateAllCSV();
```

2. Termux用サーバー起動スクリプト

server/start_termux.sh

```bash
#!/data/data/com.termux/files/usr/bin/bash

# にゃんこ大戦争サーバー起動スクリプト（Termux用）

echo "サーバーを起動します..."
echo "========================================"

# 環境設定
export NODE_ENV=development
export PORT=8080
export MONGODB_URI="mongodb://localhost:27017/nyankowars"
export JWT_SECRET="nyanko_termux_secret_2024"
export JWT_EXPIRE="30d"

# ディレクトリ移動
cd "$(dirname "$0")"

# MongoDB起動
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
```