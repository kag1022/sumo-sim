class_name ResultView
extends Control

signal return_to_stable_pressed

var rikishi_data: Array = []
var list_container: VBoxContainer

func _ready():
	_setup_ui()

func _setup_ui():
	# Background
	var bg = ColorRect.new()
	bg.color = Global.UI_COLORS.bg_main
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)
	
	var main_vbox = VBoxContainer.new()
	main_vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	main_vbox.add_theme_constant_override("separation", 20)
	add_child(main_vbox)
	
	# Header
	var header = MarginContainer.new()
	header.add_theme_constant_override("margin_top", 30)
	header.add_theme_constant_override("margin_left", 30)
	main_vbox.add_child(header)
	
	var lbl = Label.new()
	lbl.text = "場所結果 (Tournament Results)"
	lbl.add_theme_font_size_override("font_size", 32)
	header.add_child(lbl)
	
	# Scroll Area for List
	var scroll = ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	main_vbox.add_child(scroll)
	
	var m = MarginContainer.new()
	m.add_theme_constant_override("margin_left", 40)
	m.add_theme_constant_override("margin_right", 40)
	m.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(m)
	
	list_container = VBoxContainer.new()
	list_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	list_container.add_theme_constant_override("separation", 10)
	m.add_child(list_container)
	
	# Footer
	var footer = MarginContainer.new()
	footer.add_theme_constant_override("margin_bottom", 30)
	footer.add_theme_constant_override("margin_right", 30)
	main_vbox.add_child(footer)
	
	var btn_hbox = HBoxContainer.new()
	btn_hbox.alignment = BoxContainer.ALIGNMENT_END
	footer.add_child(btn_hbox)
	
	var ok_btn = Button.new()
	ok_btn.text = "部屋に戻る"
	ok_btn.custom_minimum_size = Vector2(200, 60)
	ThemeUtils.apply_accent_button_style(ok_btn)
	ok_btn.pressed.connect(func(): return_to_stable_pressed.emit())
	btn_hbox.add_child(ok_btn)

func set_data(list: Array):
	rikishi_data = list
	_populate_list()

func _populate_list():
	for c in list_container.get_children(): c.queue_free()
	
	for r in rikishi_data:
		var row = PanelContainer.new()
		ThemeUtils.apply_panel_bg(row) # Or create a custom style
		list_container.add_child(row)
		
		var hbox = HBoxContainer.new()
		hbox.add_theme_constant_override("separation", 20)
		var m = MarginContainer.new()
		m.add_theme_constant_override("margin_left", 20)
		m.add_theme_constant_override("margin_right", 20)
		m.add_theme_constant_override("margin_top", 10)
		m.add_theme_constant_override("margin_bottom", 10)
		row.add_child(m)
		m.add_child(hbox)
		
		# Name & Rank
		var info_vbox = VBoxContainer.new()
		info_vbox.custom_minimum_size.x = 200
		hbox.add_child(info_vbox)
		
		var name_l = Label.new()
		name_l.text = r.name
		name_l.add_theme_font_size_override("font_size", 24)
		info_vbox.add_child(name_l)
		
		var rank_l = Label.new()
		rank_l.text = r.get_rank_name()
		rank_l.add_theme_color_override("font_color", Global.UI_COLORS.text_sub)
		info_vbox.add_child(rank_l)
		
		# Score
		var score_l = Label.new()
		score_l.text = "%d勝 %d敗" % [r.wins, r.losses]
		score_l.add_theme_font_size_override("font_size", 32)
		if r.wins >= 8:
			score_l.add_theme_color_override("font_color", Global.UI_COLORS.accent) # Kachi-koshi
		elif r.losses >= 8:
			score_l.add_theme_color_override("font_color", Color.GRAY) # Make-koshi
		hbox.add_child(score_l)
		
		# Spacer
		var sp = Control.new()
		sp.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		hbox.add_child(sp)
		
		# Analysis Button
		var ana_btn = Button.new()
		ana_btn.text = "分析"
		ThemeUtils.apply_button_style(ana_btn)
		ana_btn.pressed.connect(func(): _open_analysis(r))
		hbox.add_child(ana_btn)

func _open_analysis(r):
	var av = load("res://scenes/AnalysisView.tscn").instantiate()
	av.set_data(r)
	add_child(av)
