#!/usr/bin/env bash
# Referans mağaza ürün görsellerini çeker ve src/refStores.json üretir.
set -u
SITELER="$HOME/Desktop/Siteler"
REEL="$HOME/Desktop/idepo-reels"
OUT="$REEL/public/assets/stores"
mkdir -p "$OUT"

# args: key  jsonfile  imageJqExpr  selectJqExpr  count
fetch_store () {
  local key="$1" json="$2" imgexpr="$3" selexpr="$4" count="$5"
  local dir="$OUT/$key"
  mkdir -p "$dir"
  echo "--- $key ---"
  # Seçili ürünleri TSV olarak çek: img \t name \t price
  jq -r "[.products[] | select($selexpr)] | .[0:$count][] | [($imgexpr), .name, (.price|tostring)] | @tsv" "$json" \
  | while IFS=$'\t' read -r url name price; do
      [ -z "$url" ] && continue
      i=$((${i:-0}+1)); echo "$i" > "$dir/.i"; i=$(cat "$dir/.i")
      ext="${url##*.}"; ext="${ext%%\?*}"; [ "${#ext}" -gt 4 ] && ext="jpg"
      f="$dir/p$i.$ext"
      if curl -sL --max-time 25 -o "$f" "$url" && [ -s "$f" ]; then
        echo "p$i.$ext  <= ${name:0:42}"
        printf '%s\t%s\t%s\n' "assets/stores/$key/p$i.$ext" "$name" "$price" >> "$dir/.manifest.tsv"
      else
        echo "FAIL $url"
      fi
    done
  rm -f "$dir/.i"
}

rm -rf "$OUT"/*/.manifest.tsv 2>/dev/null

fetch_store pharmacy "$SITELER/b2b-pharmacy/kozvit_products.json" \
  '.image_url' '.image_url != null and .image_url != ""' 6

fetch_store vitamin "$SITELER/b2b-pharmacy/kozvit_products.json" \
  '.image_url' '(.image_url != null and .image_url != "") and (.main_category=="Vitaminler" or .main_category=="Besin Takviyeleri")' 6

fetch_store hirdavat "$SITELER/i-hirdavat/hirdavat_products.json" \
  '.images[0]' '(.images|length>0) and (.images[0]!=null) and (.images[0]|test("^http"))' 6

fetch_store kirtasiye "$SITELER/i-kirtasiye/backend/database/data/nezih_products.json" \
  '.images[0]' '(.images|length>0) and (.images[0]!=null) and (.images[0]|test("^http"))' 6

# Logoları kopyala
cp "$SITELER/b2b-pharmacy/i-depo-logo.png" "$OUT/pharmacy/logo.png" 2>/dev/null && echo "pharmacy logo ok"
cp "$SITELER/i-kirtasiye/i-kirtasiye-logo.webp" "$OUT/kirtasiye/logo.webp" 2>/dev/null && echo "kirtasiye logo ok"

echo "DONE. Manifest dirs:"; ls -R "$OUT" | head -60
