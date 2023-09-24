#!/bin/bash

# Specify the key to update
key_to_update="SpawnChance"

# Specify the new value
new_value=75

# Iterate over matching JSON files in the current directory
for file in *_scav.json; do
  if [ -f "$file" ]; then
    # Use jq to update the JSON file
    jq --argjson new_value "$new_value" '.["'$key_to_update'"]=$new_value' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    echo "Updated $file"
  fi
done

echo "All matching JSON files in the current directory have been updated."
