extends Control
class_name SetupView

signal game_started(name: String, age: int)

@onready var name_edit = $Panel/CenterContainer/VBoxContainer/GridContainer/NameEdit
@onready var age_spin = $Panel/CenterContainer/VBoxContainer/GridContainer/AgeSpin
@onready var start_btn = $Panel/CenterContainer/VBoxContainer/StartButton

func _ready():
	start_btn.pressed.connect(_on_start_pressed)

func _on_start_pressed():
	var n = name_edit.text.strip_edges()
	if n == "":
		n = "若葉山" # Default
	
	var a = int(age_spin.value)
	
	emit_signal("game_started", n, a)
