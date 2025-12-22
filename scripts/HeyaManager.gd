# ファイル名: HeyaManager.gd
extends Node2D

# Dependencies
const ResultViewScene = preload("res://scenes/ResultView.tscn")
const DashboardScene = preload("res://scenes/TournamentDashboard.tscn")
const InstructionViewScene = preload("res://scenes/InstructionView.tscn")
const SetupViewScene = preload("res://scenes/SetupView.tscn")

# UI References
var ui_layer: CanvasLayer
var nav_bar: HBoxContainer
var content_area: Control
var header_label: Label
var next_btn: Button

# Active Views
var current_view: Node = null

# Game State
enum State {STABLE, TOURNAMENT}
var current_state: State = State.STABLE
var current_tournament_day: int = 1
var turns_until_basho: int = 4 # Weeks before basho

# Data
var rikishi_list: Array[Rikishi] = [] # Player's Rikishi
var tournament_participants: Array[Rikishi] = [] # All Rikishi (Player + Ghosts) for current basho

func _ready():
	_setup_main_layout()
	
	if rikishi_list.is_empty():
		# _add_initial_rikishi() -> Removed in favor of SetupView
		_switch_view(SetupViewScene)
		# Hide Navbar during setup
		nav_bar.visible = false
	else:
		_switch_view(InstructionViewScene)

func _setup_main_layout():
	ui_layer = CanvasLayer.new()
	add_child(ui_layer)
	
	# Main Background (Deep Void)
	var bg_rect = ColorRect.new()
	bg_rect.color = Global.UI_COLORS.bg_main
	bg_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	ui_layer.add_child(bg_rect)
	
	var main_vbox = VBoxContainer.new()
	main_vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	ui_layer.add_child(main_vbox)
	
	# Header
	var header_panel = PanelContainer.new()
	ThemeUtils.apply_panel_bg(header_panel)
	main_vbox.add_child(header_panel)
	var header_hbox = HBoxContainer.new()
	header_hbox.add_theme_constant_override("separation", 20)
	var h_margin = MarginContainer.new() # Padding for header
	h_margin.add_theme_constant_override("margin_left", 16)
	h_margin.add_theme_constant_override("margin_right", 16)
	h_margin.add_theme_constant_override("margin_top", 12)
	h_margin.add_theme_constant_override("margin_bottom", 12)
	header_panel.add_child(h_margin)
	h_margin.add_child(header_hbox)
	
	header_label = Label.new()
	_update_header_info()
	header_label.add_theme_color_override("font_color", Global.UI_COLORS.text_main)
	header_hbox.add_child(header_label)
	
	var spacer = Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header_hbox.add_child(spacer)
	
	next_btn = Button.new()
	next_btn.text = "場所開始"
	ThemeUtils.apply_accent_button_style(next_btn) # Accent Style
	next_btn.pressed.connect(_on_next_action_pressed)
	header_hbox.add_child(next_btn)
	
	# Auto Button (New)
	var auto_btn = Button.new()
	auto_btn.text = "全日程オート (Auto)"
	ThemeUtils.apply_button_style(auto_btn)
	auto_btn.pressed.connect(_on_auto_tournament_pressed)
	header_hbox.add_child(auto_btn)
	
	# Navigation
	nav_bar = HBoxContainer.new()
	nav_bar.alignment = BoxContainer.ALIGNMENT_CENTER # Center nav
	nav_bar.add_theme_constant_override("separation", 16)
	var nav_margin = MarginContainer.new()
	nav_margin.add_theme_constant_override("margin_top", 8)
	nav_margin.add_theme_constant_override("margin_bottom", 8)
	main_vbox.add_child(nav_margin)
	nav_margin.add_child(nav_bar)
	
	_add_nav_btn("指導", InstructionViewScene)
	
	# Content
	content_area = Control.new()
	content_area.size_flags_vertical = Control.SIZE_EXPAND_FILL
	# Add background to content area?
	var bg_panel = PanelContainer.new()
	ThemeUtils.apply_panel_bg(bg_panel)
	bg_panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	main_vbox.add_child(bg_panel)
	bg_panel.add_child(content_area)

