extends Control
class_name InstructionView

signal command_executed
signal retire_requested

var current_rikishi: Rikishi
var remaining_turns: int = 0

@onready var name_label = $HBoxContainer/RikishiPanel/StatusContainer/NameLabel
@onready var rank_label = $HBoxContainer/RikishiPanel/StatusContainer/RankLabel
@onready var age_label = $HBoxContainer/RikishiPanel/StatusContainer/AgeLabel
@onready var motivation_bar = $HBoxContainer/RikishiPanel/StatusContainer/MotivationBar
@onready var trust_bar = $HBoxContainer/RikishiPanel/StatusContainer/TrustBar
@onready var condition_label = $HBoxContainer/RikishiPanel/StatusContainer/ConditionLabel
@onready var log_label = $HBoxContainer/LogPanel/LogLabel

# Buttons
@onready var btn_body = $HBoxContainer/CommandPanel/GridContainer/BtnTrainBody
@onready var btn_tech = $HBoxContainer/CommandPanel/GridContainer/BtnTrainTech
@onready var btn_talk = $HBoxContainer/CommandPanel/GridContainer/BtnTalk
@onready var btn_rest = $HBoxContainer/CommandPanel/GridContainer/BtnRest
@onready var btn_retire = $HBoxContainer/CommandPanel/BtnRetire

func _ready():
	btn_body.pressed.connect(func(): _on_command(InstructionManager.CommandType.TRAIN_BODY))
	btn_tech.pressed.connect(func(): _on_command(InstructionManager.CommandType.TRAIN_TECH))
	btn_talk.pressed.connect(func(): _on_command(InstructionManager.CommandType.TALK))
	btn_rest.pressed.connect(func(): _on_command(InstructionManager.CommandType.REST))
	
	btn_retire.pressed.connect(_on_retire_pressed)

func set_data(rikishi_list: Array):
	# Find the focus rikishi, or default to the first one
	var target = null
	for r in rikishi_list:
		if r.is_focus:
			target = r
			break
	
	if target == null and not rikishi_list.is_empty():
		target = rikishi_list[0]
		
	setup(target)

func setup(rikishi: Rikishi):
	current_rikishi = rikishi
	update_ui()

func set_remaining_turns(val: int):
	remaining_turns = val
	update_ui()

func update_ui():
	# Update Buttons State
	var can_act = (remaining_turns > 0)
	btn_body.disabled = not can_act
	btn_tech.disabled = not can_act
	btn_talk.disabled = not can_act
	btn_rest.disabled = not can_act
	# Retire is always enabled or maybe only when can_act? 
	# User wanted "Retire whenever", so let's keep it enabled.
	btn_retire.disabled = (current_rikishi == null)

	if not current_rikishi: return
	
	name_label.text = current_rikishi.name
	# Use Rikishi's detailed get_rank_name() instead of static Banzuke helper
	rank_label.text = "番付: " + current_rikishi.get_rank_name()
	age_label.text = "%d歳 (ピーク: %d)" % [current_rikishi.age, current_rikishi.peak_age]
	
	# Traits Tooltip
	var traits_str = "特徴なし"
	if not current_rikishi.traits.is_empty():
		traits_str = "\n".join(current_rikishi.traits)
	name_label.tooltip_text = "【特徴】\n" + traits_str
	
	motivation_bar.value = current_rikishi.motivation
	trust_bar.value = current_rikishi.trust
	
	var cond_str = "Status: Unknown"
	match current_rikishi.condition:
		Rikishi.Condition.ZEKKOCHO: cond_str = "調子: 絶好調"
		Rikishi.Condition.GOOD: cond_str = "調子: 好調"
		Rikishi.Condition.NORMAL: cond_str = "調子: 普通"
		Rikishi.Condition.BAD: cond_str = "調子: 不調"
	condition_label.text = cond_str

func _on_command(type: InstructionManager.CommandType):
	if not current_rikishi: return
	if remaining_turns <= 0: return # Safety check
	
	var result = InstructionManager.execute_command(current_rikishi, type)
	
	log_label.text += "\n" + result["log"]
	update_ui()
	emit_signal("command_executed")

func _on_retire_pressed():
	# Confirmation could be added here, but sticking to logic first
	emit_signal("retire_requested")
