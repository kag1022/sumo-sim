class_name Kimarite
extends RefCounted

# 読み込んだデータを保持する変数
static var data: Dictionary = {}
static var _initialized: bool = false

# JSONファイルを読み込む関数
static func _ensure_loaded():
	if _initialized:
		return
	_initialized = true
	
	var path = "res://data/kimarite.json"
	if not FileAccess.file_exists(path):
		print("エラー: データファイルが見つかりません -> " + path)
		return

	var file = FileAccess.open(path, FileAccess.READ)
	var content = file.get_as_text()
	
	# Godot 4でのJSONパース方法
	var json = JSON.new()
	var error = json.parse(content)
	if error == OK:
		data = json.data
		print("決まり手データをロードしました: ", data.keys())
	else:
		print("JSONの読み込みに失敗しました")

# ランダムに決まり手を一つ返す (カテゴリ指定なしの簡略版ラッパー)
static func get_random_kimarite() -> String:
	# とりあえずランダムなカテゴリを選ぶ
	var categories = ["push", "yori", "tech"]
	var type = categories.pick_random()
	return get_random_move(type)

# タイプを指定して、重み付きランダムで決まり手を返す関数
# type: "push" (押し), "yori" (寄り), "tech" (技)
static func get_random_move(type: String) -> String:
	_ensure_loaded()
	
	if not data.has(type):
		return "不明な決まり手"
	
	var list = data[type] # 対象のリストを取得
	
	# 重みの合計を計算
	var total_weight = 0
	for move in list:
		total_weight += move["weight"]
	
	# ランダムな値を生成
	var random_val = randi_range(0, total_weight)
	var current_weight = 0
	
	# 抽選処理
	for move in list:
		current_weight += move["weight"]
		if random_val <= current_weight:
			return move["name"]
	
	return list[0]["name"] # フォールバック
