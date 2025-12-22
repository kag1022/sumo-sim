class_name MatchEngine
extends RefCounted

const BASE_STAMINA_COST = 5.0 # Minimum stamina cost per match
const MAX_STAMINA_COST = 20.0 # Maximum stamina cost for long matches

# --- Match Resolution ---
# Returns: { "winner": Rikishi, "loser": Rikishi, "kimarite": String }
# --- Match Resolution ---
# Returns: { "winner": Rikishi, "loser": Rikishi, "kimarite": String }
static func resolve_match(east, west, is_east_kadoban: bool, is_west_kadoban: bool) -> Dictionary:
	# 1. 立ち合い (The Charge)
	# Rocket Start Check
	var e_speed = east.speed
	var w_speed = west.speed
	if east.has_trait("Rocket Start"): e_speed *= 1.5
	if west.has_trait("Rocket Start"): w_speed *= 1.5
	if east.has_trait("Lightweight") and east.weight < 100: e_speed *= 1.2
	if west.has_trait("Lightweight") and west.weight < 100: w_speed *= 1.2
	
	var e_impulse = east.weight * ease_value(e_speed)
	var w_impulse = west.weight * ease_value(w_speed)
	
	var tachiai_diff = (e_impulse - w_impulse) / 20000.0
	tachiai_diff = clampf(tachiai_diff, -0.5, 0.5)
	
	if tachiai_diff > 0.3: print("Match: %s smashed at Tachiai!" % east.name)
	elif tachiai_diff < -0.3: print("Match: %s smashed at Tachiai!" % west.name)
	
	# 2. 四つ・押し (Grappling Phase)
	# Rivalry Check
	var e_rival = east.is_rival(west.id, Global.global_basho_count)
	var w_rival = west.is_rival(east.id, Global.global_basho_count)
	
	# Main combat value calculation
	var e_power = _calc_combat_power(east, is_east_kadoban, e_rival, west)
	var w_power = _calc_combat_power(west, is_west_kadoban, w_rival, east)
	
	# Apply Tachiai Impact
	# Edge Master: If pushed back at tachiai (disadvantage), boost strength
	if tachiai_diff < -0.1 and east.has_trait("Edge Master"):
		e_power *= 1.5
		print("%s activates Edge Master!" % east.name)
	if tachiai_diff > 0.1 and west.has_trait("Edge Master"):
		w_power *= 1.5
		print("%s activates Edge Master!" % west.name)

	if tachiai_diff > 0:
		e_power *= (1.0 + tachiai_diff)
	else:
		w_power *= (1.0 + abs(tachiai_diff))
		
	# Random Variance / Wild Instinct
	if east.has_trait("Wild Instinct") and randf() < 0.05:
		e_power *= 2.0
		print("%s: WILD INSTINCT CRITICAL!" % east.name)
	if west.has_trait("Wild Instinct") and randf() < 0.05:
		w_power *= 2.0
		print("%s: WILD INSTINCT CRITICAL!" % west.name)

	e_power *= randf_range(0.9, 1.1)
	w_power *= randf_range(0.9, 1.1)
	
	# 3. Resolution
	var winner
	var loser
	var win_margin
	
	if e_power > w_power:
		winner = east; loser = west
		win_margin = e_power - w_power
	else:
		winner = west; loser = east
		win_margin = w_power - e_power
		
	# 4. Kimarite Selection
	var kimarite = _select_kimarite(winner, win_margin, tachiai_diff, east == winner, loser)
	
	# 5. Stamina Drain
	var struggle = 1.0 - clampf(win_margin / 100.0, 0.0, 0.9)
	var base_drain = lerp(BASE_STAMINA_COST, MAX_STAMINA_COST, struggle)
	
	# Trait Stamina Modifiers
	var e_cost = base_drain
	var w_cost = base_drain
	
	if east.has_trait("Rocket Start"): e_cost *= 1.5
	if west.has_trait("Rocket Start"): w_cost *= 1.5
	if east.has_trait("Iron Man"): e_cost *= 0.8 # Less drain effectively same as more max
	if west.has_trait("Iron Man"): w_cost *= 0.8
	
	east.stamina_current = max(0, east.stamina_current - e_cost)
	west.stamina_current = max(0, west.stamina_current - w_cost)
	
	# Natural Healing (Recover a bit immediately? Or handled in day tick. Let's do instant recover for gameplay flow if needed)
	if beat_stamina_check(east): east.stamina_current = east.stamina_max
	if beat_stamina_check(west): west.stamina_current = west.stamina_max
	
	return {
		"winner": winner,
		"loser": loser,
		"kimarite": kimarite
	}

