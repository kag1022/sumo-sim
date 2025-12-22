# ファイル名: RikishiListItem.gd
extends HBoxContainer

# 外部から力士データを受け取って表示を更新する関数
func update_info(rikishi: Rikishi):
	# 名前と番付
	$NameLabel.text = "%s [%s]" % [rikishi.name, rikishi.get_rank_name()]
	
	# 筋力バーの更新
	$StrBar.value = rikishi.strength
	
	# 成績表示 (勝ち-負け)
	$ResultLabel.text = "%d勝 %d敗" % [rikishi.wins, rikishi.losses]

	# (おまけ) 勝ち越していれば文字を赤くする
	if rikishi.wins >= 8:
		$ResultLabel.modulate = Color(1, 0.5, 0.5) # 赤っぽい色
	else:
		$ResultLabel.modulate = Color(1, 1, 1) # 白Replace with function body.
