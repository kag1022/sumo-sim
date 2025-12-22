extends Resource
class_name Rikishi

@export var id: String = "" # UUID
@export var heya_id: String = "" # Stable ID

# --- 基本データ ---
@export var name: String = "未定"
@export var rank: Banzuke.Rank = Banzuke.Rank.JONOKUCHI
@export var is_east: bool = true # 東: true, 西: false
@export var highest_rank: Banzuke.Rank = Banzuke.Rank.JONOKUCHI
@export var rank_number: int = 1
@export var history: Array[Dictionary] = []

# Runtime only (Not exported for save/load necessary?)
var next_opponent = null # Cyclic dependency avoidance
var faced_opponents: Array = [] # Track opponents this basho

# Rivals System
# Dictionary: opponent_id (String) -> { 
#   "loss_history": [basho_id, ...], 
#   "win_history": [basho_id, ...] 
# }
@export var rivals: Dictionary = {}

func is_rival(opp_id: String, current_global_basho: int) -> bool:
	if not rivals.has(opp_id): return false
	var data = rivals[opp_id]
	var loss_history_list = data.get("loss_history", [])
	
	# Check last 3 bashos (current, current-1, current-2)
	var count = 0
	for b_id in loss_history_list:
		if b_id >= current_global_basho - 2:
			count += 1
			
	return count >= 2

# --- Traits ---
@export var traits: Array[String] = []

# --- 番付名ヘルパー ---
func get_rank_name() -> String:
	var r_name = Banzuke.get_rank_name(rank)
	var side_str = "東" if is_east else "西"
	
	if rank == Banzuke.Rank.YOKOZUNA or rank == Banzuke.Rank.OZEKI or rank == Banzuke.Rank.SEKIWAKE or rank == Banzuke.Rank.KOMUSUBI:
		return "%s%s" % [side_str, r_name]
	else:
		return "%s%s %d枚目" % [side_str, r_name, rank_number]

@export var age: int = 15
@export var wins: int = 0
@export var losses: int = 0

# --- パラメーター (0.0 - 200.0) ---
@export var strength: float = 30.0 # 筋力 (Strength)
@export var weight: float = 80.0 # 体重 (Weight) - kgではないが内部値として
@export var shusshin: String = "未定" # 出身地 (Origin)
@export var speed: float = 30.0 # 瞬発力 (Speed) - 立ち合い
@export var technique: float = 30.0 # 技術 (Technique) - 四つ/押し
@export var mental: float = 30.0 # 精神力 (Mental) - プレッシャー
@export var potential: float = 1.0 # 才能（伸びしろ）
@export var growth_speed: float = 1.0 # 成長/劣化速度係数 (基本 1.0)
@export var peak_age: int = 25 # 全盛期年齢 (Default 25)

# --- 人気・経済 (Economy) ---
@export var popularity: float = 0.0 # 0.0 - 100.0+
@export var koenkai_rank: int = 0 # 0=None, 1=Small, 2=Medium, 3=Large, 4=Mega

# --- スタミナ (15日間用) ---
@export var stamina_max: float = 100.0
@export var stamina_current: float = 100.0
@export var fatigue: float = 0.0 # 0.0 - 100.0 (疲労度)
@export var is_injured: bool = false # 怪我状態

@export var _basho_count: int = 0


# --- Deep Training Parameters ---
enum Condition {ZEKKOCHO, GOOD, NORMAL, BAD}
@export var motivation: float = 50.0 # 0.0 - 100.0 (やる気)
@export var condition: Condition = Condition.NORMAL # 調子
@export var trust: float = 0.0 # 0.0 - 100.0 (親方への信頼度)
@export var is_focus: bool = false # 重点指導対象かどうか

# --- 稽古 (Risk & Return) ---
const RikishiMathUtils = preload("res://scripts/RikishiMath.gd")