static func beat_stamina_check(r) -> bool:
	return r.has_trait("Natural Healing") and r.stamina_current < 30.0 # Emergency heal

static func _calc_combat_power(r, kadoban: bool, is_rival_match: bool, opp) -> float:
	# Base Power
	var strength_val = r.strength
	var tech_val = r.technique
	
	if r.has_trait("Bulldozer"):
		strength_val *= 1.2
		tech_val *= 0.8
	if r.has_trait("Glass Knees"):
		tech_val *= 1.2
		
	# Trait: Heavy Tank / Small Soldier
	if r.weight > opp.weight and r.has_trait("Heavy Tank"): strength_val *= 1.1
	if r.weight < opp.weight and r.has_trait("Small Soldier"): tech_val *= 1.15

	var val = (strength_val * 1.5) + (tech_val * 1.0)
	
	# Stamina Modifier
	var stam_ratio = r.stamina_current / r.stamina_max
	if r.has_trait("Crisis Actor") and stam_ratio < 0.1:
		val *= 1.5 # Fire Power
	else:
		val *= lerp(0.5, 1.0, stam_ratio)
	
	# Mental Modifier
	var mental_bonus = 0.0
	
	if kadoban:
		var effect = (r.mental - 100.0) / 200.0
		if r.has_trait("Clutch"): effect = max(effect, 0.1) + 0.2
		val *= (1.0 + effect)
		
	if is_rival_match:
		var rival_buff = (r.mental) / 200.0
		if r.has_trait("Lone Wolf"): rival_buff *= 1.5
		# Revenger: If total recent losses > wins? Or just simple count comparison
		var r_data = r.rivals[opp.id]
		if r.has_trait("Revenger") and r_data.get("loss_history", []).size() > r_data.get("win_history", []).size():
			rival_buff += 0.2
		val *= (1.0 + (rival_buff * 0.2))
	
	# Big Stage (Sanyaku)
	if r.has_trait("Big Stage") and r.rank <= Banzuke.Rank.KOMUSUBI:
		val *= 1.1
		
	# Giant Killer (Opponent Rank < Self Rank) - Lower value is higher rank
	if r.has_trait("Giant Killer") and opp.rank < r.rank:
		if opp.rank <= Banzuke.Rank.OZEKI:
			val *= 1.25 # Huge boost vs Ozeki/Yokozuna
		else:
			val *= 1.1
			
	# Analytical
	if r.has_trait("Analytical") and (r.faced_opponents.has(opp) or r.is_rival(opp.id, Global.global_basho_count)):
		val *= 1.1

	return val

static func _select_kimarite(winner, margin: float, tachiai: float, winner_is_east: bool, loser) -> String:
	var t_adv = tachiai if winner_is_east else -tachiai
	
	if winner.has_trait("Bulldozer") and t_adv > 0:
		return ["突き出し", "押し出し"].pick_random()
	
	if winner.has_trait("Technician"):
		if margin < 30.0:
			return ["外掛け", "内無双", "首投げ", "居反り"].pick_random() # Flashy
		
	if t_adv > 0.2:
		return ["押し出し", "突き出し", "押し倒し"].pick_random()
	
	if winner.technique > winner.strength * 1.2:
		if loser.has_trait("Flexible") and margin < 40.0:
			# Flexible loser resists throws, forces force-out
			return "寄り切り"
			
		if margin < 20.0:
			return ["上手投げ", "下手投げ", "掬い投げ", "突き落とし", "叩き込み"].pick_random()
		else:
			return ["上手出し投げ", "肩透かし", "送り出し"].pick_random()
			
	return ["寄り切り", "寄り倒し", "上手投げ"].pick_random()

# Helper to curve stat values (Diminishing returns or exponential?)
# Here linear for simplicity, but prepared for future.
static func ease_value(v: float) -> float:
	return v
