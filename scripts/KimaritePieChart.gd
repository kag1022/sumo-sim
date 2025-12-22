extends Node2D

var data: Dictionary = {} # {"Oshidashi": 5, "Yorikiri": 3}
var colors = [
	Color("#ff7675"), Color("#74b9ff"), Color("#55efc4"),
	Color("#a29bfe"), Color("#ffeaa7"), Color("#fab1a0")
]

func _draw():
	if data.is_empty(): return
	
	var total = 0
	for v in data.values(): total += v
	if total == 0: return
	
	var center = Vector2(150, 150)
	var radius = 120.0
	var current_angle = - PI / 2.0 # Start from top
	
	var idx = 0
	
	for k in data.keys():
		var count = data[k]
		var ratio = float(count) / float(total)
		var angle_extent = ratio * PI * 2.0
		
		var col = colors[idx % colors.size()]
		
		# Draw Arc/Slice
		draw_create_pie_slice(center, radius, current_angle, current_angle + angle_extent, col)
		
		# Draw Legend/Text?
		# Calculate mid-angle for text
		var mid_angle = current_angle + (angle_extent / 2.0)
		var text_pos = center + Vector2(cos(mid_angle), sin(mid_angle)) * (radius * 0.7)
		draw_string(ThemeDB.fallback_font, text_pos, k.left(2), HORIZONTAL_ALIGNMENT_CENTER, -1, 12, Color.BLACK)
		
		current_angle += angle_extent
		idx += 1

func draw_create_pie_slice(center, radius, start_angle, end_angle, color):
	var points_per_arc = 32
	var points = PackedVector2Array([center])
	
	for i in range(points_per_arc + 1):
		var angle = lerp(start_angle, end_angle, float(i) / points_per_arc)
		points.append(center + Vector2(cos(angle), sin(angle)) * radius)
		
	draw_colored_polygon(points, color)
