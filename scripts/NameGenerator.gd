class_name NameGenerator
extends RefCounted

static var parts: Dictionary = {}
static var _initialized: bool = false

# --- 襲名管理 ---
# 殿堂入りした「元の名前」が、現在何代目まで進んでいるかを記録
# {"若葉山": 1, "大天竜": 3} -> 若葉山は次2代目、大天竜は次4代目
static var shumei_history: Dictionary = {}

static func _ensure_loaded():
	if _initialized:
		return
	_initialized = true
	
	var path = "res://data/shikona_parts.json"
	if not FileAccess.file_exists(path):
		print("エラー: 四股名データが見つかりません -> " + path)
		return

	var file = FileAccess.open(path, FileAccess.READ)
	var content = file.get_as_text()
	
	var json = JSON.new()
	if json.parse(content) == OK:
		parts = json.data
		print("四股名データをロードしました: ", parts.keys())
	else:
		print("JSONの読み込みに失敗しました")

# 名前を生成する
# stable_kanji: 部屋の冠文字 (例: "琴")
# is_suffix: 冠文字が後ろにつくかどうか (trueなら "〇〇琴", falseなら "琴〇〇")
# existing_names: すでに活動中の力士名のリスト（重複回避用）
# is_elite: エリートかどうか（襲名チャンス判定用）
static func generate_name(stable_kanji: String, is_suffix: bool, existing_names: Array, is_elite: bool) -> String:
	_ensure_loaded()
	
	# 1. 襲名チャレンジ (エリートのみ)
	if is_elite and not Global.hall_of_fame.is_empty():
		# 30%の確率で襲名発生、ただし殿堂入り力士がいる場合に限る
		if randf() < 0.3:
			var candidate = Global.hall_of_fame.pick_random()
			var original_name = candidate["name"] # 例: "若葉山" (初代の名前)
			
			# まだ現役リストに同じ名前（またはその襲名者）がいないか簡易チェック
			# 厳密には "若葉山 II" がいるかチェックすべきだが、
			# ここでは「単純に重複しないか」を generate_shumei_name で確認する
			var shumei_name = _generate_shumei_string(original_name)
			
			# 重複していなければ採用
			if not existing_names.has(shumei_name):
				print("【襲名】 伝統の名跡「%s」を受け継ぎました！" % shumei_name)
				return shumei_name

	# 2. 通常生成 (冠文字を使用)
	for i in range(50): # 最大50回リトライ
		var candidate = ""
		var part = ""
		
		# 冠文字が「後ろ」につく場合 (例: 〇〇山) -> 前をランダムに選ぶ
		if is_suffix:
			if parts.has("prefixes"):
				part = parts["prefixes"].pick_random()
			candidate = part + stable_kanji
			
		# 冠文字が「前」につく場合 (例: 琴〇〇) -> 後ろをランダムに選ぶ
		else:
			if parts.has("suffixes"):
				part = parts["suffixes"].pick_random()
			candidate = stable_kanji + part
			
		# 重複チェック
		if not existing_names.has(candidate):
			return candidate
			
	return "名無し山" # フォールバック

# 襲名文字列を生成する (例: 若葉山 -> 若葉山 II)
static func _generate_shumei_string(base_name: String) -> String:
	# 既に " II" などがついている場合は除去してベース名を取得 (簡易実装)
	# 今回は hall_of_fame に入るのは常に「ベース名（その世代の）」とする
	# ただし、襲名者が殿堂入りすると "若葉山 II" が殿堂入りするので、
	# 次は "若葉山 III" にしたい。
	# ベース名と世代数を分離
	var name_part = base_name
	var current_generation = 1
	
	# スペースで分割して末尾がローマ数字かチェック (簡易)
	var split = base_name.split(" ")
	if split.size() > 1:
		var suffix = split[split.size() - 1]
		if suffix == "II": current_generation = 2
		elif suffix == "III": current_generation = 3
		elif suffix == "IV": current_generation = 4
		elif suffix == "V": current_generation = 5
		# 必要ならもっと増やす
		
		# 名前部分を再構築
		name_part = ""
		for k in range(split.size() - 1):
			name_part += split[k]
	
	# shumei_history を確認 (グローバルな世代管理ができればベストだが、今回はHall of Fameから推測するか、Historyを使う)
	# ここでは shumei_history を正とする
	if not shumei_history.has(name_part):
		shumei_history[name_part] = current_generation
	
	# 次の世代へ
	shumei_history[name_part] += 1
	var next_gen = shumei_history[name_part]
	
	var gen_suffix = ""
	match next_gen:
		2: gen_suffix = " II"
		3: gen_suffix = " III"
		4: gen_suffix = " IV"
		5: gen_suffix = " V"
		_: gen_suffix = " " + str(next_gen) # VI以降は数字で
		
	return name_part + gen_suffix
