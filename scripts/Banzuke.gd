class_name Banzuke
extends RefCounted

# 番付の階級定義
enum Rank {
	JONOKUCHI = 0,
	JONIDAN = 1,
	SANDANME = 2,
	MAKUSHITA = 3,
	JURYO = 4,
	MAEGASHIRA = 5,
	KOMUSUBI = 6,
	SEKIWAKE = 7,
	OZEKI = 8,
	YOKOZUNA = 9
}

# --- 定員 (Quota) ---
const CAPACITY_MAKUUCHI = 42
const CAPACITY_JURYO = 28
const CAPACITY_MAKUSHITA = 120
const CAPACITY_SANDANME = 180
const CAPACITY_JONIDAN = 210
const CAPACITY_JONOKUCHI = 40

# --- 累積オフセット (Get Absolute Index用) ---
# 上の階級から順に埋まっていく
# 横綱・大関・関脇・小結も幕内定員(42)に含まれる
const OFFSET_JURYO = CAPACITY_MAKUUCHI
const OFFSET_MAKUSHITA = OFFSET_JURYO + CAPACITY_JURYO
const OFFSET_SANDANME = OFFSET_MAKUSHITA + CAPACITY_MAKUSHITA
const OFFSET_JONIDAN = OFFSET_SANDANME + CAPACITY_SANDANME
const OFFSET_JONOKUCHI = OFFSET_JONIDAN + CAPACITY_JONIDAN
const OFFSET_OUT_OF_RANK = OFFSET_JONOKUCHI + CAPACITY_JONOKUCHI

# --- ランクヘルパー ---
static func get_rank_name(r: int) -> String:
	match r:
		Rank.JONOKUCHI: return "序ノ口"
		Rank.JONIDAN: return "序二段"
		Rank.SANDANME: return "三段目"
		Rank.MAKUSHITA: return "幕下"
		Rank.JURYO: return "十両"
		Rank.MAEGASHIRA: return "前頭"
		Rank.KOMUSUBI: return "小結"
		Rank.SEKIWAKE: return "関脇"
		Rank.OZEKI: return "大関"
		Rank.YOKOZUNA: return "横綱"
		_: return "番付外"

static func get_match_count(r: int) -> int:
	if r >= Rank.JURYO: return 15
	else: return 7

# --- 絶対インデックス計算 (0始まりの通し番号) ---
# 東西制: 各ランク枚数につき2枠 (東, 西)
static func get_absolute_index(r: int, num: int, is_east: bool) -> int:
	var local_idx = (num - 1) * 2 + (0 if is_east else 1)
	
	var base_offset = 0
	match r:
		Rank.YOKOZUNA: base_offset = 0
		Rank.OZEKI: base_offset = 4 # Y (0,1,2,3... assume max 4?) No, Y is flexible but let's assume offsets.
		# 簡易化: 幕内はひとまとめに計算せず、役職ごとに固定枠を持つと仮定するが、
		# 実際は横綱大関の人数で前頭の開始位置が変わる。
		# ここではシミュレーションの簡略化のため、
		# 横綱2枠、大関2枠、関脇2枠、小結2枠、前頭... と仮定して計算する。
		# (定員42名内で変動するが、Index計算はソートのための目安なので相対関係が合えばよい)
		
		# 横綱: 0, 1 (1枚目東西)
		# 大関: 2, 3 (1枚目東西)
		# 関脇: 4, 5
		# 小結: 6, 7
		# 前頭1: 8, 9 ...
		
		Rank.SEKIWAKE: base_offset = 4
		Rank.KOMUSUBI: base_offset = 6
		Rank.MAEGASHIRA: base_offset = 8
		
		Rank.JURYO: base_offset = OFFSET_JURYO
		Rank.MAKUSHITA: base_offset = OFFSET_MAKUSHITA
		Rank.SANDANME: base_offset = OFFSET_SANDANME
		Rank.JONIDAN: base_offset = OFFSET_JONIDAN
		Rank.JONOKUCHI: base_offset = OFFSET_JONOKUCHI
		_: base_offset = OFFSET_OUT_OF_RANK
		
	# 横綱・大関などは人数不定だが、目安として固定オフセットで計算
	# Rankによる大まかなソート + Indexによる微調整
	return base_offset + local_idx

# --- 昇進判定ロジック ---
static func check_yokozuna_promotion(history: Array) -> bool:
	if history.size() < 2: return false
	var current = history[-1]
	var prev = history[-2]
	if current["rank"] != Rank.OZEKI: return false
	
	var yusho_count = 0
	var over13_count = 0
	
	for h in [current, prev]:
		if h.get("yusho", false):
			yusho_count += 1
		if h["wins"] >= 13:
			over13_count += 1
	
	if yusho_count == 2: return true
	if over13_count == 2: return true
	if yusho_count == 1 and over13_count >= 1: return true
	return false

