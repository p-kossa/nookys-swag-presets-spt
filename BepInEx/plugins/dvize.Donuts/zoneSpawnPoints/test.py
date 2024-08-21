import json
import random
import os
from collections import defaultdict

# Path to the folder containing the JSON files
folder_path = '/Users/kevinossa/dev/personal/nookys-swag-presets-spt/BepInEx/plugins/dvize.Donuts/zoneSpawnPoints'

# Prompt the user for the input filename
input_filename = input("Enter the input filename (without extension): ")

# Construct the full file path
input_filepath = os.path.join(folder_path, f"{input_filename}.json")

# Load the data from the input file
with open(input_filepath, 'r') as file:
    data = json.load(file)

# Extract and shuffle coordinates from each zone
all_coords = []
for zone, coords in data["Zones"].items():
    all_coords.extend(coords)

random.shuffle(all_coords)

# Function to split list into chunks of max size n
def chunk_list(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

# Split shuffled coordinates into new zones with no more than 4 points each
new_zones = defaultdict(list)
chunked_coords = list(chunk_list(all_coords, 4))

for i, chunk in enumerate(chunked_coords):
    new_zone_name = f"Zone_Random_Alt_{i}"
    new_zones[new_zone_name] = chunk

# Create the new data structure
new_data = {
    "MapName": data["MapName"],
    "Zones": new_zones
}

# Construct the output filename
output_filename = f"{input_filename}-new.json"
output_filepath = os.path.join(folder_path, output_filename)

# Save the new data to the output file
with open(output_filepath, 'w') as file:
    json.dump(new_data, file, indent=2)

print(f"New data has been saved to {output_filepath}")
