class_name Stable
extends Resource

enum Trait {
	BALANCED,
	POWER_HOUSE, # Focus on Strength/Weight
	TECHNICAL, # Focus on Technique
	SPEED_STAR, # Focus on Speed
	SPARTAN # High Mental, High Injury Risk (Not impl yet)
}

@export var id: String
@export var name: String
@export var stable_trait: Trait = Trait.BALANCED
@export var reputation: int = 0
@export var founded_year: int = 0

func _init(p_id: String = "", p_name: String = "Unknown", p_trait: Trait = Trait.BALANCED):
	id = p_id
	name = p_name
	stable_trait = p_trait

# Helper to get trait modifier for generation
func get_generation_bonuses() -> Dictionary:
	var bonus = {
		"strength": 0.0,
		"weight": 0.0,
		"speed": 0.0,
		"technique": 0.0,
		"mental": 0.0
	}
	
	match stable_trait:
		Trait.POWER_HOUSE:
			bonus["strength"] = 10.0
			bonus["weight"] = 5.0
		Trait.TECHNICAL:
			bonus["technique"] = 10.0
		Trait.SPEED_STAR:
			bonus["speed"] = 10.0
			bonus["weight"] = -5.0 # Lighter
		Trait.SPARTAN:
			bonus["mental"] = 15.0
			
	return bonus