static func check_ozeki_promotion(history: Array) -> bool:
	if history.size() < 3: return false
	var wins = 0
	for i in range(3):
		var h = history[history.size() - 1 - i]
		if h["rank"] < Rank.KOMUSUBI: return false
		if h["losses"] > h["wins"]: return false
		wins += h["wins"]
	return wins >= 33

# --- メイン処理: 番付編成 ---
static func resolve_tournament(rikishi_list: Array) -> void:
	# 1. 全エントリ作成
	var all_entries = []
	for r in rikishi_list:
		all_entries.append({
			"obj": r, "is_player": true, "name": r.name,
			"rank": r.rank, "rank_number": r.rank_number, "is_east": r.is_east,
			"wins": r.wins, "losses": r.losses, "history": r.history,
			"current_idx": get_absolute_index(r.rank, r.rank_number, r.is_east),
			"target_idx": 0.0,
			"yusho": false
		})
	
	# ゴースト
	var ghosts = _generate_ghosts()
	all_entries.append_array(ghosts)
	
	# 優勝判定
	var max_wins = -1
	for e in all_entries:
		if e["rank"] < Rank.JURYO and e["wins"] > max_wins:
			max_wins = e["wins"]
			
	for e in all_entries:
		if e["rank"] < Rank.JURYO and e["wins"] == max_wins:
			e["yusho"] = true
			if e["is_player"]:
				print("優勝！！: ", e["name"], " (", e["wins"], "勝)")

	# 2. Target Index 計算
	for e in all_entries:
		var r = e["rank"]
		var w = e["wins"]
		var l = e["losses"]
		var diff = w - l
		
		# 係数: 1勝差で何スロット動くか (東西制なのでスロット数は旧来の2倍必要)
		# 例: 勝ち越し1つで「半枚」上がる = 1スロット上昇 (東->西 or 西->上位東)
		# 以前は1勝=1.5スロット(係数)だったが、今回はスロット密度が倍になったので係数も倍にする感覚
		var coeff = 1.0
		
		match r:
			# 幕内・十両 (15番)
			Rank.YOKOZUNA, Rank.OZEKI, Rank.SEKIWAKE, Rank.KOMUSUBI, Rank.MAEGASHIRA, Rank.JURYO:
				# 1勝勝ち越し = 0.5枚上昇 = 1スロット
				# 実際は番付運によるが、基本1勝=1スロットとする
				coeff = 1.0
			Rank.MAKUSHITA: coeff = 5.0 # 7番しかないので係数大
			Rank.SANDANME: coeff = 15.0
			Rank.JONIDAN: coeff = 30.0
			Rank.JONOKUCHI: coeff = 50.0
		
		var move = diff * coeff * -1.0
		
		# カチコシボーナス
		if diff > 0: move -= 1.5
			
		e["target_idx"] = float(e["current_idx"]) + move
		
		# 保護ルール
		if r == Rank.YOKOZUNA: e["target_idx"] = -1000.0
		if r == Rank.OZEKI and diff < 0:
			# カド番チェック省略(簡易)
			pass

	# 3. 昇進強制
	for e in all_entries:
		if e["is_player"]:
			# 履歴作成
			var temp_hist = e["history"].duplicate()
			temp_hist.append({"rank": e["rank"], "wins": e["wins"], "losses": e["losses"], "yusho": e["yusho"]})
			
			if check_yokozuna_promotion(temp_hist):
				e["target_idx"] = -3000.0
				e["force_yokozuna"] = true
			elif check_ozeki_promotion(temp_hist):
				e["target_idx"] = 3.9
				e["force_ozeki"] = true

	# 4. ソート (値が小さいほど上位)
	all_entries.sort_custom(func(a, b): return a["target_idx"] < b["target_idx"])
	
	# 5. 席埋め (東西交互)
	# 東西交互に埋めるためのヘルパー
	# カウンタは「現在の枚数」ではなく「現在の通しスロット数」で管理し、それを (cnt/2)+1, cnt%2==0?東:西 に変換する
	
	var y_slots = 0
	var o_slots = 0
	var s_slots = 0
	var k_slots = 0
	var m_slots = 0
	var j_slots = 0
	var ms_slots = 0
	var sd_slots = 0
	var jd_slots = 0
	var jk_slots = 0
	
	for i in range(all_entries.size()):
		var e = all_entries[i]
		var new_rank
		var new_num
		var new_is_east
		
		# 枠決定
		if i < CAPACITY_MAKUUCHI:
			# 幕内
			var assigned_rank = Rank.MAEGASHIRA
			if e.get("force_yokozuna", false) or (e["rank"] == Rank.YOKOZUNA and e["wins"] >= 0): # 引退してなければ
				assigned_rank = Rank.YOKOZUNA
			elif e.get("force_ozeki", false) or (e["rank"] == Rank.OZEKI): # 陥落判定は複雑なので省略
				assigned_rank = Rank.OZEKI
			else:
				if s_slots < 2: assigned_rank = Rank.SEKIWAKE
				elif k_slots < 2: assigned_rank = Rank.KOMUSUBI
				else: assigned_rank = Rank.MAEGASHIRA
			
			if assigned_rank == Rank.YOKOZUNA:
				new_num = floor(y_slots / 2.0) + 1; new_is_east = (y_slots % 2 == 0); y_slots += 1
			elif assigned_rank == Rank.OZEKI:
				new_num = floor(o_slots / 2.0) + 1; new_is_east = (o_slots % 2 == 0); o_slots += 1
			elif assigned_rank == Rank.SEKIWAKE:
				new_num = floor(s_slots / 2.0) + 1; new_is_east = (s_slots % 2 == 0); s_slots += 1
			elif assigned_rank == Rank.KOMUSUBI:
				new_num = floor(k_slots / 2.0) + 1; new_is_east = (k_slots % 2 == 0); k_slots += 1
			else:
				new_num = floor(m_slots / 2.0) + 1; new_is_east = (m_slots % 2 == 0); m_slots += 1
			new_rank = assigned_rank
			
		elif i < OFFSET_MAKUSHITA:
			new_rank = Rank.JURYO
			new_num = floor(j_slots / 2.0) + 1; new_is_east = (j_slots % 2 == 0); j_slots += 1
		elif i < OFFSET_SANDANME:
			new_rank = Rank.MAKUSHITA
			new_num = floor(ms_slots / 2.0) + 1; new_is_east = (ms_slots % 2 == 0); ms_slots += 1
		elif i < OFFSET_JONIDAN:
			new_rank = Rank.SANDANME
			new_num = floor(sd_slots / 2.0) + 1; new_is_east = (sd_slots % 2 == 0); sd_slots += 1
		elif i < OFFSET_JONOKUCHI:
			new_rank = Rank.JONIDAN
			new_num = floor(jd_slots / 2.0) + 1; new_is_east = (jd_slots % 2 == 0); jd_slots += 1
		else:
			new_rank = Rank.JONOKUCHI
			new_num = floor(jk_slots / 2.0) + 1; new_is_east = (jk_slots % 2 == 0); jk_slots += 1
			
		e["new_rank"] = new_rank
		e["new_num"] = new_num
		e["new_east"] = new_is_east

	# 6. リスト更新
	for e in all_entries:
		if e["is_player"]:
			var p = e["obj"]
			p.rank = e["new_rank"]
			p.rank_number = e["new_num"]
			p.is_east = e["new_east"]
			
			if p.rank > p.highest_rank:
				p.highest_rank = p.rank
			
			p.history.append({
				"rank": e["rank"],
				"wins": e["wins"],
				"losses": e["losses"],
				"yusho": e["yusho"]
			})