func train(type: String):
	if is_injured:
		print("%s は怪我のため稽古できません。" % name)
		return

	# 1. 怪我判定 (まずはリスクを計算)
	var risk_pct = RikishiMathUtils.calculate_injury_risk(fatigue)
	
	# リスク判定実行
	if randf() * 100.0 < risk_pct:
		_apply_injury()
		return

	# 2. 成長計算
	var efficiency = RikishiMathUtils.calculate_growth_efficiency(fatigue)
	
	# typeに応じた基本成長量 (仮)
	var base_growth = 1.0
	if type == "hard": base_growth = 2.0
	
	# 実際の成長量
	var growth_amount = base_growth * potential * efficiency
	
	# ステータス加算 (簡易配分)
	strength += growth_amount * 0.4
	technique += growth_amount * 0.3
	speed += growth_amount * 0.3
	
	# 3. 疲労蓄積
	var fatigue_cost = 10.0
	if type == "hard": fatigue_cost = 20.0
	fatigue = clampf(fatigue + fatigue_cost, 0.0, 100.0)
	
	# print("%s の稽古完了: 成長+%.2f (効率: %.0f%%), 疲労: %.1f, 怪我率: %.1f%%" % [
	# 	name, growth_amount, efficiency * 100.0, fatigue, risk_pct
	# ])
	print("%s の稽古完了: 成長+%.2f (効率: %.0f%%), 疲労: %.1f, 怪我率: %.1f%%" % [
		name, growth_amount, efficiency * 100.0, fatigue, risk_pct
	])

func rest():
	var amount = RikishiMathUtils.calculate_recovery_amount(age)
	fatigue = clampf(fatigue - amount, 0.0, 100.0)
	
	# 怪我治癒判定 (簡易)
	if is_injured:
		# 重傷度などを実装してもよいが、ここでは休めば確率で治ると仮定、あるいは一定期間必要か。
		# 今回はシンプルに休養で完治フラグをリセットするチャンスがあるとする
		if randf() < 0.3: # 30% chance to heal
			is_injured = false
			print("%s の怪我が完治しました！" % name)
			
	print("%s は休養しました。疲労回復: -%.1f (現在: %.1f)" % [name, amount, fatigue])

func _apply_injury():
	is_injured = true
	fatigue = 100.0 # 強制的に最大
	
	# ステータスダウンペナルティ
	var penalty = 5.0
	strength = maxf(1.0, strength - penalty)
	speed = maxf(1.0, speed - penalty)
	technique = maxf(1.0, technique - penalty)
	
	print("【痛恨！】%s が怪我をしました！ ステータスダウン..." % name)

# --- 成長処理 (Classic - for compatibility) ---
# --- 成長処理 (Classic - for compatibility) ---
func process_growth(infra_levels: Dictionary):
	# Compatibility wrapper or legacy
	# We rely on manual instruction now, but can use this for specific boosts if needed.
	pass

func update_age_and_decline():
	_basho_count += 1
	if _basho_count >= 6:
		age += 1
		_basho_count = 0
		print("%s は %d歳 になりました。" % [name, age])
		
	# Decline Check (Aging)
	# Quadratic Decline after Peak Age
	var decline_val = 0.0
	if age > peak_age:
		var years_over = float(age - peak_age)
		decline_val = pow(years_over, 2.0) * 1.5 * growth_speed # Slightly stronger decline?
		
		# Trait Modifiers
		if has_trait("Iron Man"): decline_val *= 0.5
		if has_trait("Glass Knees"): decline_val *= 1.5
		
		print("%s は衰えを感じている... (-%.2f)" % [name, decline_val])
	
	# Apply Decline
	if decline_val > 0:
		strength -= decline_val
		speed -= decline_val * 1.2
		technique -= decline_val * 0.2
		# Mental typically doesn't decline, stays
		
		# Clamp min
		strength = max(1.0, strength)
		speed = max(1.0, speed)
		technique = max(1.0, technique)
		
	# Recover Stamina for next Basho
	stamina_current = stamina_max

# --- 記録 ---
@export var winning_kimarite_history: Array[String] = []
@export var results_history: Array[bool] = []

