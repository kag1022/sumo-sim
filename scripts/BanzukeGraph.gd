extends Node2D

var history: Array = []

func _draw():
	if history.is_empty(): return
	
	var w = 300.0
	var h = 300.0
	var padding = 20.0
	
	# Draw Axes
	draw_line(Vector2(padding, padding), Vector2(padding, h - padding), Color.GRAY, 2.0) # Y
	draw_line(Vector2(padding, h - padding), Vector2(w - padding, h - padding), Color.GRAY, 2.0) # X
	
	if history.size() < 2: return
	
	# Map Data to Points
	var points = []
	var _max_val = 0
	var _min_val = 1000 # Invert: Top rank is low index
	
	var data_vals = []
	for entry in history:
		# Convert Rank to a comparable value
		# Yokozuna (9) -> High Score?
		# Let's use simple Rank enum + Normalized
		# Y=9, O=8, S=7, K=6, M=5, J=4, Ms=3, Sd=2, Jd=1, Jk=0
		var r = entry.get("rank", 0)
		data_vals.append(float(r))
		
	# Plot
	# X step
	var x_step = (w - 2 * padding) / (data_vals.size() - 1)
	
	for i in range(data_vals.size()):
		var val = data_vals[i]
		# Normalize Y (0 to 9)
		# 9 is Top (should be low Y coordinate)
		# 0 is Bottom (should be high Y coordinate)
		var y_ratio = 1.0 - (val / 9.0) # 9->0.0 (Top), 0->1.0 (Bottom)
		var y = padding + y_ratio * (h - 2 * padding)
		var x = padding + i * x_step
		points.append(Vector2(x, y))
		
	draw_polyline(points, Global.UI_COLORS.primary, 3.0, true)
	
	# Draw dots
	for p in points:
		draw_circle(p, 4.0, Color.WHITE)
