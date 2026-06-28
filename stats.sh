#!/bin/bash
OUT="/home/admin/www/Floatingsk Website/stats.html"
LOG="/var/log/nginx/access.log"
NOW=$(TZ='Asia/Shanghai' date '+%Y-%m-%d %H:%M')
CUR_MONTH=$(TZ='Asia/Shanghai' date '+%Y-%m')

# ---- 过滤规则 ----
FILTER_PATTERN='(Chrome|Safari|Firefox|Edge)'
EXCLUDE_UA='(bot|crawler|spider|scanner|python|curl|wget|zgrab|Censys|Expanse|nmap|masscan|Go-http|Hello from)'
EXCLUDE_IP='69\.5\.20\.93|35\.200\.106|34\.156\.217|35\.243\.233|34\.130\.13|34\.162\.119|80\.94\.95|94\.26\.88|80\.87\.206|34\.57\.197|5\.61\.209|8\.231\.164|35\.240\.198'

# ---- 从日志内容提取真实日期，按日统计 ----
# nginx日志格式: [DD/Mon/YYYY:HH:MM:SS +TZ]
# awk 提取日期、过滤、按日计数
sudo sh -c "
> /tmp/stats_daily.tmp
for f in /var/log/nginx/access.log*; do
  zcat -f \"\$f\" 2>/dev/null