func _add_nav_btn(text: String, scene_res: PackedScene):
	var btn = Button.new()
	btn.text = text
	ThemeUtils.apply_button_style(btn)
	btn.pressed.connect(func():
		if current_state == State.STABLE:
			_switch_view(scene_res)
	)
	nav_bar.add_child(btn)

func _switch_view(scene_res: PackedScene):
	if current_view: current_view.queue_free()
	current_view = scene_res.instantiate()
	content_area.add_child(current_view)
	
	if current_view.has_method("set_data"):
		current_view.set_data(rikishi_list)
		

	if current_view is TournamentDashboard:
		current_view.update_dashboard(current_tournament_day, rikishi_list)
		
	if current_view is InstructionView:
		current_view.command_executed.connect(_on_instruction_executed)
	if current_view is InstructionView:
		current_view.command_executed.connect(_on_instruction_executed)
		current_view.retire_requested.connect(_on_manual_retirement)
		current_view.set_remaining_turns(turns_until_basho)
		
	if current_view is SetupView:
		current_view.game_started.connect(_on_game_started)

func _on_game_started(p_name: String, p_age: int):
	_add_initial_rikishi(p_name, p_age)
	
	# Transition to Game Loop
	nav_bar.visible = true
	_update_header_info()
	_switch_view(InstructionViewScene)
func _on_instruction_executed():
	if turns_until_basho > 0:
		turns_until_basho -= 1
		print("Turn Passed. Remaining: ", turns_until_basho)
		_update_header_info()
		
		# Update View
		if current_view is InstructionView:
			current_view.set_remaining_turns(turns_until_basho)
		
	if current_view is InstructionView:
		current_view.set_remaining_turns(turns_until_basho)
	
	# If turns reached 0, maybe notify user?
	if turns_until_basho == 0:
		print("All training weeks finished! Ready for Basho.")

func _on_manual_retirement():
	# Trigger retirement for the current active rikishi (single focus)
	if not rikishi_list.is_empty():
		_handle_retirement(rikishi_list[0])

func _update_header_info():
	header_label.text = "資金: ¥%d | 所属: %d名 | 残り期間: %d週" % [
		Global.money, rikishi_list.size(), turns_until_basho
	]

func _on_next_action_pressed():
	if current_state == State.STABLE:
		if turns_until_basho > 0:
			print("まだ場所まで時間があります！ (%d週)" % turns_until_basho)
			# Optional: Dialog "Skip remaining time?"
			return
			
		_start_tournament(false)
	elif current_state == State.TOURNAMENT:
		_process_tournament_day()

func _on_auto_tournament_pressed():
	if current_state == State.STABLE:
		_start_tournament(true)

func _start_tournament(is_auto: bool):
	print("--- 本場所開始 (Auto: %s) ---" % is_auto)
	current_state = State.TOURNAMENT
	current_tournament_day = 1
	
	nav_bar.visible = false
	next_btn.text = "初日の取組へ"
	
	# 1. Reset Stats & Growth for Player Rikishi
	for r in rikishi_list:
		r.wins = 0
		r.losses = 0
		r.winning_kimarite_history.clear()
		r.results_history.clear()
		r.faced_opponents.clear()
		r.rivals.clear() # Optional: Clear rivals every basho? Or keep consistent?
		# Spec said "Defeated 2 times in same basho".
		# So we should probably clear "rivals" count, BUT if we want persistence across bashos, we keep it.
		# For "Era" feel, persistence is better. 
		# But "current_tournament_day" in rival data implies transient.
		# Let's clear 'faced_opponents' (Matchmaking) but keep 'rivals' (History)?
		# Actually, if the condition is "2 times in ONE basho", we should clear the count.
		# Let's clear rival counts for now to stick to "Basho Rival".
		r.rivals.clear()
		
		# 2. Setup Tournament Participants
		# Note: Growth is now handled manually via Instruction View
		# var infra = ... r.process_growth(infra) -> Removed
		
	# 2. Setup Tournament Participants
	_setup_participants()
	
	if is_auto:
		_run_auto_tournament()
	else:
		# 3. Make pairings for Day 1
		_make_pairings_for_day(1)
		_switch_view(DashboardScene)