static func _generate_ghosts() -> Array:
	var ghosts = []
	# 前回の半分のループ回数でOKだが、今回は東西分くるので定員分ループ
	for i in range(CAPACITY_MAKUUCHI):
		# i=0(東1), i=1(西1), i=2(東2)...
		ghosts.append(_create_ghost("M_Ghost", Rank.MAEGASHIRA, floor(i / 2.0) + 1, i % 2 == 0))
	for i in range(CAPACITY_JURYO):
		ghosts.append(_create_ghost("J_Ghost", Rank.JURYO, floor(i / 2.0) + 1, i % 2 == 0))
	for i in range(CAPACITY_MAKUSHITA):
		ghosts.append(_create_ghost("Ms_Ghost", Rank.MAKUSHITA, floor(i / 2.0) + 1, i % 2 == 0))
	for i in range(CAPACITY_SANDANME):
		ghosts.append(_create_ghost("Sd_Ghost", Rank.SANDANME, floor(i / 2.0) + 1, i % 2 == 0))
	for i in range(CAPACITY_JONIDAN):
		ghosts.append(_create_ghost("Jd_Ghost", Rank.JONIDAN, floor(i / 2.0) + 1, i % 2 == 0))
	for i in range(CAPACITY_JONOKUCHI):
		ghosts.append(_create_ghost("Jk_Ghost", Rank.JONOKUCHI, floor(i / 2.0) + 1, i % 2 == 0))
	return ghosts

static func _create_ghost(prefix: String, r: int, num: int, is_east: bool) -> Dictionary:
	var matches = get_match_count(r)
	var win_exp = float(matches) / 2.0
	var w = clampi(int(round(randfn(win_exp, 2.0))), 0, matches)
	
	return {
		"name": prefix + str(num) + ("E" if is_east else "W"),
		"rank": r,
		"rank_number": num,
		"is_east": is_east,
		"wins": w,
		"losses": matches - w,
		"history": [],
		"current_idx": get_absolute_index(r, num, is_east),
		"is_player": false,
		"obj": null
	}
