class_name TraitData
extends RefCounted

const TRAITS = {
	"Edge Master": {"name": "土俵際", "desc": "土俵際で粘るとStrength 1.5倍"},
	"Rocket Start": {"name": "ロケット", "desc": "立ち合いSpeed 1.5倍、スタミナ消費増"},
	"Glass Knees": {"name": "ガラスの膝", "desc": "Technique 1.2倍、スタミナ上限低下"},
	"Big Stage": {"name": "大舞台", "desc": "役付きor千秋楽付近でMental大幅アップ"},
	"Slow Starter": {"name": "スロースターター", "desc": "序盤戦弱い、終盤戦強い"},
	"Giant Killer": {"name": "金星", "desc": "格上相手にStrength/Mentalアップ"},
	"Small Soldier": {"name": "小兵", "desc": "相手より軽いとTechniqueアップ"},
	"Heavy Tank": {"name": "重戦車", "desc": "相手より重いとStrengthアップ"},
	"Iron Man": {"name": "鉄人", "desc": "スタミナ最大値+20%"},
	"Practice Demon": {"name": "稽古の鬼", "desc": "成長率アップ"},
	"Star Quality": {"name": "華がある", "desc": "人気が出やすい"},
	"Lone Wolf": {"name": "一匹狼", "desc": "ライバル相手にさらに強く"},
	"Technician": {"name": "業師", "desc": "難しい決まり手が出やすい"},
	"Bulldozer": {"name": "突き押し専", "desc": "押し相撲強化、四つ相撲弱体化"},
	"Clutch": {"name": "土壇場", "desc": "7勝7敗などでMental強化"},
	"Natural Healing": {"name": "自然治癒", "desc": "スタミナ回復量が多い"},
	"Flexible": {"name": "柔軟", "desc": "投げ技に対する防御力アップ"},
	"Analytical": {"name": "分析", "desc": "対戦経験が多い相手に有利"},
	"Wild Instinct": {"name": "野生", "desc": "稀にクリティカル(判定勝ち)発生"},
	"Late Bloomer": {"name": "晩成", "desc": "30代以降も衰えない、初期成長遅い"},
	"Early Bloomer": {"name": "早熟", "desc": "初期成長早いが、衰えも早い"},
	"Lazy": {"name": "稽古嫌い", "desc": "成長率ダウン、疲労回復早い"},
	"Showman": {"name": "派手好き", "desc": "人気増、Mental不安定"},
	"Revenger": {"name": "リベンジ", "desc": "前回負けた相手にボーナス"},
	"Momentum": {"name": "勢い", "desc": "連勝中ステータスアップ"},
	"Crisis Actor": {"name": "火事場の馬鹿力", "desc": "スタミナ切れでPowerアップ"},
	"Salt Shaker": {"name": "大量塩撒き", "desc": "試合開始時にMental回復"},
	"Lightweight": {"name": "軽量級", "desc": "100kg以下でSpeedアップ"},
	"Iron Heart": {"name": "不動心", "desc": "相手の威圧効果無効"},
	"Stable Pillar": {"name": "部屋頭", "desc": "部屋内最高位でMentalアップ"}
}

static func get_random_trait() -> String:
	return TRAITS.keys().pick_random()

static func get_trait_name(key: String) -> String:
	if TRAITS.has(key): return TRAITS[key]["name"]
	return key

static func get_trait_desc(key: String) -> String:
	if TRAITS.has(key): return TRAITS[key]["desc"]
	return ""
