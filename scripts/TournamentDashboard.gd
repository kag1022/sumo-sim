extends Control
class_name TournamentDashboard

# UI Elements
var day_label: Label
var main_container: HBoxContainer
var rikishi_list_container: VBoxContainer
var detail_panel: PanelContainer

# State
var current_rikishi: Rikishi
var current_day: int = 1

func _ready():
	_setup_ui()

func _setup_ui():
	var main_vbox = VBoxContainer.new()
	main_vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(main_vbox)
	
	# Header
	var header = PanelContainer.new()
	ThemeUtils.apply_panel_bg(header) # Global bg color
	main_vbox.add_child(header)
	
	day_label = Label.new()
	day_label.text = "現在: 1日目"
	day_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	day_label.add_theme_font_size_override("font_size", 32)
	day_label.add_theme_color_override("font_color", Global.UI_COLORS.text_main)
	header.add_child(day_label)
	
	# Content Area
	main_container = HBoxContainer.new()
	main_container.size_flags_vertical = Control.SIZE_EXPAND_FILL
	main_container.add_theme_constant_override("separation", 20)
	main_vbox.add_child(main_container)
	
	# Left: List Selector
	var left_scroll = ScrollContainer.new()
	left_scroll.custom_minimum_size.x = 280
	left_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	
	# Style the container for list
	var left_panel = PanelContainer.new()
	ThemeUtils.apply_panel_bg(left_panel) # Or darker?
	var left_sb = StyleBoxFlat.new()
	left_sb.bg_color = Global.UI_COLORS.bg_glass
	left_sb.corner_radius_top_right = 16
	left_panel.add_theme_stylebox_override("panel", left_sb)
	
	main_container.add_child(left_scroll)
	left_scroll.add_child(left_panel)
	
	rikishi_list_container = VBoxContainer.new()
	rikishi_list_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	rikishi_list_container.add_theme_constant_override("separation", 5)
	var margin = MarginContainer.new() # Inner padding
	margin.add_theme_constant_override("margin_left", 10)
	margin.add_theme_constant_override("margin_right", 10)
	margin.add_theme_constant_override("margin_top", 10)
	left_panel.add_child(margin)
	margin.add_child(rikishi_list_container)
	
	# Right: Detail View
	detail_panel = PanelContainer.new()
	detail_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	detail_panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	ThemeUtils.apply_panel_bg(detail_panel) # Use default bg, or card white?
	# Let's make Detail Panel look like a big card
	var detail_sb = StyleBoxFlat.new()
	detail_sb.bg_color = Global.UI_COLORS.bg_glass
	detail_sb.corner_radius_top_left = 16
	detail_sb.corner_radius_bottom_left = 16
	detail_sb.shadow_size = 4
	detail_panel.add_theme_stylebox_override("panel", detail_sb)
	
	main_container.add_child(detail_panel)

func update_dashboard(day: int, list: Array[Rikishi]):
	current_day = day
	day_label.text = "場所 %d日目" % day
	
	# Update List
	for c in rikishi_list_container.get_children():
		c.queue_free()
		
	for r in list:
		var btn = Button.new()
		btn.text = r.name + " (" + r.get_rank_name() + ")"
		btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		ThemeUtils.apply_button_style(btn) # Use common button logic
		btn.pressed.connect(func(): _show_details(r))
		rikishi_list_container.add_child(btn)
		
	# Show first one by default
	if not list.is_empty() and current_rikishi == null:
		_show_details(list[0])
	elif current_rikishi != null:
		_show_details(current_rikishi) # Refresh