func _run_auto_tournament():
	# Loop 15 Days
	for d in range(1, 16):
		current_tournament_day = d
		# Pair
		_make_pairings_for_day(d)
		# Process (Resolve matches)
		# Note: _process_tournament_day normally advances day. 
		# We need a headless resolve function or force it.
		
		# Inline resolution loop
		for r in tournament_participants:
			if r.next_opponent:
				var opp = r.next_opponent
				# Ensure we haven't processed this pair yet (simple check: if both have result for today?)
				# Checking results_history size is tricky if they miss a match.
				# Better: resolve both, set next_opponent to null to prevent double calc.
				_resolve_match_pair(r, opp)
				r.next_opponent = null
				opp.next_opponent = null
				
	_end_tournament(true) # Show Result View

func _setup_participants():
	tournament_participants.clear()
	# Add Players
	tournament_participants.append_array(rikishi_list)
	
	# Ensure Global Stables are initialized
	if Global.stables.is_empty():
		_initialize_ai_stables()
	
	# Fill with Ghosts (Simplified logic from before)
	var caps = {
		Banzuke.Rank.MAEGASHIRA: Banzuke.CAPACITY_MAKUUCHI,
		Banzuke.Rank.JURYO: Banzuke.CAPACITY_JURYO,
		Banzuke.Rank.MAKUSHITA: Banzuke.CAPACITY_MAKUSHITA,
		Banzuke.Rank.SANDANME: Banzuke.CAPACITY_SANDANME,
		Banzuke.Rank.JONIDAN: Banzuke.CAPACITY_JONIDAN,
		Banzuke.Rank.JONOKUCHI: Banzuke.CAPACITY_JONOKUCHI
	}
	var current_counts = {}
	for r in rikishi_list:
		var k = r.rank
		if k >= Banzuke.Rank.MAEGASHIRA: k = Banzuke.Rank.MAEGASHIRA
		current_counts[k] = current_counts.get(k, 0) + 1
		
	for rank_key in caps.keys():
		var needed = caps[rank_key] - current_counts.get(rank_key, 0)
		for i in range(needed):
			tournament_participants.append(_create_ghost_rikishi(rank_key))

func _initialize_ai_stables():
	# Player Stable
	var player_stable = Stable.new("player_stable", "若葉部屋", Stable.Trait.BALANCED)
	Global.stables[player_stable.id] = player_stable
	
	# AI Stables Generation
	var prefixes = ["高", "若", "琴", "千代", "北", "栃", "武蔵", "春日", "伊勢", "佐渡", "玉", "清", "藤", "大", "貴", "豊", "朝", "霧", "鶴", "旭"]
	var suffixes = ["山", "川", "海", "風", "波", "里", "若", "戸", "峰", "王", "錦", "国", "関", "灘", "花"]
	
	var generated_names = []
	var traits = [Stable.Trait.BALANCED, Stable.Trait.POWER_HOUSE, Stable.Trait.TECHNICAL, Stable.Trait.SPEED_STAR, Stable.Trait.SPARTAN]
	
	for i in range(45):
		var s_name = ""
		for retry in range(10):
			var pre = prefixes.pick_random()
			var suf = suffixes.pick_random()
			s_name = pre + suf + "部屋"
			if not s_name in generated_names:
				generated_names.append(s_name)
				break
				
		var s_trait = traits.pick_random()
		var s_id = "ai_stable_%d" % i
		var s = Stable.new(s_id, s_name, s_trait)
		Global.stables[s.id] = s
		
	# Pick random "Golden Era" stable (Excluding player)
	var all_ids = Global.stables.keys().filter(func(k): return k != "player_stable")
	Global.current_era_stable_id = all_ids.pick_random()
	print("Current Era Dominated By: ", Global.stables[Global.current_era_stable_id].name)

