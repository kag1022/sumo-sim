extends Control
class_name ScoutView

signal rikishi_recruited(rikishi: Rikishi)
# signal candidates_updated(list: Array[Rikishi]) # No longer needed for single Gacha style

# UI Elements
var ticket_label: Label
var opt_route: OptionButton
var opt_origin: OptionButton
var scout_btn: Button
var result_container: Control
var result_card_container: Control

# Costs
const COST_MAEZUMO = 100000
const COST_TSUKEDASHI = 5000000

# Origins
const ORIGINS = ["北海道/東北", "関東", "中部/北陸", "関西", "中国/四国", "九州/沖縄", "海外"]

func _ready():
	_setup_ui()

func set_candidates(_list: Array[Rikishi]):
	# Legacy compatibility or for restoring result? 
	# For now, this new mode is "Instant", so we might not need to restore a "List".
	# If we want to restore the *Last Scouted Result*, we could.
	pass

func _setup_ui():
	# Clear children if any (re-building)
	for c in get_children():
		c.queue_free()
		
	var main_vbox = VBoxContainer.new()
	main_vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	# Padding
	var margin = MarginContainer.new()
	margin.add_theme_constant_override("margin_top", 20); margin.add_theme_constant_override("margin_bottom", 20)
	margin.add_theme_constant_override("margin_left", 30); margin.add_theme_constant_override("margin_right", 30)
	margin.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(margin)
	margin.add_child(main_vbox)
	
	# 1. Header
	var header = HBoxContainer.new()
	main_vbox.add_child(header)
	
	ticket_label = Label.new()
	_update_header()
	ticket_label.add_theme_font_size_override("font_size", 20)
	header.add_child(ticket_label)
	
	main_vbox.add_child(HSeparator.new())
	
	# 2. Main Content (Split: Left=Config, Right=Result)
	var content_hbox = HBoxContainer.new()
	content_hbox.size_flags_vertical = Control.SIZE_EXPAND_FILL
	content_hbox.add_theme_constant_override("separation", 40)
	main_vbox.add_child(content_hbox)
	
	# --- Left: Scout Config ---
	var config_panel = PanelContainer.new()
	ThemeUtils.apply_panel_bg(config_panel)
	config_panel.custom_minimum_size.x = 400
	content_hbox.add_child(config_panel)
	
	var config_vbox = VBoxContainer.new()
	config_vbox.add_theme_constant_override("separation", 24)
	var cm = MarginContainer.new()
	cm.add_theme_constant_override("margin_left", 20); cm.add_theme_constant_override("margin_right", 20)
	cm.add_theme_constant_override("margin_top", 20); cm.add_theme_constant_override("margin_bottom", 20)
	config_panel.add_child(cm)
	cm.add_child(config_vbox)
	
	var title = Label.new()
	title.text = "スカウト条件設定"
	title.add_theme_font_size_override("font_size", 24)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	config_vbox.add_child(title)
	
	# Route Option
	var route_lbl = Label.new()
	route_lbl.text = "◆ 入門経路"
	route_lbl.add_theme_color_override("font_color", Global.UI_COLORS.primary)
	config_vbox.add_child(route_lbl)
	
	opt_route = OptionButton.new()
	opt_route.add_item("前相撲 (一般/中卒) - ¥10万", 0) # Middle School
	opt_route.add_item("高校卒業 (18歳) - ¥30万", 1) # High School
	opt_route.add_item("学生横綱 (付け出し) - ¥500万", 2) # University
	opt_route.selected = 0
	config_vbox.add_child(opt_route)
	
	# Origin Option
	var origin_lbl = Label.new()
	origin_lbl.text = "◆ 出身地"
	origin_lbl.add_theme_color_override("font_color", Global.UI_COLORS.primary)
	config_vbox.add_child(origin_lbl)
	
	opt_origin = OptionButton.new()
	for o in ORIGINS:
		opt_origin.add_item(o)
	config_vbox.add_child(opt_origin)
	
	# Spacer
	config_vbox.add_child(Control.new())
	
	# Button
	scout_btn = Button.new()
	scout_btn.text = "スカウト実行"
	scout_btn.custom_minimum_size.y = 60
	ThemeUtils.apply_accent_button_style(scout_btn)
	scout_btn.pressed.connect(_on_scout_pressed)
	config_vbox.add_child(scout_btn)
	
	# --- Right: Result Area ---
	result_container = Control.new()
	result_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	result_container.size_flags_vertical = Control.SIZE_EXPAND_FILL
	content_hbox.add_child(result_container)
	
	# Placeholder Text
	var ph = Label.new()
	ph.text = "条件を選択して\nスカウトを実行してください"
	ph.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	ph.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	ph.add_theme_color_override("font_color", Color(1, 1, 1, 0.3))
	ph.set_anchors_preset(Control.PRESET_CENTER)
	result_container.add_child(ph)
	
	# Actual Card Container (Hidden initially)
	result_card_container = CenterContainer.new()
	result_card_container.set_anchors_preset(Control.PRESET_FULL_RECT)
	result_card_container.visible = false
	result_container.add_child(result_card_container)

