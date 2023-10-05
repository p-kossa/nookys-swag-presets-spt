#!/bin/bash

# Directory containing JSON files
directory="/Users/kossa/dev/personal/nookys-swag-presets-spt/BepInEx/plugins/dvize.Donuts/patterns/crazyraids"

# Find and process JSON files
find "$directory" -type f -name '*_scav.json' -print0 | while IFS= read -r -d $'\0' file; do
  echo "Processing $file..."

  # Use jq to update MinSpawnDistanceFromPlayer to 60
  jq '(.Locations[] | select(.SpawnChance)).SpawnChance = 60' "$file" > tmpfile && mv tmpfile "$file"

  echo "Done processing $file."
done

echo "All files processed."