func _create_ghost_rikishi(rank: int) -> Rikishi:
	var g = Rikishi.new()
	g.id = str(randi()) # Temp ID for ghost
	
	# Assign Random Stable
	var stable_ids = Global.stables.keys()
	var ai_stable_ids = stable_ids.filter(func(id): return id != "player_stable")
	var assigned_stable_id = ai_stable_ids.pick_random()
	
	# Golden Era Logic: High chance to belong to dominant stable if high rank
	if Global.current_era_stable_id != "":
		# Higher ranks likely to be from Dominant Stable
		var era_chance = 0.1
		if rank <= Banzuke.Rank.OZEKI: era_chance = 0.6
		elif rank <= Banzuke.Rank.KOMUSUBI: era_chance = 0.4
		elif rank <= Banzuke.Rank.MAEGASHIRA: era_chance = 0.2
		
		if randf() < era_chance:
			assigned_stable_id = Global.current_era_stable_id
		
	g.heya_id = assigned_stable_id
	var stable = Global.stables[assigned_stable_id]
	
	# Era Boost (If in dominant stable)
	var era_bonus_mult = 1.0
	var era_stat_bonus = 0.0
	if assigned_stable_id == Global.current_era_stable_id:
		era_bonus_mult = 1.2 # 20% better traits/potential
		era_stat_bonus = 10.0 # Base stat boost
	
	# Generate Name: Use stable kanji/trait if possible?
	# For now, just random prefix.
	g.name = NameGenerator.generate_name("山", true, [], false)
	if g.name == "Unknown": g.name = "Ghost-%s" % Banzuke.get_rank_name(rank)
	
	g.rank = rank as Banzuke.Rank
	g.is_east = (randf() > 0.5)
	
	var base_stat = 30.0 + (rank * 15.0)
	
	# Apply Stable Traits
	var bonuses = stable.get_generation_bonuses()
	
	g.strength = randf_range(base_stat - 10.0, base_stat + 20.0) + bonuses["strength"] + era_stat_bonus
	g.weight = randf_range(100.0, 160.0) + bonuses["weight"]
	g.speed = randf_range(base_stat - 10.0, base_stat + 15.0) + bonuses["speed"] + (era_stat_bonus * 0.5)
	g.technique = randf_range(base_stat - 10.0, base_stat + 15.0) + bonuses["technique"] + (era_stat_bonus * 0.5)
	g.mental = 100.0 + bonuses["mental"] + era_stat_bonus
	
	g.stamina_max = 100.0
	g.stamina_current = 100.0
	
	# Assign Random Traits (0 to 3)
	var trait_count = 0
	var roll = randf() / era_bonus_mult # Better chance for traits if era boosted
	if roll < 0.1: trait_count = 3 # Rare
	elif roll < 0.3: trait_count = 2
	elif roll < 0.7: trait_count = 1
	
	for i in range(trait_count):
		var t = TraitData.get_random_trait()
		g.add_trait(t)
	
	# Growth Speed
	g.growth_speed = randf_range(0.8, 1.2) * era_bonus_mult
	
	# Peak Age (Avg 25)
	g.peak_age = randi_range(24, 27)
	
	# Apply Trait Modifiers to Peak Age
	if g.has_trait("Late Bloomer"): g.peak_age += 4 # Peak ~29, Retire late
	if g.has_trait("Early Bloomer"): g.peak_age -= 3 # Peak ~22, Retire early
	if g.has_trait("Iron Man"): g.peak_age += 2
	if g.has_trait("Glass Knees"): g.peak_age -= 2
		
	return g

func _add_initial_rikishi(p_name: String = "若葉山", p_age: int = 18):
	var r = Rikishi.new()
	r.name = p_name
	r.age = p_age
	r.rank = Banzuke.Rank.JONOKUCHI # Changed to Jonokuchi
	r.strength = 50.0 # Rookie Strength
	r.speed = 50.0
	r.technique = 40.0
	r.mental = 40.0
	r.weight = 100.0
	r.id = str(randi())
	r.heya_id = "player_stable"
	r.add_trait("Edge Master") # Starter Trait
	r.growth_speed = 1.2 # High growth for new player
	r.peak_age = 25
	rikishi_list.append(r)

