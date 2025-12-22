class_name ThemeUtils
extends RefCounted

static func apply_button_style(btn: Button):
	# Glass Button
	var normal = StyleBoxFlat.new()
	normal.bg_color = Global.UI_COLORS.bg_glass
	normal.border_color = Global.UI_COLORS.border_glass
	normal.border_width_left = 1; normal.border_width_top = 1
	normal.border_width_right = 1; normal.border_width_bottom = 1
	normal.corner_radius_top_left = 8; normal.corner_radius_top_right = 8
	normal.corner_radius_bottom_left = 8; normal.corner_radius_bottom_right = 8
	normal.content_margin_left = 16; normal.content_margin_right = 16
	normal.content_margin_top = 10; normal.content_margin_bottom = 10
	normal.shadow_size = 0 # No shadow for flat glass, maybe inner glow?
	
	btn.add_theme_stylebox_override("normal", normal)
	
	# Hover (Glow)
	var hover = normal.duplicate()
	hover.bg_color = Global.UI_COLORS.bg_glass.lightened(0.1)
	hover.border_color = Global.UI_COLORS.primary.lightened(0.5) # Glow border
	hover.border_width_left = 2; hover.border_width_right = 2
	hover.border_width_top = 2; hover.border_width_bottom = 2
	btn.add_theme_stylebox_override("hover", hover)
	
	# Pressed
	var pressed = normal.duplicate()
	pressed.bg_color = Global.UI_COLORS.primary.darkened(0.2)
	pressed.border_color = Global.UI_COLORS.primary
	btn.add_theme_stylebox_override("pressed", pressed)
	
	# Font
	btn.add_theme_color_override("font_color", Global.UI_COLORS.text_main)
	btn.add_theme_color_override("font_hover_color", Global.UI_COLORS.primary)

static func apply_panel_bg(panel: PanelContainer):
	var sb = StyleBoxFlat.new()
	sb.bg_color = Global.UI_COLORS.bg_glass
	sb.border_color = Global.UI_COLORS.border_glass
	sb.border_width_left = 1; sb.border_width_top = 1
	sb.border_width_right = 1; sb.border_width_bottom = 1
	sb.corner_radius_top_left = 12; sb.corner_radius_top_right = 12
	sb.corner_radius_bottom_left = 12; sb.corner_radius_bottom_right = 12
	# Glass often has blur, but Godot 4 `StyleBoxFlat` doesn't support blur easily without shader.
	# We rely on transparency + border.
	
	panel.add_theme_stylebox_override("panel", sb)

static func apply_accent_button_style(btn: Button):
	apply_button_style(btn)
	# Override colors for accent (Magma Red)
	var style: StyleBoxFlat = btn.get_theme_stylebox("normal")
	style.bg_color = Global.UI_COLORS.accent.darkened(0.2)
	style.border_color = Global.UI_COLORS.accent
	
	var hover: StyleBoxFlat = btn.get_theme_stylebox("hover")
	hover.bg_color = Global.UI_COLORS.accent
	hover.border_color = Color.WHITE
	
	var pressed: StyleBoxFlat = btn.get_theme_stylebox("pressed")
	pressed.bg_color = Global.UI_COLORS.accent.darkened(0.4)
	
	btn.add_theme_color_override("font_color", Color.WHITE)
	btn.add_theme_color_override("font_hover_color", Color.WHITE)
