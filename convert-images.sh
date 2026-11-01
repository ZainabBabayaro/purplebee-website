#!/bin/sh
# ============================================================================
# convert-images.sh
# Converts HEIC/JPG/PNG images to optimised JPEG using sips (built-in Mac).
# Usage: ./convert-images.sh
# ============================================================================

IMAGES_DIR="public/images"
converted=0
skipped=0

echo ""
echo "✦ Purple Bee Cakes — image converter"
echo "────────────────────────────────────"

convert_folder() {
  folder=$1
  max_width=$2
  dir="$IMAGES_DIR/$folder"

  for file in "$dir"/*; do
    [ -f "$file" ] || continue

    # Get lowercase extension
    ext=$(echo "${file##*.}" | tr '[:upper:]' '[:lower:]')

    # Process HEIC, JPG, JPEG, PNG only
    case "$ext" in
      heic|jpg|jpeg|png) ;;
      *) continue ;;
    esac

    # Build clean output name: lowercase, spaces→hyphens, .jpg extension
    base=$(basename "$file")
    # Remove extension
    name="${base%.*}"
    # Clean up name
    name=$(echo "$name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr '_' '-')
    # Remove trailing spaces/dots
    name=$(echo "$name" | sed 's/[. ]*$//')
    out="$dir/$name.jpg"

    echo ""
    echo "  Converting: $base  →  $name.jpg"

    sips \
      --resampleHeightWidthMax "$max_width" \
      --setProperty format jpeg \
      --setProperty formatOptions 85 \
      "$file" \
      --out "$out" \
      > /dev/null 2>&1

    if [ $? -eq 0 ]; then
      size=$(du -sh "$out" | cut -f1)
      echo "  ✓  /images/$folder/$name.jpg  ($size)"
      converted=$((converted + 1))
    else
      echo "  ✗  Failed: $base"
      skipped=$((skipped + 1))
    fi
  done
}

convert_folder "cakes"  900
convert_folder "hero"   1600
convert_folder "brand"  1200
convert_folder "team"   800

echo ""
echo "────────────────────────────────────"
echo "✦ Done — $converted converted, $skipped skipped"
echo ""
echo "Your images are ready. Now add the paths to src/data/cakes.js:"
echo "  image: '/images/cakes/your-image-name.jpg',"
echo ""
