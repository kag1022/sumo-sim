extends PanelContainer
class_name RikishiCard

# UI Components (created in _ready)
var name_label: Label
var age_label: Label
var rank_label: Label
var stats_container: HBoxContainer
var history_container: HBoxContainer
var traits_container: VBoxContainer

func _ready():
	_setup_ui()

func _setup_ui():
	# Layout
	var main_hbox = HBoxContainer.new()
	add_child(main_hbox)
	main_hbox.add_theme_constant_override("separation", 20)
	
	# 1. Left: Profile (Name, Rank, Age)
	var profile_vbox = VBoxContainer.new()
	profile_vbox.custom_minimum_size.x = 220
	main_hbox.add_child(profile_vbox)
	
	name_label = Label.new()
	name_label.add_theme_font_size_override("font_size", 24)
	name_label.add_theme_color_override("font_color", Global.UI_COLORS.text_main)
	profile_vbox.add_child(name_label)
	
	rank_label = Label.new()
	rank_label.add_theme_color_override("font_color", Global.UI_COLORS.primary) # Highlight Rank
	profile_vbox.add_child(rank_label)
	
	age_label = Label.new()
	age_label.add_theme_color_override("font_color", Global.UI_COLORS.text_sub)
	profile_vbox.add_child(age_label)
	
	# Traits Container
	traits_container = VBoxContainer.new()
	traits_container.add_theme_constant_override("separation", 2)
	profile_vbox.add_child(traits_container)
	
	# 2. Center: Stats (Bars)
	stats_container = HBoxContainer.new()
	stats_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	stats_container.add_theme_constant_override("separation", 20)
	main_hbox.add_child(stats_container)
	
	# 3. Right: History (Dots)
	history_container = HBoxContainer.new()
	history_container.add_theme_constant_override("separation", 4)
	main_hbox.add_child(history_container)
	
	# --- Apply Modern Style ---
	_apply_card_style()
	
	# Signals
	mouse_entered.connect(_on_hover_enter)
	mouse_exited.connect(_on_hover_exit)

func _apply_card_style():
	var sb = StyleBoxFlat.new()
	sb.bg_color = Global.UI_COLORS.bg_glass
	sb.border_color = Global.UI_COLORS.border_glass
	sb.border_width_left = 1; sb.border_width_top = 1
	sb.border_width_right = 1; sb.border_width_bottom = 1
	sb.corner_radius_top_left = 16
	sb.corner_radius_top_right = 16
	sb.corner_radius_bottom_left = 16
	sb.corner_radius_bottom_right = 16
	
	# Shadow
	sb.shadow_color = Global.UI_COLORS.shadow
	sb.shadow_size = 8
	sb.shadow_offset = Vector2(0, 4)
	
	# Padding
	sb.content_margin_left = 20
	sb.content_margin_right = 20
	sb.content_margin_top = 16
	sb.content_margin_bottom = 16
	
	add_theme_stylebox_override("panel", sb)

func _on_hover_enter():
	var t = create_tween().set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	t.tween_property(self, "scale", Vector2(1.02, 1.02), 0.2)
	# Glow Effect (Tweening stylebox override is tricky, we can simulate by modulation or secondary panel)
	# Simple: Just scale is good.
	
func _on_hover_exit():
	var t = create_tween().set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	t.tween_property(self, "scale", Vector2(1.0, 1.0), 0.2)

