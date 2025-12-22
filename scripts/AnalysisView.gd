class_name AnalysisView
extends Control

# Data
var current_rikishi: Rikishi

# UI Containers
var main_container: HBoxContainer
var pie_chart_container: Control
var heatmap_container: GridContainer
var graph_container: Control

func _ready():
	_setup_ui()

func _setup_ui():
	# Background
	var bg = ColorRect.new()
	bg.color = Global.UI_COLORS.bg_main
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)
	
	main_container = HBoxContainer.new()
	main_container.set_anchors_preset(Control.PRESET_FULL_RECT)
	main_container.add_theme_constant_override("separation", 30)
	var m = MarginContainer.new()
	m.add_theme_constant_override("margin_left", 30)
	m.add_theme_constant_override("margin_top", 30)
	m.add_theme_constant_override("margin_right", 30)
	m.add_theme_constant_override("margin_bottom", 30)
	m.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(m)
	m.add_child(main_container)
	
	# Left Column: Pie Chart (Kimarite)
	var left_vbox = VBoxContainer.new()
	left_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	main_container.add_child(left_vbox)
	
	var lbl1 = Label.new()
	lbl1.text = "決まり手傾向 (Kimarite Ratio)"
	lbl1.add_theme_font_size_override("font_size", 24)
	left_vbox.add_child(lbl1)
	
	pie_chart_container = Control.new()
	pie_chart_container.custom_minimum_size = Vector2(300, 300)
	pie_chart_container.size_flags_vertical = Control.SIZE_EXPAND_FILL
	left_vbox.add_child(pie_chart_container)
	# Custom Draw script attached to this container? Or just draw here.
	# We'll attach a script dynamically or use a child node.
	var pie_node = Node2D.new()
	pie_node.set_script(preload("res://scripts/KimaritePieChart.gd"))
	pie_node.name = "PieChart"
	pie_chart_container.add_child(pie_node)
	
	# Right Column: Heatmap & Graph
	var right_vbox = VBoxContainer.new()
	right_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	main_container.add_child(right_vbox)
	
	var lbl2 = Label.new()
	lbl2.text = "星取ヒートマップ (Win/Loss Heatmap)"
	lbl2.add_theme_font_size_override("font_size", 24)
	right_vbox.add_child(lbl2)
	
	heatmap_container = GridContainer.new()
	heatmap_container.columns = 15 # 15 days
	heatmap_container.add_theme_constant_override("h_separation", 4)
	heatmap_container.add_theme_constant_override("v_separation", 4)
	right_vbox.add_child(heatmap_container)
	
	right_vbox.add_child(HSeparator.new())
	
	var lbl3 = Label.new()
	lbl3.text = "番付推移 (Rank History)"
	lbl3.add_theme_font_size_override("font_size", 24)
	right_vbox.add_child(lbl3)
	
	graph_container = Control.new()
	graph_container.custom_minimum_size = Vector2(300, 300)
	right_vbox.add_child(graph_container)
	
	var graph_node = Node2D.new()
	graph_node.set_script(preload("res://scripts/BanzukeGraph.gd"))
	graph_node.name = "BanzukeGraph"
	graph_container.add_child(graph_node)
	
	# Back Button
	var back_btn = Button.new()
	back_btn.text = "戻る"
	back_btn.set_anchors_preset(Control.PRESET_TOP_RIGHT) # Doesn't work well in HBox.
	# Add to a layer above
	var canvas = CanvasLayer.new()
	add_child(canvas)
	var m2 = MarginContainer.new()
	m2.add_theme_constant_override("margin_top", 20)
	m2.add_theme_constant_override("margin_right", 20)
	m2.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	canvas.add_child(m2)
	m2.add_child(back_btn)
	back_btn.pressed.connect(func(): queue_free())

func set_data(r: Rikishi):
	current_rikishi = r
	if is_node_ready():
		_update_charts()

func _update_charts():
	if not current_rikishi or not is_node_ready(): return
	
	# Update Pie Chart
	var pie = pie_chart_container.get_node("PieChart")
	if pie:
		pie.data = _aggregate_kimarite(current_rikishi.winning_kimarite_history)
		pie.queue_redraw()
		
	# Update Heatmap
	for c in heatmap_container.get_children(): c.queue_free()
	
	for res in current_rikishi.results_history:
		var cell = ColorRect.new()
		cell.custom_minimum_size = Vector2(20, 20)
		if res:
			cell.color = Global.UI_COLORS.primary # Cyan for Win
		else:
			cell.color = Color(0.2, 0.2, 0.2) # Dark for Loss
		heatmap_container.add_child(cell)
		
	# Update Graph
	var graph = graph_container.get_node("BanzukeGraph")
	if graph:
		graph.history = current_rikishi.history
		graph.queue_redraw()

func _aggregate_kimarite(history: Array[String]) -> Dictionary:
	var counts = {}
	for k in history:
		counts[k] = counts.get(k, 0) + 1
	return counts
