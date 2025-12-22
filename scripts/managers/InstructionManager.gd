class_name InstructionManager


enum CommandType {
	TRAIN_BODY, # 筋力・体重
	TRAIN_TECH, # 技術・スピード
	IMAGE_TRAINING, # 精神・技術
	REST, # 疲労回復
	TALK, # 信頼・やる気
	SCOLD, # やる気(条件付き)・信頼ダウン
	PRAISE # やる気・信頼
}

enum ResultType {
	GREAT_SUCCESS,
	SUCCESS,
	FAILURE,
	INJURY
}

static func execute_command(rikishi: Rikishi, command: CommandType) -> Dictionary:
	var result = {
		"type": ResultType.SUCCESS,
		"log": "",
		"stat_changes": {}
	}
	
	# Basic Success Rate Logic
	# Todo: Use Condition & Motivation
	var success_chance = 90.0
	if rikishi.condition == Rikishi.Condition.BAD: success_chance -= 20.0
	if rikishi.motivation < 30.0: success_chance -= 10.0
	
	if randf() * 100.0 > success_chance:
		result["type"] = ResultType.FAILURE
		result["log"] = "%s は集中力を欠き、稽古に身が入らなかった..." % rikishi.name
		# 失敗でも少し疲れる
		rikishi.fatigue += 5.0
		return result

	# Great Success (Critical)
	var crit_chance = 5.0
	if rikishi.condition == Rikishi.Condition.ZEKKOCHO: crit_chance += 15.0
	if rikishi.motivation > 80.0: crit_chance += 10.0
	
	var multiplier = 1.0
	if randf() * 100.0 < crit_chance:
		result["type"] = ResultType.GREAT_SUCCESS
		multiplier = 1.5
		result["log"] = "素晴らしい動きだ！ %s は何かを掴んだようだ！" % rikishi.name
	
	# Execute Command Logic
	match command:
		CommandType.TRAIN_BODY:
			var str_gain = 0.5 * multiplier * rikishi.potential
			var wgt_gain = 0.2 * multiplier
			rikishi.strength += str_gain
			rikishi.weight += wgt_gain
			rikishi.fatigue += 15.0
			result["stat_changes"] = {"strength": str_gain, "weight": wgt_gain}
			if result["type"] == ResultType.SUCCESS:
				result["log"] = "%s は四股を踏み、鉄砲柱に向かった。" % rikishi.name
				
		CommandType.TRAIN_TECH:
			var tech_gain = 0.4 * multiplier * rikishi.potential
			var spd_gain = 0.4 * multiplier * rikishi.potential
			rikishi.technique += tech_gain
			rikishi.speed += spd_gain
			rikishi.fatigue += 12.0
			result["stat_changes"] = {"technique": tech_gain, "speed": spd_gain}
			if result["type"] == ResultType.SUCCESS:
				result["log"] = "%s は若衆相手に申し合い稽古を行った。" % rikishi.name

		CommandType.TALK:
			var trust_gain = 5.0
			var mot_gain = 10.0
			rikishi.trust = min(100.0, rikishi.trust + trust_gain)
			rikishi.motivation = min(100.0, rikishi.motivation + mot_gain)
			result["stat_changes"] = {"trust": trust_gain, "motivation": mot_gain}
			result["log"] = "親方は %s と腹を割って話した。" % rikishi.name
			
		CommandType.REST:
			var rec_amount = 40.0
			rikishi.fatigue = max(0.0, rikishi.fatigue - rec_amount)
			rikishi.condition = Rikishi.Condition.GOOD # Rest improves condition chance
			result["stat_changes"] = {"fatigue": - rec_amount}
			result["log"] = "%s はゆっくりと体を休めた。" % rikishi.name

	# Clip values
	rikishi.fatigue = min(100.0, rikishi.fatigue)
	
	return result