func _make_pairings_for_day(day: int):
	# Clear old pairings
	for r in tournament_participants:
		r.next_opponent = null
		
	# Filter today's fighters
	var fighters = []
	for r in tournament_participants:
		if _matches_schedule(r, day):
			fighters.append(r)
	
	# Sort by Rank (Score sort later)
	# Add slight randomness to ensure we don't always pick the EXACT same order for identical ranks
	fighters.shuffle()
	fighters.sort_custom(func(a, b): return a.rank > b.rank)
	
	var used = []
	for i in range(fighters.size()):
		var p1 = fighters[i]
		if p1 in used: continue
		
		# Find opponent
		var opponent = null
		
		for j in range(i + 1, fighters.size()):
			var p2 = fighters[j]
			if p2 in used: continue
			
			# RULE 1: No Rematches (Standard Sumo)
			if p2 in p1.faced_opponents: continue
			
			# RULE 2: Same Stable Check 
			# Now we have real stables
			if p1.heya_id == p2.heya_id and p1.heya_id != "":
				continue
			
			opponent = p2
			break
			
		if opponent:
			p1.next_opponent = opponent
			opponent.next_opponent = p1
			used.append(p1)
			used.append(opponent)
		else:
			pass

func _process_tournament_day():
	print("Processing Day: ", current_tournament_day)
	
	# 1. Resolve Pre-made Matches
	var resolved_users = []
	
	for r in tournament_participants:
		if r in resolved_users: continue
		if r.next_opponent == null: continue
		
		var opp = r.next_opponent
		_resolve_match_pair(r, opp)
		
		resolved_users.append(r)
		resolved_users.append(opp)
	
	# 2. Advance Day
	current_tournament_day += 1
	
	if current_tournament_day > 15:
		_end_tournament()
	else:
		# 3. Pair New Matches
		_make_pairings_for_day(current_tournament_day)
		
		# Update View
		if current_view is TournamentDashboard:
			current_view.update_dashboard(current_tournament_day, rikishi_list)
		
		next_btn.text = "%d日目へ" % current_tournament_day

func _resolve_match_pair(east: Rikishi, west: Rikishi):
	# Identify East/West for calculation (Just semantics here, physics use stats)
	var e_kado = (east.rank == Banzuke.Rank.OZEKI and east.wins < 8 and (15 - current_tournament_day + east.wins < 8))
	var w_kado = (west.rank == Banzuke.Rank.OZEKI and west.wins < 8)
	
	var res = MatchEngine.resolve_match(east, west, e_kado, w_kado)
	var win = res["winner"]
	var lose = res["loser"]
	var kim = res["kimarite"]
	
	win.wins += 1
	win.results_history.append(true)
	win.winning_kimarite_history.append(kim)
	
	lose.losses += 1
	lose.results_history.append(false)
	
	# Record Matchup (Prevent Rematch)
	east.faced_opponents.append(west)
	west.faced_opponents.append(east)
	
	# Record Rivalry Data
	_update_rival_data(win, lose, true)
	_update_rival_data(lose, win, false)
	
	# --- Economics (Popularity & Money) ---
	_update_popularity(win, true, kim)
	_update_popularity(lose, false, kim)
	
	# Prize Money (Kensho-kin)
	# Only if Player Rikishi wins? Or do we get share of gate?
	# Usually Kensho goes to Winner.
	if win in rikishi_list:
		var prize = _calc_prize_money(win, lose)
		if prize > 0:
			Global.money += prize
			print("Kensho! %s won ¥%d" % [win.name, prize])
			_update_header_info() # Refresh UI

func _update_popularity(r: Rikishi, is_win: bool, kimarite: String):
	var delta = 0.0
	
	if is_win:
		delta += 0.5
		# Flashy Kimarite Bonus
		if kimarite in ["掬い投げ", "上手出し投げ", "内無双", "河津掛け"]:
			delta += 0.5
		elif kimarite in ["突き落とし", "叩き込み", "引き落とし"]:
			delta -= 0.1 # Disliked cheap wins? (Optional flavor)
			
		# Streak Bonus
		if r.wins >= 3: delta += 0.2
		if r.wins >= 8: delta += 0.5 # Kachi-koshi momentum
	else:
		delta -= 0.1 # Loss penalty
		
	r.popularity = clampf(r.popularity + delta, 0.0, 100.0)
	
	# Koenkai Rank Check
	var old_rank = r.koenkai_rank
	if r.popularity >= 90.0: r.koenkai_rank = 4
	elif r.popularity >= 70.0: r.koenkai_rank = 3
	elif r.popularity >= 40.0: r.koenkai_rank = 2
	elif r.popularity >= 15.0: r.koenkai_rank = 1
	else: r.koenkai_rank = 0
	
	if r.koenkai_rank > old_rank:
		print("%s's Supporters grew! Rank: %d" % [r.name, r.koenkai_rank])

