class_name Global
extends RefCounted

# --- 経済 (Economy) ---
static var money: int = 1000000 # 初期資金 100万円

# --- 施設 (Infrastructure) ---
# 各施設のレベル (1〜5)
static var facilities = {
	"training": 1,
	"food": 1,
	"medical": 1
}

# --- 環境 (World) ---
static var stables: Dictionary = {} # Stable ID -> Stable Resource
static var current_era_stable_id: String = "" # ID of the dominant stable
static var global_basho_count: int = 1 # Tracks total bashos passed


# --- 定数 ---
const BASE_UPGRADE_COST = 500000

# 施設をアップグレードする
static func upgrade_facility(type: String) -> bool:
	if not facilities.has(type):
		return false
		
	var current_lvl = facilities[type]
	if current_lvl >= 5:
		print("これ以上レベルアップできません: ", type)
		return false
		
	# コスト計算 (レベル * 基本コスト)
	var cost = current_lvl * BASE_UPGRADE_COST
	
	if money >= cost:
		money -= cost
		facilities[type] += 1
		print("施設強化成功: %s Lv%d -> Lv%d (残金: %d)" % [type, current_lvl, facilities[type], money])
		return true
	else:
		print("資金不足です: 必要 %d / 所持 %d" % [cost, money])
		return false

# 施設の効果倍率を取得する
static func get_facility_multiplier(type: String) -> float:
	if not facilities.has(type):
		return 1.0
	return 1.0 + (facilities[type] - 1) * 0.2

# --- 殿堂入り (Hall of Fame) ---
# 引退した名力士の記録を保持
static var hall_of_fame: Array[Dictionary] = []

# 殿堂入りデータを追加
static func add_to_hall_of_fame(data: Dictionary):
	hall_of_fame.append(data)
	print("★ 殿堂入りしました ★: ", data["name"])

# --- ランクシステム (UI表示用) ---
# --- ランクシステム (Neon / Dark Mode) ---
const RANK_COLORS = {
	"SSS": Color("#ffeaa7"), # Gold Neon
	"SS": Color("#fab1a0"), # Light Salmon
	"S": Color("#ff7675"), # Red Neon
	"A": Color("#74b9ff"), # Blue Neon
	"B": Color("#55efc4"), # Green Neon
	"C": Color("#ffeaa7"), # Yellow Neon
	"D": Color("#b2bec3"), # Gray Neon
	"E": Color("#636e72"), # Dark Gray
	"F": Color("#2d3436") # Black
}

# --- UI Theme Colors (Liquid Glass) ---
const UI_COLORS = {
	"bg_main": Color("#0f0f1a"), # Deep Void
	"bg_glass": Color(0.12, 0.12, 0.18, 0.85), # Glass Pane
	"border_glass": Color(1.0, 1.0, 1.0, 0.15), # Frost Edge
	"text_main": Color("#e0e0e0"), # Hologram White
	"text_sub": Color("#a0a0b0"), # Cyber Gray
	"accent": Color("#ff4757"), # Magma Red
	"primary": Color("#00d2d3"), # Cyan Ray
	"shadow": Color(0, 0, 0, 0.5) # Deep Shadow
}