# --- ランク変換ヘルパー ---
static func get_parameter_rank(value: float) -> String:
	if value >= 150.0: return "SSS"
	elif value >= 130.0: return "SS" # 調整
	elif value >= 110.0: return "S"
	elif value >= 90.0: return "A"
	elif value >= 70.0: return "B"
	elif value >= 50.0: return "C"
	elif value >= 30.0: return "D"
	elif value >= 10.0: return "E"
	else: return "F"

func get_strength_rank() -> String: return get_parameter_rank(strength)
func get_weight_rank() -> String: return get_parameter_rank(weight)
func get_speed_rank() -> String: return get_parameter_rank(speed)
func get_tech_rank() -> String: return get_parameter_rank(technique)
func get_mental_rank() -> String: return get_parameter_rank(mental) # UI用に追加

# --- 試合 (MatchEngineに移行するためSimMatchは削除orラッパー化) ---
func sim_match() -> String:
	# 互換性のため残すが、実際はMatchEngineを使う
	return "match_moved_to_engine"

# --- シリアライズ ---
func to_dict() -> Dictionary:
	return {
		"id": id,
		"heya_id": heya_id,
		"name": name,
		"shusshin": shusshin,
		"rank": rank,
		"is_east": is_east,
		"highest_rank": highest_rank,
		"rank_number": rank_number,
		"history": history,
		"age": age,
		"_basho_count": _basho_count,
		"wins": wins,
		"losses": losses,
		"strength": strength,
		"weight": weight,
		"speed": speed,
		"technique": technique,
		"mental": mental,
		"popularity": popularity,
		"koenkai_rank": koenkai_rank,
		"stamina_max": stamina_max,
		"potential": potential,
		"winning_kimarite_history": winning_kimarite_history,
		"results_history": results_history,
		"rivals": rivals,
		"traits": traits,
		"growth_speed": growth_speed,
		"peak_age": peak_age,
		"motivation": motivation,
		"condition": condition,
		"trust": trust,
		"is_focus": is_focus
	}

static func from_dict(d: Dictionary) -> Resource:
	var r = load("res://scripts/Rikishi.gd").new()
	r.id = d.get("id", "")
	if r.id == "": r.id = str(randi()) # Fallback for old saves
	r.heya_id = d.get("heya_id", "")
	
	r.name = d.get("name", "Unknown")
	r.shusshin = d.get("shusshin", "未定")
	r.rank = d.get("rank", Banzuke.Rank.JONOKUCHI)
	r.is_east = d.get("is_east", true)
	r.highest_rank = d.get("highest_rank", Banzuke.Rank.JONOKUCHI)
	r.rank_number = d.get("rank_number", 1)
	r.history = d.get("history", [])
	r.age = d.get("age", 18)
	r._basho_count = d.get("_basho_count", 0)
	r.wins = d.get("wins", 0)
	r.losses = d.get("losses", 0)
	r.strength = d.get("strength", 30.0)
	r.weight = d.get("weight", 80.0)
	r.speed = d.get("speed", 30.0)
	r.technique = d.get("technique", 30.0)
	r.mental = d.get("mental", 30.0)
	
	r.popularity = d.get("popularity", 0.0)
	r.koenkai_rank = d.get("koenkai_rank", 0)
	
	r.stamina_max = d.get("stamina_max", 100.0)
	r.stamina_current = r.stamina_max # Load時は全快と仮定
	r.potential = d.get("potential", 1.0)
	r.growth_speed = d.get("growth_speed", 1.0)
	r.peak_age = d.get("peak_age", 25)
	r.winning_kimarite_history.assign(d.get("winning_kimarite_history", []))
	r.results_history.assign(d.get("results_history", []))
	
	r.rivals = d.get("rivals", {})
	r.traits.assign(d.get("traits", []))
	
	r.motivation = d.get("motivation", 50.0)
	r.condition = d.get("condition", Condition.NORMAL)
	r.trust = d.get("trust", 0.0)
	r.is_focus = d.get("is_focus", false)
	return r

# --- 特性管理 ---
func add_trait(t_key: String):
	if not traits.has(t_key):
		traits.append(t_key)

func has_trait(t_key: String) -> bool:
	return traits.has(t_key)
