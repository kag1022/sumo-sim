extends Control
class_name RosterView

# Dependencies
const RikishiCardScene = preload("res://scenes/RikishiCard.tscn")

# State
var current_tab: String = "All" # All, Makuuchi, Juryo, Makushita_Below
var current_rikhisi_list: Array[Rikishi] = []
var sort_mode: String = "Rank" # Rank, Age, Potential

# UI Elements
var list_container: VBoxContainer
var tab_container: HBoxContainer
var sort_container: HBoxContainer

func _ready():
	_setup_ui()

func _setup_ui():
	var main_vbox = VBoxContainer.new()
	main_vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(main_vbox)
	
	# Header (Tabs)
	tab_container = HBoxContainer.new()
	tab_container.add_theme_constant_override("separation", 12)
	main_vbox.add_child(tab_container)
	_add_tab_button("全員", "All")
	_add_tab_button("幕内", "Makuuchi")
	_add_tab_button("十両", "Juryo")
	_add_tab_button("幕下以下", "Makushita_Below")
	
	# Sub-Header (Sort)
	sort_container = HBoxContainer.new()
	sort_container.add_theme_constant_override("separation", 12)
	main_vbox.add_child(sort_container)
	var sort_label = Label.new()
	sort_label.text = "ソート:"
	sort_label.add_theme_color_override("font_color", Global.UI_COLORS.text_sub)
	sort_container.add_child(sort_label)
	_add_sort_button("番付順", "Rank")
	_add_sort_button("期待の若手", "Potential")
	_add_sort_button("引退間近", "Age")
	
	# Scroll Area for List
	var scroll = ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	# Add padding
	var margin = MarginContainer.new()
	margin.add_theme_constant_override("margin_top", 12)
	margin.add_theme_constant_override("margin_bottom", 12)
	margin.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	margin.size_flags_vertical = Control.SIZE_EXPAND_FILL
	main_vbox.add_child(margin)
	margin.add_child(scroll)
	
	list_container = VBoxContainer.new()
	list_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	list_container.add_theme_constant_override("separation", 12) # Gap between cards
	scroll.add_child(list_container)

func set_data(list: Array[Rikishi]):
	current_rikhisi_list = list
	refresh_list()

func refresh_list():
	# Clean up
	for c in list_container.get_children():
		c.queue_free()
		
	# Filter
	var filtered = []
	for r in current_rikhisi_list:
		if _filter_match(r):
			filtered.append(r)
			
	# Sort
	filtered.sort_custom(_sort_logic)
	
	# Display
	for r in filtered:
		var card = RikishiCardScene.instantiate()
		list_container.add_child(card)
		card.update_info(r)

func _filter_match(r: Rikishi) -> bool:
	if current_tab == "All": return true
	
	if current_tab == "Makuuchi":
		return r.rank >= Banzuke.Rank.MAEGASHIRA
	elif current_tab == "Juryo":
		return r.rank == Banzuke.Rank.JURYO
	elif current_tab == "Makushita_Below":
		return r.rank <= Banzuke.Rank.MAKUSHITA
		
	return true

func _sort_logic(a: Rikishi, b: Rikishi) -> bool:
	if sort_mode == "Rank":
		if a.rank != b.rank:
			return a.rank > b.rank
		return a.rank_number < b.rank_number
		
	elif sort_mode == "Potential":
		return a.potential > b.potential
		
	elif sort_mode == "Age":
		return a.age > b.age
		
	return false

# UI Helpers
func _add_tab_button(text: String, tab_id: String):
	var btn = Button.new()
	btn.text = text
	ThemeUtils.apply_button_style(btn) # Modern Style
	btn.pressed.connect(func():
		current_tab = tab_id
		print("Tab switched to: ", tab_id)
		refresh_list()
	)
	tab_container.add_child(btn)

func _add_sort_button(text: String, mode_id: String):
	var btn = Button.new()
	btn.text = text
	ThemeUtils.apply_button_style(btn) # Modern Style
	btn.pressed.connect(func():
		sort_mode = mode_id
		refresh_list()
	)
	sort_container.add_child(btn)