func _calc_prize_money(winner: Rikishi, loser: Rikishi) -> int:
	# Base Prize depends on Rank
	# Only Juryo+ gets paid usually.
	if winner.rank > Banzuke.Rank.JURYO: return 0
	
	var base = 30000 # 30k yen per win base
	if winner.rank <= Banzuke.Rank.MAKUSHITA: base = 1000 # Allowance?
	
	# Popularity Multiplier (More Kensho sponsors)
	var pop_factor = (winner.popularity + loser.popularity) / 10.0 # 0 - 20
	var kensho_count = int(pop_factor)
	var kensho_val = 60000 # 60k per flag (real sumo is 62k -> 30k take home?)
	
	return base + (kensho_count * kensho_val)

func _update_rival_data(r: Rikishi, opp: Rikishi, is_win: bool):
	if not r.rivals.has(opp.id):
		# Old format: {losses: int...} -> New format {loss_history: [], win_history: []}
		r.rivals[opp.id] = {
			"loss_history": [],
			"win_history": []
		}
		
	var d = r.rivals[opp.id]
	if is_win:
		if not d.has("win_history"): d["win_history"] = [] # Migration safety
		d["win_history"].append(Global.global_basho_count)
	else:
		if not d.has("loss_history"): d["loss_history"] = []
		d["loss_history"].append(Global.global_basho_count)

func _matches_schedule(r: Rikishi, day: int) -> bool:
	# Makuuchi / Juryo: Every day
	if r.rank >= Banzuke.Rank.JURYO:
		return true
		
	# Makushita & Below: 7 days total (Approx every 2 days)
	# FIX: Ensure max 7 bouts
	if (r.wins + r.losses) >= 7:
		return false
	
	# Logic:
	# East: Odds
	# West: Evens
	if r.is_east:
		return (day % 2 != 0) # Odd days
	else:
		return (day % 2 == 0) # Even days

func _end_tournament(show_results: bool = false):
	print("--- 千秋楽終了 ---")
	
	Banzuke.resolve_tournament(rikishi_list)
	
	# Increment Global Basho Count
	# Increment Global Basho Count
	Global.global_basho_count += 1
	
	# Update Age & Decline for all Rikishi
	for r in rikishi_list:
		r.update_age_and_decline()
	
	# Retirements
	# Retirements Check
	# We iterate backwards or create a copy to safely remove
	var retiring: Array[Rikishi] = []
	
	for r in rikishi_list:
		var should_retire = false
		# Force retire if over 40 (Absolute Limit)
		if r.age >= 40: should_retire = true
		
		# "Decline & Rank Drop" Logic
		# Only check if started declining (Age > Peak) to avoid early career variance
		if r.age > r.peak_age:
			var rank_diff = int(r.highest_rank) - int(r.rank)
			
			# Case A: Elite (Komusubi+) falling significantly
			if r.highest_rank >= Banzuke.Rank.KOMUSUBI:
				# Dropped 3 tiers (e.g. Yokozuna -> Komusubi/Maegashira top, Ozeki -> Maegashira)
				if rank_diff >= 3:
					print("Retired (Decline): %s dropped from %s to %s" % [r.name, Banzuke.get_rank_name(r.highest_rank), Banzuke.get_rank_name(r.rank)])
					should_retire = true
					
			# Case B: Sekitori (Juryo+) falling to Makushita
			elif r.highest_rank >= Banzuke.Rank.JURYO:
				if r.rank <= Banzuke.Rank.MAKUSHITA:
					print("Retired (Demotion): %s fell to Makushita" % r.name)
					should_retire = true
			
			# Case C: Lower Ranks (Makushita and below)
			# If they never reached Juryo, maybe retire if they stagnate or drop?
			# For now, rely on Age limits or if they drop to Jonokuchi.
			elif r.rank == Banzuke.Rank.JONOKUCHI and r.age >= 30:
				should_retire = true
		
		# Yokozuna Special Rule: Retire if 2 Career Make-koshis at Yokozuna rank
		if r.rank == Banzuke.Rank.YOKOZUNA:
			var mk_count = 0
			for h in r.history:
				if h["rank"] == Banzuke.Rank.YOKOZUNA and h["wins"] < 8:
					mk_count += 1
			
			if mk_count >= 2:
				print("Retired (Yokozuna Terms): %s failed to uphold the rank (2 Make-koshi)" % r.name)
				should_retire = true
		
		if should_retire:
			retiring.append(r)
	
	for r in retiring:
		_handle_retirement(r)
	
	# If everyone retired (should be only 1), successor event later?
	# We handle it immediately in _handle_retirement for now.
	
	if show_results:
		_switch_view(ResultViewScene)
		if current_view.has_signal("return_to_stable_pressed"):
			current_view.return_to_stable_pressed.connect(_on_return_to_stable)
		return
	else:
		_on_return_to_stable()

