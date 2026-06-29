#!/bin/bash
OUT="/home/admin/www/Floatingsk Website/stats.html"
LOG="/var/log/nginx/access.log"
NOW=$(TZ='Asia/Shanghai' date '+%Y-%m-%d %H:%M')
CUR_MONTH=$(TZ='Asia/Shanghai' date '+%Y-%m')

# ---- 过滤规则（行为识别，不再依赖IP黑名单）----
FILTER_PATTERN='(Chrome|Safari|Firefox|Edge)'
EXCLUDE_UA='(bot|crawler|spider|scanner|python|curl|wget|zgrab|Censys|Expanse|nmap|masscan|Go-http|Hello from)'
# 扫描特征：命中的路径全是假路径 → 扫漏洞的
SUS_PATHS='(\.env|\.git|wp-admin|actuator|admin|\.php|\.asp|config|backup|sql|\.yml|\.ini)'

# ---- 每日访客：按独立IP统计，只计浏览首页的真人 ----
# 行为特征：请求了 / 且返回200/304、浏览器UA、没扫可疑路径
sudo sh -c "
> /tmp/stats_daily.tmp
for f in /var/log/nginx/access.log*; do
  zcat -f \"\$f\" 2>/dev/null
done | awk -v ua=\"$FILTER_PATTERN\" -v exua=\"$EXCLUDE_UA\" -v susp=\"$SUS_PATHS\" '
BEGIN {
  mon[\"Jan\"]=\"01\"; mon[\"Feb\"]=\"02\"; mon[\"Mar\"]=\"03\"; mon[\"Apr\"]=\"04\"
  mon[\"May\"]=\"05\"; mon[\"Jun\"]=\"06\"; mon[\"Jul\"]=\"07\"; mon[\"Aug\"]=\"08\"
  mon[\"Sep\"]=\"09\"; mon[\"Oct\"]=\"10\"; mon[\"Nov\"]=\"11\"; mon[\"Dec\"]=\"12\"
}
# 只看首页请求
\$7 == \"/\" && \$0 ~ ua && \$0 !~ exua && \$7 !~ susp {
  # 只看成功响应
  if (\$9 == \"200\" || \$9 == \"304\") {
    match(\$0, /\[([0-9]{2})\/([A-Z][a-z]{2})\/([0-9]{4})/, a)
    if (a[1] != \"\") {
      day = a[3] mon[a[2]] a[1]
      seen[day][\$1] = 1      # 按日按IP去重
    }
  }
}
END {
  for (d in seen)
    for (ip in seen[d])
      cnt[d]++
  for (d in cnt) print d, cnt[d]
}
' | sort > /tmp/stats_daily.tmp
"

sudo chmod 644 /tmp/stats_daily.tmp

# ---- App Store 点击统计（按日总计 + 按日按app） ----
sudo sh -c "
> /tmp/stats_app.tmp
> /tmp/stats_app_detail.tmp
for f in /var/log/nginx/access.log*; do
  zcat -f \"\$f\" 2>/dev/null
done | awk '
BEGIN {
  mon[\"Jan\"]=\"01\"; mon[\"Feb\"]=\"02\"; mon[\"Mar\"]=\"03\"; mon[\"Apr\"]=\"04\"
  mon[\"May\"]=\"05\"; mon[\"Jun\"]=\"06\"; mon[\"Jul\"]=\"07\"; mon[\"Aug\"]=\"08\"
  mon[\"Sep\"]=\"09\"; mon[\"Oct\"]=\"10\"; mon[\"Nov\"]=\"11\"; mon[\"Dec\"]=\"12\"
}
index(\$7, \"/a/\") == 1 && \$7 != \"/a/test\" {
  match(\$0, /\[([0-9]{2})\/([A-Z][a-z]{2})\/([0-9]{4})/, a)
  if (a[1] != \"\") {
    day = a[3] mon[a[2]] a[1]
    cnt[day]++
    # 提取 app 名: /go/ai-recorder -> ai-recorder
    split(\$7, p, \"/\")
    app[day][p[3]]++
  }
}
END {
  for (d in cnt) print d, cnt[d]
}
' | sort > /tmp/stats_app.tmp

# 按 app 明细
awk '
BEGIN {
  mon[\"Jan\"]=\"01\"; mon[\"Feb\"]=\"02\"; mon[\"Mar\"]=\"03\"; mon[\"Apr\"]=\"04\"
  mon[\"May\"]=\"05\"; mon[\"Jun\"]=\"06\"; mon[\"Jul\"]=\"07\"; mon[\"Aug\"]=\"08\"
  mon[\"Sep\"]=\"09\"; mon[\"Oct\"]=\"10\"; mon[\"Nov\"]=\"11\"; mon[\"Dec\"]=\"12\"
}
index(\$7, \"/a/\") == 1 && \$7 != \"/a/test\" {
  match(\$0, /\[([0-9]{2})\/([A-Z][a-z]{2})\/([0-9]{4})/, a)
  if (a[1] != \"\") {
    day = a[3] mon[a[2]] a[1]
    split(\$7, p, \"/\")
    print day, p[3]
  }
}
' < /dev/null > /tmp/stats_app_detail.tmp
for f in /var/log/nginx/access.log*; do
  zcat -f \"\$f\" 2>/dev/null | awk '
BEGIN {
  mon[\"Jan\"]=\"01\"; mon[\"Feb\"]=\"02\"; mon[\"Mar\"]=\"03\"; mon[\"Apr\"]=\"04\"
  mon[\"May\"]=\"05\"; mon[\"Jun\"]=\"06\"; mon[\"Jul\"]=\"07\"; mon[\"Aug\"]=\"08\"
  mon[\"Sep\"]=\"09\"; mon[\"Oct\"]=\"10\"; mon[\"Nov\"]=\"11\"; mon[\"Dec\"]=\"12\"
}
index(\$7, \"/a/\") == 1 && \$7 != \"/a/test\" {
  match(\$0, /\[([0-9]{2})\/([A-Z][a-z]{2})\/([0-9]{4})/, a)
  if (a[1] != \"\") {
    day = a[3] mon[a[2]] a[1]
    split(\$7, p, \"/\")
    print day, p[3]
  }
}
' >> /tmp/stats_app_detail.tmp
done
"
sudo chmod 644 /tmp/stats_app.tmp /tmp/stats_app_detail.tmp

# ---- 构建月份列表 ----
MONTHS=$(awk '{print substr($1,1,6)}' /tmp/stats_daily.tmp | sort -u)

# ---- 生成主页面（月份选择 + 当月数据）----
cat > "$OUT" << 'HTMLHEAD'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>浮空岛 · 访问统计</title>
<style>
body{font-family:-apple-system,sans-serif;max-width:800px;margin:60px auto;padding:0 20px;color:#111;background:#fff}
h1{font-size:24px;margin-bottom:4px}
h2{font-size:15px;margin:32px 0 12px;color:#111}
.months{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}
.months a{text-decoration:none;padding:6px 16px;border-radius:20px;font-size:14px;border:1px solid #ddd;color:#111;background:#fff}
.months a.active{background:#111;color:#fff;border-color:#111;font-weight:600}
.num{font-size:56px;font-weight:800;color:#111;line-height:1}
.bar{margin:4px 0;display:flex;align-items:center;gap:6px;font-size:14px}
.bar .label,.bar-group .label{width:88px;flex-shrink:0;font-size:13px}
.bar-track{flex:1;height:20px;border-radius:4px;overflow:hidden;background:#f0f0f0}
.bar-track .fill{height:100%;border-radius:4px;background:#111;opacity:.75}
.bar .cnt{width:36px;flex-shrink:0;margin-left:4px;text-align:left;font-weight:600;font-size:13px}
.note{color:#999;font-size:13px;margin-top:16px}
.summary{display:flex;gap:40px;flex-wrap:wrap;margin:20px 0}
.summary-item{text-align:center}
.summary-item .val{font-size:36px;font-weight:800;color:#111}
.summary-item .lbl{font-size:12px;color:#999;margin-top:4px}
</style>
</head>
<body>
<h1>浮空岛 · 访问统计</h1>
HTMLHEAD

echo "<p class=\"note\">每日独立访客 · 行为识别自动过滤扫描 更新时间 $NOW</p>" >> "$OUT"

echo '<div class="months">' >> "$OUT"
for m in $MONTHS; do
  ym="${m:0:4}-${m:4:2}"
  label="${ym:0:4}年${ym:5:2}月"
  echo "<a href=\"stats-${ym}.html\">$label</a>" >> "$OUT"
done
echo '</div>' >> "$OUT"

# ---- 当月详细视图 ----
generate_month_page() {
  local YM=$1
  local OUTFILE=$2

  cat > "$OUTFILE" << HTMLHEAD2
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>浮空岛 · ${YM} 访问统计</title>
<style>
body{font-family:-apple-system,sans-serif;max-width:800px;margin:60px auto;padding:0 20px;color:#111;background:#fff}
h1{font-size:24px;margin-bottom:4px}
h2{font-size:15px;margin:32px 0 12px;color:#111}
.months{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}
.months a{text-decoration:none;padding:6px 16px;border-radius:20px;font-size:14px;border:1px solid #ddd;color:#111;background:#fff}
.months a.active{background:#111;color:#fff;border-color:#111;font-weight:600}
.num{font-size:56px;font-weight:800;color:#111;line-height:1}
.bar{margin:4px 0;display:flex;align-items:center;gap:6px;font-size:14px}
.bar .label,.bar-group .label{width:88px;flex-shrink:0;font-size:13px}
.bar-track{flex:1;height:20px;border-radius:4px;overflow:hidden;background:#f0f0f0}
.bar-track .fill{height:100%;border-radius:4px;background:#111;opacity:.75}
.bar .cnt{width:36px;flex-shrink:0;margin-left:4px;text-align:left;font-weight:600;font-size:13px}
.note{color:#999;font-size:13px;margin-top:16px}
.summary{display:flex;gap:40px;flex-wrap:wrap;margin:20px 0}
.summary-item{text-align:center}
.summary-item .val{font-size:36px;font-weight:800;color:#111}
.summary-item .lbl{font-size:12px;color:#999;margin-top:4px}
</style>
</head>
<body>
<h1>浮空岛 · 访问统计</h1>
HTMLHEAD2

  echo "<p class=\"note\">每日独立访客 · 行为识别自动过滤扫描 更新时间 $NOW</p>" >> "$OUTFILE"

  echo '<div class="months">' >> "$OUTFILE"
  for m in $MONTHS; do
    label="${m:0:4}年${m:4:2}月"
    my="${m:0:4}-${m:4:2}"
    if [ "$my" = "$YM" ]; then
      if [ "$my" = "$CUR_MONTH" ]; then
        echo "<a href=\"stats.html\" class=\"active\">$label</a>" >> "$OUTFILE"
      else
        echo "<a href=\"stats-${my}.html\" class=\"active\">$label</a>" >> "$OUTFILE"
      fi
    elif [ "$my" = "$CUR_MONTH" ]; then
      echo "<a href=\"stats.html\">$label</a>" >> "$OUTFILE"
    else
      echo "<a href=\"stats-${my}.html\">$label</a>" >> "$OUTFILE"
    fi
  done
  echo '</div>' >> "$OUTFILE"

  MONTH_PREFIX=$(echo "$YM" | tr -d '-')
  TOTAL=0; DAYS=0; MAX=1
  > /tmp/stats_month.tmp
  while read d h; do
    test "${d:0:6}" != "$MONTH_PREFIX" && continue
    TOTAL=$((TOTAL + h))
    DAYS=$((DAYS + 1))
    test "$h" -gt "$MAX" && MAX=$h
    echo "$d $h" >> /tmp/stats_month.tmp
  done < /tmp/stats_daily.tmp

  AVG=$(( TOTAL / (DAYS > 0 ? DAYS : 1) ))

  echo "<h2>${YM} 月概览</h2>" >> "$OUTFILE"
  echo "<div class=\"summary\">" >> "$OUTFILE"
  echo "<div class=\"summary-item\"><div class=\"val\">$TOTAL</div><div class=\"lbl\">月总访客</div></div>" >> "$OUTFILE"
  echo "<div class=\"summary-item\"><div class=\"val\">$AVG</div><div class=\"lbl\">日均访客</div></div>" >> "$OUTFILE"
  echo "<div class=\"summary-item\"><div class=\"val\">$DAYS</div><div class=\"lbl\">统计天数</div></div>" >> "$OUTFILE"
  echo "</div>" >> "$OUTFILE"

  echo '<h2>每日访客</h2>' >> "$OUTFILE"
  while read d h; do
    dt="${d:0:4}-${d:4:2}-${d:6:2}"
    pct=$(( h * 100 / MAX ))
    echo "<div class=\"bar\"><span class=\"label\">$dt</span><div class=\"bar-track\"><div class=\"fill\" style=\"width:${pct}%\"></div></div><span class=\"cnt\">$h</span></div>" >> "$OUTFILE"
  done < /tmp/stats_month.tmp

  # ---- App Store 点击统计（按日按app彩色分段） ----
  # 先聚合：从 stats_app_detail.tmp 得到 日期 app 次数的三元组
  > /tmp/stats_app_agg.tmp
  while read d name; do
    test "${d:0:6}" != "$MONTH_PREFIX" && continue
    test "$name" = "test" && continue
    echo "$d $name" >> /tmp/stats_app_agg.tmp
  done < /tmp/stats_app_detail.tmp

  APP_TOTAL=$(wc -l < /tmp/stats_app_agg.tmp)
  APP_DAYS=$(awk '{print $1}' /tmp/stats_app_agg.tmp | sort -u | wc -l)
  APP_MAX=$(sort /tmp/stats_app_agg.tmp | uniq -c | sort -rn | head -1 | awk '{print $1}')

  if [ "$APP_TOTAL" -gt 0 ]; then
    APP_AVG=$(( APP_TOTAL / (APP_DAYS > 0 ? APP_DAYS : 1) ))

    # CSS 颜色定义
    echo '<style>
    .app-ai-recorder{background:#FF5B22}
    .app-eye-gym{background:#22C55E}
    .app-kids-points{background:#FFB800}
    .app-bonsai{background:#593A00}
    .legend{display:flex;flex-wrap:wrap;gap:16px;margin:12px 0 24px;font-size:13px}
    .legend span{display:inline-flex;align-items:center;gap:6px}
    .legend .dot{width:12px;height:12px;border-radius:3px;flex-shrink:0}
    .bar-group{margin:4px 0;display:flex;align-items:center;gap:6px;font-size:14px}
.app-track{flex:1;height:20px;display:flex;gap:2px;border-radius:4px;overflow:hidden}
.app-track .seg{height:100%;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:600}
.app-track .seg:first-child{border-radius:4px 0 0 4px}
.app-track .seg:last-child{border-radius:0 4px 4px 0}
.app-track .seg:only-child{border-radius:4px}
.bar-group .cnt{width:36px;flex-shrink:0;margin-left:4px;text-align:left;font-weight:600;font-size:13px}
    </style>' >> "$OUTFILE"

    echo "<h2>App Store 每日点击</h2>" >> "$OUTFILE"
    echo "<div class=\"summary\">" >> "$OUTFILE"
    echo "<div class=\"summary-item\"><div class=\"val\">$APP_TOTAL</div><div class=\"lbl\">月总点击</div></div>" >> "$OUTFILE"
    echo "<div class=\"summary-item\"><div class=\"val\">$APP_AVG</div><div class=\"lbl\">日均点击</div></div>" >> "$OUTFILE"
    echo "</div>" >> "$OUTFILE"

    # 图例
    echo '<div class="legend">' >> "$OUTFILE"
    echo '<span><span class="dot app-ai-recorder"></span>AI Recorder</span>' >> "$OUTFILE"
    echo '<span><span class="dot app-eye-gym"></span>Eye Gym</span>' >> "$OUTFILE"
    echo '<span><span class="dot app-kids-points"></span>Kids Points</span>' >> "$OUTFILE"
    echo '<span><span class="dot app-bonsai"></span>Bonsai</span>' >> "$OUTFILE"
    echo '</div>' >> "$OUTFILE"

    # 每日彩色分段条
    for d in $(awk '{print $1}' /tmp/stats_app_agg.tmp | sort -u); do
      dt="${d:0:4}-${d:4:2}-${d:6:2}"
      day_total=$(grep -c "^$d " /tmp/stats_app_agg.tmp)
      echo "<div class=\"bar-group\"><span class=\"label\">$dt</span><div class=\"app-track\">" >> "$OUTFILE"
      for name in ai-recorder eye-gym kids-points bonsai; do
        app_cnt=$(grep "^$d $name$" /tmp/stats_app_agg.tmp | wc -l)
        if [ "$app_cnt" -gt 0 ]; then
          seg_pct=$(( app_cnt * 100 / day_total ))
          test "$seg_pct" -lt 5 && seg_pct=5
          echo "<div class=\"seg app-${name}\" style=\"width:${seg_pct}%\">$app_cnt</div>" >> "$OUTFILE"
        fi
      done
      echo "</div><span class=\"cnt\">$day_total</span></div>" >> "$OUTFILE"
    done
  fi

  rm -f /tmp/stats_app_agg.tmp /tmp/stats_app_month.tmp

  rm -f /tmp/stats_month.tmp
  echo '</body></html>' >> "$OUTFILE"
}

# ---- 生成当月页面 ----
generate_month_page "$CUR_MONTH" "$OUT"
cp "$OUT" "/home/admin/www/Floatingsk Website/stats-${CUR_MONTH}.html"

# ---- 生成所有历史月份页面 ----
for m in $MONTHS; do
  ym="${m:0:4}-${m:4:2}"
  if [ "$ym" = "$CUR_MONTH" ]; then continue; fi
  HF="/home/admin/www/Floatingsk Website/stats-${ym}.html"
  generate_month_page "$ym" "$HF"
  echo "  -> $HF"
done

sudo rm -f /tmp/stats_daily.tmp /tmp/stats_app.tmp /tmp/stats_app_detail.tmp
echo "Done: $OUT"