func update_info(r: Rikishi):
	# Profile
	name_label.text = r.name
	rank_label.text = r.get_rank_name()
	age_label.text = "%d歳" % r.age
	
	# Stats (Bars)
	_clear_children(stats_container)
	# Use raw values or ranks mapped to 0-100?
	# ranks are SSS, etc. Let's use the raw value if possible or convert rank back for bar.
	# Rikishi has raw stats strength, weight, speed, etc.
	
	# We will create a VBox for stats column
	var stats_col1 = VBoxContainer.new()
	stats_col1.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	stats_container.add_child(stats_col1)
	
	_add_stat_bar(stats_col1, "筋力", r.strength / 100.0, r.get_strength_rank()) # Approx max 100?
	_add_stat_bar(stats_col1, "瞬発", r.speed / 100.0, r.get_speed_rank())
	
	var stats_col2 = VBoxContainer.new()
	stats_col2.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	stats_container.add_child(stats_col2)
	
	_add_stat_bar(stats_col2, "技術", r.technique / 100.0, r.get_tech_rank())
	_add_stat_bar(stats_col2, "精神", r.mental / 100.0, r.get_mental_rank())
	
	# Popularity Bar (New)
	_add_stat_bar(stats_col1, "人気", r.popularity / 100.0, str(int(r.popularity)))
	var k_rank_str = ["-", "小", "中", "大", "超"][r.koenkai_rank]
	_add_stat_bar(stats_col2, "後援会", float(r.koenkai_rank) / 4.0, k_rank_str)

	# Traits (New)
	_clear_children(traits_container)
	if not r.traits.is_empty():
		var t_label = Label.new()
		t_label.text = "【特性】"
		t_label.add_theme_font_size_override("font_size", 12)
		t_label.add_theme_color_override("font_color", Global.UI_COLORS.text_sub)
		traits_container.add_child(t_label)
		
		for t_key in r.traits:
			var l = Label.new()
			l.text = "・%s" % TraitData.get_trait_name(t_key)
			l.tooltip_text = TraitData.get_trait_desc(t_key)
			l.add_theme_font_size_override("font_size", 14)
			l.add_theme_color_override("font_color", Color("#fdcb6e")) # Gold-ish
			traits_container.add_child(l)

	# History (Recent)
	_clear_children(history_container)
	for i in range(r.wins):
		_add_history_dot(true)
	for i in range(r.losses):
		_add_history_dot(false)

func _add_stat_bar(parent, label_text: String, ratio: float, rank_str: String):
	# Row: Label [Bar......] Rank
	var hbox = HBoxContainer.new()
	parent.add_child(hbox)
	
	var name_l = Label.new()
	name_l.text = label_text
	name_l.custom_minimum_size.x = 40
	name_l.add_theme_font_size_override("font_size", 12)
	name_l.add_theme_color_override("font_color", Global.UI_COLORS.text_sub)
	hbox.add_child(name_l)
	
	# Bar
	var bar = ProgressBar.new()
	bar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	bar.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	bar.show_percentage = false
	bar.value = ratio * 100.0
	bar.custom_minimum_size.y = 8
	
	# Style the bar
	var bg = StyleBoxFlat.new()
	bg.bg_color = Color(0, 0, 0, 0.5)
	bg.corner_radius_top_left = 4; bg.corner_radius_bottom_left = 4
	bg.corner_radius_top_right = 4; bg.corner_radius_bottom_right = 4
	bar.add_theme_stylebox_override("background", bg)
	
	var fill = StyleBoxFlat.new()
	# Color based on value? Or fixed?
	# For popularity, let's use Gold/Yellow.
	var col = Global.RANK_COLORS.get(rank_str, Global.UI_COLORS.primary)
	if label_text == "人気": col = Color("#fab1a0") # Salmon/Gold
	if label_text == "後援会": col = Color("#ffeaa7") # Gold
	
	fill.bg_color = col
	fill.corner_radius_top_left = 4; fill.corner_radius_bottom_left = 4 # Fix Typo in copy
	fill.corner_radius_top_right = 4; fill.corner_radius_bottom_right = 4
	
	# Gradient feel?
	# Godot 4 ProgressBar fill stylebox.
	bar.add_theme_stylebox_override("fill", fill)
	
	hbox.add_child(bar)
	
	# Rank Text
	var r_l = Label.new()
	r_l.text = rank_str
	r_l.custom_minimum_size.x = 30
	r_l.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	r_l.add_theme_font_size_override("font_size", 14)
	r_l.add_theme_color_override("font_color", col)
	hbox.add_child(r_l)

func _add_history_dot(is_win: bool):
	var dot = Panel.new()
	dot.custom_minimum_size = Vector2(10, 10) # Smaller dots
	var sb = StyleBoxFlat.new()
	sb.corner_radius_top_left = 5; sb.corner_radius_top_right = 5
	sb.corner_radius_bottom_left = 5; sb.corner_radius_bottom_right = 5
	
	if is_win:
		sb.bg_color = Color.WHITE # White star
		# Add glow
		sb.shadow_color = Color(1, 1, 1, 0.5)
		sb.shadow_size = 4
	else:
		sb.bg_color = Color(0.2, 0.2, 0.2, 1.0) # Dark star
		sb.border_width_left = 1; sb.border_width_right = 1
		sb.border_width_top = 1; sb.border_width_bottom = 1
		sb.border_color = Color(0.5, 0.5, 0.5)
		
	dot.add_theme_stylebox_override("panel", sb)
	history_container.add_child(dot)

func _clear_children(node: Node):
	for c in node.get_children():
		c.queue_free()
