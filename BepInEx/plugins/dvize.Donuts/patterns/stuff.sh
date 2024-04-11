#!/bin/bash

# Check if a file name was provided as an argument
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <file-name>"
  exit 1
fi

# The first command line argument is the file name to copy
fileName="$1"

# Base directory where the source file is located
baseDir="starting-pmcs-only-live-like"

# Target directories where the file will be copied
declare -a targetDirs=(
"live-like"
"starting-pmcs-only-live-like-alt"
"starting-pmcs-only-morescavs"
"starting-pmcs-only-quietraids"
"crazyraids"
"impossibleraids"
"quietraids"
"morescavs"
"morepmcs"
"live-like-alt"
"live-like-alt-2"
# "no-starting-pmcs"
# "boss-mania"
# "scav-raids"
)

# Loop through each target directory and copy the file
for dir in "${targetDirs[@]}"
do
  cp "$baseDir/$fileName" "$dir"
done

echo "Copying $fileName completed."