func _on_return_to_stable():
	current_state = State.STABLE
	turns_until_basho = 4 # Reset turns
	nav_bar.visible = true
	next_btn.text = "場所開始"
	_update_header_info()
	
	if rikishi_list.is_empty():
		_switch_view(SetupViewScene)
		nav_bar.visible = false
	else:
		_switch_view(InstructionViewScene)

# --- Recruit Logic ---
func _handle_retirement(r: Rikishi):
	print("!!! 引退 !!!: ", r.name)
	
	# Determine Hall of Fame Tier
	var tier = "Local Hero (Bronze)"
	var note = "部屋を支えた功労者"
	
	if r.highest_rank == Banzuke.Rank.YOKOZUNA:
		tier = "Legend (Platinum)"
		note = "歴史にその名を刻む大横綱"
	elif r.highest_rank == Banzuke.Rank.OZEKI:
		tier = "Legend (Platinum)"
		note = "名大関"
	elif r.highest_rank >= Banzuke.Rank.KOMUSUBI: # Sanyaku
		tier = "Star (Gold)"
		note = "幕内の実力者"
	elif r.highest_rank >= Banzuke.Rank.MAEGASHIRA: # Makuuchi
		tier = "Star (Gold)"
		note = "幕内力士"
	elif r.highest_rank >= Banzuke.Rank.JURYO: # Juryo
		tier = "Pro (Silver)"
		note = "十両、関取の意地"
	
	var record = {
		"name": r.name,
		"highest_rank": Banzuke.get_rank_name(r.highest_rank),
		"career_wins": r.wins, # Needs total wins... currently r.wins is basho wins.
		# todo: We need 'total_wins' in Rikishi for proper record. For now just placeholder.
		"tier": tier,
		"note": note,
		"retire_age": r.age
	}
	
	Global.add_to_hall_of_fame(record)
	
	# Remove from list
	rikishi_list.erase(r)
	
	# Check if list empty -> Go to Setup
	if rikishi_list.is_empty():
		print("No rikishi left. Go to setup.")
		_switch_view(SetupViewScene)
		nav_bar.visible = false

func _trigger_succession_event(predecessor: Rikishi):
	print("--- 新弟子入門イベント ---")
	
	# Create Successor
	var s = Rikishi.new()
	s.id = str(randi())
	s.heya_id = "player_stable"
	s.name = NameGenerator.generate_name("若", true, [], false) # Consistent naming?
	s.rank = Banzuke.Rank.JONOKUCHI
	s.age = 15
	
	# Inherit some traits or potential? (Flavor)
	# Maybe improved potential if predecessor was a Legend?
	if predecessor.highest_rank <= Banzuke.Rank.KOMUSUBI:
		s.potential *= 1.2
		s.add_trait("Legacy") # Special trait?
		print("偉大な先輩の背中を追って、期待の新弟子が入門！")
	
	if s.traits.is_empty():
		s.add_trait(TraitData.get_random_trait())
		
	rikishi_list.append(s)
	
	# Reset Turns
	turns_until_basho = 4
	_update_header_info()
	
	# Notify User (Hack: Print to console or UI log)
	print("新弟子 「%s」 が入門しました！" % s.name)