done | awk -v ua=\"$FILTER_PATTERN\" -v exua=\"$EXCLUDE_UA\" -v exip=\"$EXCLUDE_IP\" '
BEGIN {
  mon[\"Jan\"]=\"01\"; mon[\"Feb\"]=\"02\"; mon[\"Mar\"]=\"03\"; mon[\"Apr\"]=\"04\"
  mon[\"May\"]=\"05\"; mon[\"Jun\"]=\"06\"; mon[\"Jul\"]=\"07\"; mon[\"Aug\"]=\"08\"
  mon[\"Sep\"]=\"09\"; mon[\"Oct\"]=\"10\"; mon[\"Nov\"]=\"11\"; mon[\"Dec\"]=\"12\"
}
\$0 !~ exua && \$0 !~ exip && \$0 ~ ua {
  match(\$0, /\[([0-9]{2})\/([A-Z][a-z]{2})\/([0-9]{4})/, a)
  if (a[1] != \"\") {
    day = a[3] mon[a[2]] a[1]   # -> 20260625
    cnt[day]++
  }
}
END { for (d in cnt) print d, cnt[d] }
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
body{font-family:-apple-system,sans-serif;max-width:800px;margin:60px auto;padding:0 20px;color:#111;background:#F8F5EC}
h1{font-size:24px;margin-bottom:4px}
h2{font-size:15px;margin:32px 0 12px;color:#593A00}
.months{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}
.months a{text-decoration:none;padding:6px 16px;border-radius:20px;font-size:14px;border:1px solid #ddd;color:#593A00;background:#fff}
.months a.active{background:#593A00;color:#fff;border-color:#593A00;font-weight:600}
.num{font-size:56px;font-weight:800;color:#593A00;line-height:1}
.bar{margin:4px 0;display:flex;align-items:center;gap:10px;font-size:14px}
.bar .label{min-width:90px;font-family:monospace}
.bar .fill{height:20px;border-radius:4px;background:#593A00;opacity:.65;min-width:2px}
.bar .cnt{min-width:60px;text-align:right;font-weight:600}
.note{color:#999;font-size:13px;margin-top:16px}
.summary{display:flex;gap:40px;flex-wrap:wrap;margin:20px 0}
.summary-item{text-align:center}
.summary-item .val{font-size:36px;font-weight:800;color:#593A00}
.summary-item .lbl{font-size:12px;color:#999;margin-top:4px}
</style>
</head>
<body>
<h1>浮空岛 · 访问统计</h1>
HTMLHEAD

echo "<p class=\"note\">已过滤已知扫描IP 只统计真人浏览器 更新时间 $NOW</p>" >> "$OUT"

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
body{font-family:-apple-system,sans-serif;max-width:800px;margin:60px auto;padding:0 20px;color:#111;background:#F8F5EC}
h1{font-size:24px;margin-bottom:4px}
h2{font-size:15px;margin:32px 0 12px;color:#593A00}
.months{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}
.months a{text-decoration:none;padding:6px 16px;border-radius:20px;font-size:14px;border:1px solid #ddd;color:#593A00;background:#fff}
.months a.active{background:#593A00;color:#fff;border-color:#593A00;font-weight:600}
.num{font-size:56px;font-weight:800;color:#593A00;line-height:1}
.bar{margin:4px 0;display:flex;align-items:center;gap:10px;font-size:14px}
.bar .label{min-width:90px;font-family:monospace}
.bar .fill{height:20px;border-radius:4px;background:#593A00;opacity:.65;min-width:2px}
.bar .cnt{min-width:60px;text-align:right;font-weight:600}
.note{color:#999;font-size:13px;margin-top:16px}
.summary{display:flex;gap:40px;flex-wrap:wrap;margin:20px 0}
.summary-item{text-align:center}
.summary-item .val{font-size:36px;font-weight:800;color:#593A00}
.summary-item .lbl{font-size:12px;color:#999;margin-top:4px}
</style>
</head>
<body>
<h1>浮空岛 · 访问统计</h1>
HTMLHEAD2

  echo "<p class=\"note\">已过滤已知扫描IP 只统计真人浏览器 更新时间 $NOW</p>" >> "$OUTFILE"

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
    bar_w=$(( h * 400 / MAX ))
    echo "<div class=\"bar\"><span class=\"label\">$dt</span><div class=\"fill\" style=\"width:${bar_w}px\"></div><span class=\"cnt\">$h</span></div>" >> "$OUTFILE"
  done < /tmp/stats_month.tmp

  # ---- App Store 点击统计 ----
  APP_TOTAL=0; APP_DAYS=0; APP_MAX=1
  > /tmp/stats_app_month.tmp
  while read d h; do
    test "${d:0:6}" != "$MONTH_PREFIX" && continue
    APP_TOTAL=$((APP_TOTAL + h))
    APP_DAYS=$((APP_DAYS + 1))
    test "$h" -gt "$APP_MAX" && APP_MAX=$h
    echo "$d $h" >> /tmp/stats_app_month.tmp
  done < /tmp/stats_app.tmp

  if [ "$APP_DAYS" -gt 0 ]; then
    APP_AVG=$(( APP_TOTAL / APP_DAYS ))
    echo "<h2>App Store 点击</h2>" >> "$OUTFILE"
    echo "<div class=\"summary\">" >> "$OUTFILE"
    echo "<div class=\"summary-item\"><div class=\"val\">$APP_TOTAL</div><div class=\"lbl\">月总点击</div></div>" >> "$OUTFILE"
    echo "<div class=\"summary-item\"><div class=\"val\">$APP_AVG</div><div class=\"lbl\">日均点击</div></div>" >> "$OUTFILE"
    echo "</div>" >> "$OUTFILE"

    echo '<h2>每日点击</h2>' >> "$OUTFILE"
    while read d h; do
      dt="${d:0:4}-${d:4:2}-${d:6:2}"
      bar_w=$(( h * 400 / APP_MAX ))
      echo "<div class=\"bar\"><span class=\"label\">$dt</span><div class=\"fill\" style=\"width:${bar_w}px\"></div><span class=\"cnt\">$h</span></div>" >> "$OUTFILE"
    done < /tmp/stats_app_month.tmp

    # 当月各 app 点击汇总
    echo '<h2>各应用点击</h2>' >> "$OUTFILE"
    > /tmp/stats_app_names.tmp
    while read d name; do
      test "${d:0:6}" != "$MONTH_PREFIX" && continue
      echo "$name" >> /tmp/stats_app_names.tmp
    done < /tmp/stats_app_detail.tmp
    sort /tmp/stats_app_names.tmp | grep -v '^test$' | uniq -c | sort -rn | while read cnt name; do
      bar_w=$(( cnt * 400 / APP_MAX ))
      label="$name"
      case "$name" in
        ai-recorder) label="AI Recorder" ;;
        eye-gym)     label="Eye Gym" ;;
        kids-points) label="Kids Points" ;;
        bonsai)      label="Bonsai" ;;
      esac
      echo "<div class=\"bar\"><span class=\"label\">$label</span><div class=\"fill\" style=\"width:${bar_w}px\"></div><span class=\"cnt\">$cnt</span></div>" >> "$OUTFILE"
    done
    rm -f /tmp/stats_app_names.tmp
  fi

  rm -f /tmp/stats_app_month.tmp

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