func _update_header():
	ticket_label.text = "資金: ¥%d" % Global.money

func _on_scout_pressed():
	var route_idx = opt_route.selected
	var cost = 100000 # Default (MS)
	
	if route_idx == 1: cost = 300000 # HS
	elif route_idx == 2: cost = 5000000 # Uni
	
	if Global.money < cost:
		scout_btn.text = "資金不足！"
		var t = create_tween()
		t.tween_property(scout_btn, "modulate", Color.RED, 0.2)
		t.tween_property(scout_btn, "modulate", Color.WHITE, 0.2).set_delay(1.0)
		t.tween_callback(func(): scout_btn.text = "スカウト実行")
		return
		
	# Pay
	Global.money -= cost
	_update_header()
	
	# Generate
	var r = _generate_rikishi(route_idx, opt_origin.text)
	
	# Show Result
	_show_result(r)
	
	# Emit
	rikishi_recruited.emit(r)

func _generate_rikishi(route_idx: int, origin: String) -> Rikishi:
	var r = Rikishi.new()
	
	# Origin
	r.shusshin = origin
	
	# Name (Flavor)
	r.name = NameGenerator.generate_name("山", true, [], true)
	
	# Random Stats Common Config
	r.growth_speed = randf_range(0.85, 1.15)
	r.peak_age = randi_range(24, 27) # Default range
	
	if route_idx == 2: # Tsukedashi (Uni)
		r.highest_rank = Banzuke.Rank.MAKUSHITA
		r.rank = Banzuke.Rank.MAKUSHITA
		r.rank_number = 60
		r.age = 22
		r.peak_age = randi_range(24, 26) # Peak soon
		
		# High Base Stats, Lower Potential
		r.potential = randf_range(2.0, 3.5)
		r.strength = randf_range(70.0, 90.0)
		r.weight = randf_range(130.0, 160.0)
		r.speed = randf_range(60.0, 80.0)
		r.technique = randf_range(60.0, 80.0)
		r.mental = randf_range(60.0, 90.0)
		
	elif route_idx == 1: # High School (New!)
		r.highest_rank = Banzuke.Rank.JONOKUCHI
		r.rank = Banzuke.Rank.JONOKUCHI
		r.rank_number = 15 # Better start pos? Or just Jonokuchi
		r.age = 18
		
		# Balanced Stats, Good Potential
		r.potential = randf_range(2.5, 4.0)
		r.strength = randf_range(50.0, 75.0) # Better than MS
		r.weight = randf_range(100.0, 145.0)
		r.speed = randf_range(40.0, 65.0)
		r.technique = randf_range(30.0, 55.0)
		r.mental = randf_range(40.0, 70.0)
		
	else: # Mae-zumo (Middle School)
		r.highest_rank = Banzuke.Rank.JONOKUCHI
		r.rank = Banzuke.Rank.JONOKUCHI
		r.age = 15
		r.peak_age = randi_range(25, 29) # Late peak potential
		
		# Low Stats, Highest Potential
		r.potential = randf_range(3.0, 5.0) # Huge growth potential
		r.strength = randf_range(25.0, 50.0)
		r.weight = randf_range(80.0, 130.0)
		r.speed = randf_range(25.0, 50.0)
		r.technique = randf_range(15.0, 40.0)
	
	return r

func _show_result(r: Rikishi):
	# Clear previous
	for c in result_card_container.get_children():
		c.queue_free()
	
	result_card_container.visible = true
	
	# Create a large card or reused RikishiCard
	# We can't reuse RikishiCard easily as it's a script not a scene, 
	# but we can simulate it or instantiate if we made it a scene.
	# Wait, RikishiCard.gd is a script on a PanelContainer.
	# We can instantiate a PanelContainer and attach the script? 
	# Or just duplicate the code logic? 
	# Let's attach script dynamically or better, just create it.
	
	var card = PanelContainer.new()
	# Attach script instance
	card.set_script(load("res://scripts/RikishiCard.gd"))
	card.custom_minimum_size = Vector2(300, 500)
	result_card_container.add_child(card)
	
	# Initialize manually since _ready might have run before update_info?
	# Script attachment usually runs _init but _ready waits for tree enter.
	# It is in tree.
	
	# Apply data
	card.update_info(r)
	
	# Animation
	card.scale = Vector2(0, 0)
	var t = create_tween().set_trans(Tween.TRANS_ELASTIC).set_ease(Tween.EASE_OUT)
	t.tween_property(card, "scale", Vector2(1, 1), 0.8)
	
	# Optional: "New!" text
	var new_lbl = Label.new()
	new_lbl.text = "NEW ENTRY!"
	new_lbl.add_theme_color_override("font_color", Color.YELLOW)
	new_lbl.add_theme_font_size_override("font_size", 32)
	# Position... overlay?
