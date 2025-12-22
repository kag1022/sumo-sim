class_name SaveManager
extends RefCounted

const SAVE_PATH = "user://savegame.json"

static func save_game(rikishi_list: Array) -> void:
	var data = {
		"version": "1.0",
		"global": {
			"money": Global.money,
			"facilities": Global.facilities.duplicate(),
			"hall_of_fame": Global.hall_of_fame.duplicate()
		},
		"rikishi_list": []
	}
	
	for r in rikishi_list:
		data["rikishi_list"].append(r.to_dict())
		
	# JSON文字列化
	var json_str = JSON.stringify(data, "\t")
	var file = FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file:
		file.store_string(json_str)
		print("セーブ成功: ", SAVE_PATH)
	else:
		print("セーブ失敗: FileAccess Error")

static func load_game() -> Dictionary:
	if not FileAccess.file_exists(SAVE_PATH):
		print("セーブデータがありません")
		return {}
		
	var file = FileAccess.open(SAVE_PATH, FileAccess.READ)
	if not file:
		print("ロード失敗: FileAccess Error")
		return {}
		
	var content = file.get_as_text()
	var json = JSON.new()
	var error = json.parse(content)
	
	if error != OK:
		print("JSONパースエラー: ", json.get_error_message())
		return {}
		
	var data = json.data
	
	# Global復元
	if data.has("global"):
		var g = data["global"]
		if g.has("money"): Global.money = int(g["money"])
		if g.has("facilities"): Global.facilities = g["facilities"]
		if g.has("hall_of_fame"):
			Global.hall_of_fame.clear()
			for item in g["hall_of_fame"]:
				Global.hall_of_fame.append(item)
	
	print("ロード成功")
	return data
