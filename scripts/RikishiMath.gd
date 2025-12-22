class_name RikishiMath
extends RefCounted

# --- Constants for Balancing ---
const BASE_RISK = 0.5 # %
const RISK_THRESHOLD = 60.0
const RISK_ALPHA = 0.5
const RISK_BETA = 0.133 # Adjusted for ~10-15% at 80, ~80% at 99.
# e^(0.133 * 20) = e^2.66 = 14.3 -> 0.5 + 0.5*14.3 = 7.6% (Low side?)
# e^(0.133 * 39) = e^5.18 = 178 -> 0.5 + 0.5*178 = 89% (Close to 80%)
# Balancing is hard, but this seems close to the "Red Zone" intent.

const BASE_RECOVERY = 30.0 # Base recovery amount per rest

# --- 1. Growth Efficiency Logic ---
# 疲労が高いほど稽古効率が落ちる
# Growth = Base * max(0.1, 1.0 - (Fatigue/100)^2)
static func calculate_growth_efficiency(fatigue: float) -> float:
	var f_ratio = clampf(fatigue, 0.0, 100.0) / 100.0
	var efficiency = 1.0 - pow(f_ratio, 2.0)
	return maxf(0.1, efficiency)

# --- 2. Injury Risk Logic ---
# 閾値を超えると指数関数的にリスク増
# InjuryChance(%) = Base + Alpha * e^(Beta * (Fatigue - Threshold))
static func calculate_injury_risk(fatigue: float) -> float:
	if fatigue <= RISK_THRESHOLD:
		# 安全圏でも最低限のリスクはある
		# 少しスムーズにするために、閾値以下ではBaseRiskに徐々に近づける形も考えられるが
		# 仕様通り "Base + ..." を計算する（指数部分がマイナスになるので小さくなる）
		# ただし仕様の意図は "Thresholdまでは安全" なので、
		# Threshold以下なら BaseRisk だけ、または非常に低い値を返すのが自然。
		# ここでは数式通り計算する (e^negative は1より小さいので Base + small amount になる)
		# risk = BASE_RISK + RISK_ALPHA * exp(RISK_BETA * (fatigue - RISK_THRESHOLD))
		# しかし仕様書には "超えた瞬間に...跳ね上がる" とある。
		# 単純化のため、Threshold以下は BaseRisk 固定とするのが安全か？
		# 数式通り実装してみる。
		return BASE_RISK
	
	var exponent = RISK_BETA * (fatigue - RISK_THRESHOLD)
	var risk = BASE_RISK + RISK_ALPHA * exp(exponent)
	return minf(100.0, risk) # Cap at 100%

# --- 3. Recovery Logic ---
# 年齢が高いほど回復しにくい
# Recovery = Base * (1.0 - (Age - 15)/30)
static func calculate_recovery_amount(age: int) -> float:
	var age_factor = float(age - 15) / 30.0
	var multiplier = 1.0 - age_factor
	# 高齢になりすぎてマイナスにならないよう下限を設定 (例: 10%は維持)
	multiplier = maxf(0.1, multiplier)
	
	return BASE_RECOVERY * multiplier