func _show_details(r: Rikishi):
	current_rikishi = r
	
	# Clear previous details
	for c in detail_panel.get_children():
		c.queue_free()
		
	var vbox = VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 20)
	detail_panel.add_child(vbox)
	
	# 1. Rikishi Info Header
	var info_lbl = Label.new()
	var wins = r.wins # In real logic, this should be up to current_day
	var losses = r.losses
	info_lbl.text = "%s [%s] - %d勝 %d敗" % [r.name, r.get_rank_name(), wins, losses]
	info_lbl.add_theme_font_size_override("font_size", 24)
	vbox.add_child(info_lbl)
	
	vbox.add_child(HSeparator.new())
	
	# 2. Hoshitori-hyo (Grid)
	var grid_lbl = Label.new()
	grid_lbl.text = "◆ 星取表"
	vbox.add_child(grid_lbl)
	
	var grid = GridContainer.new()
	grid.columns = 5 # 5 days per row x 3 rows = 15 days
	vbox.add_child(grid)
	
	# We need to visualize 15 days.
	# Rikishi.results_history is just [true, false]. It does NOT track the "Day" of the match.
	# To properly align, we need to know IF they fought on Day `i`.
	# For simplicity in this "Real Sumo" attempt, let's just fill the grid sequentially for now,
	# BUT mark "Vacant" days if we can deduce them.
	# Or, since we don't store "Match Day" history, we can only show sequential results.
	# However, the user says "Misaligned".
	# If a user fought on Day 1, 3, 5. current_day = 6.
	# History has 3 items.
	# Grid 1 -> Item 0 (Day 1). OK.
	# Grid 2 -> Item 1 (Day 3). WRONG VISUALLY if Grid 2 implies "Day 2".
	# If the grid implies "Bout 1, Bout 2", it's fine.
	# But `day_label` says "Day X".
	
	# *Correction*: In Sumo apps, usually the grid IS "Day 1..15".
	# If you didn't fight, it's empty.
	# We lack data to know WHICH day result #2 was for.
	# CRITICAL FIX: We must deduce schedule or change data layout.
	# Deduce: `_matches_schedule` tells us if they SHOULD fight.
	
	var history_ptr = 0
	for i in range(1, 16):
		var cell = PanelContainer.new()
		cell.custom_minimum_size = Vector2(40, 40)
		var cell_lbl = Label.new()
		cell_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		cell_lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		
		# Did they fight on Day `i`?
		# This logic duplicates HeyaManager._matches_schedule partially but...
		# We assume history matches the schedule exactly.
		var should_fight = true
		if r.rank < Banzuke.Rank.JURYO:
			# Simple logic check (Odd/Even)
			# Copying HeyaManager logic:
			if r.is_east: should_fight = (i % 2 != 0)
			else: should_fight = (i % 2 == 0)
			
		var content = "?"
		var col = Color.GRAY
		
		if not should_fight:
			content = "-"
			col = Color(1, 1, 1, 0.1) # Dim
		else:
			# This implies it consumes one history item
			if history_ptr < r.results_history.size() and i < current_day:
				# We have a past result
				var is_win = r.results_history[history_ptr]
				if is_win:
					content = "⚪"
					col = Color.WHITE
				else:
					content = "⚫"
					col = Global.UI_COLORS.text_main # Black-ish
				history_ptr += 1
			elif i == current_day:
				content = "◇" # Today
				col = Global.UI_COLORS.primary
			else:
				content = "" # Future
				
		cell_lbl.text = content
		cell_lbl.modulate = col
		cell.add_child(cell_lbl)
		grid.add_child(cell)
		
	vbox.add_child(HSeparator.new())
	
	# 3. Next Match Preview
	var match_lbl = Label.new()
	var opp = r.next_opponent
	
	if opp:
		match_lbl.text = "◆ 本日の取り組み"
	else:
		match_lbl.text = "◆ 本日の取り組み (取り組みなし)"
	vbox.add_child(match_lbl)
	
	if opp:
		var match_hbox = HBoxContainer.new()
		match_hbox.alignment = BoxContainer.ALIGNMENT_CENTER
		vbox.add_child(match_hbox)
		
		# Player Side
		var p_vbox = VBoxContainer.new()
		p_vbox.add_child(_create_stat_label(r.name, 20))
		p_vbox.add_child(_create_stat_label("筋: " + r.get_strength_rank(), 16, Global.RANK_COLORS.get(r.get_strength_rank())))
		match_hbox.add_child(p_vbox)
		
		var vs_lbl = Label.new()
		vs_lbl.text = " VS "
		vs_lbl.add_theme_font_size_override("font_size", 30)
		match_hbox.add_child(vs_lbl)
		
		# Opponent Side
		var opp_vbox = VBoxContainer.new()
		opp_vbox.add_child(_create_stat_label(opp.name, 20))
		opp_vbox.add_child(_create_stat_label(opp.get_rank_name(), 12)) # Full Rank name
		opp_vbox.add_child(_create_stat_label("筋: " + opp.get_strength_rank(), 16, Global.RANK_COLORS.get(opp.get_strength_rank())))
		match_hbox.add_child(opp_vbox)

	# 4. Analysis Button
	vbox.add_child(HSeparator.new())
	var analyze_btn = Button.new()
	analyze_btn.text = "詳細分析データ (Analysis)"
	ThemeUtils.apply_button_style(analyze_btn)
	analyze_btn.pressed.connect(func(): _open_analysis(r))
	vbox.add_child(analyze_btn)

func _open_analysis(r: Rikishi):
	var av = load("res://scenes/AnalysisView.tscn").instantiate()
	av.set_data(r)
	add_child(av) # Add as overlay on top of Dashboard

func _create_stat_label(txt, font_size, col = Color.WHITE):
	var l = Label.new()
	l.text = txt
	l.add_theme_font_size_override("font_size", font_size)
	l.add_theme_color_override("font_color", col)
	return l
