import os
import json
import random

# Round to nearest 10
def round_to_nearest_10(value):
    return round(value / 10) * 10

# Round to nearest 50
def round_to_nearest_50(value):
    return round(value / 50) * 50

# Map name mappings
map_name_mappings = {
    "customs": "bigmap",
    "factory": "factory4_day",
    "factory_night": "factory4_night",
    "streets": "tarkovstreets",
    "reserve": "rezervbase",
    "interchange": "interchange",
    "woods": "woods",
    "groundzero": "sandbox",
    "groundzero_high": "sandbox_high",
    "laboratory": "laboratory",
    "lighthouse": "lighthouse",
    "shoreline": "shoreline"
}

def update_wave_parameters(wave, start_timer, start_cooldown, spawn_chance, distance):
    wave["TriggerTimer"] = round_to_nearest_10(start_timer)
    wave["MaxTriggersBeforeCooldown"] = start_cooldown
    wave["SpawnChance"] = spawn_chance
    wave["TriggerDistance"] = round_to_nearest_50(distance)

def update_waves(data, real_map_name, faction, params):
    start_timer = params["start_timer"]
    start_cooldown = params["start_cooldown"]
    spawn_chance = params["spawn_chance"]
    distance = params["distance"]

    if real_map_name in data["Maps"] and faction in data["Maps"][real_map_name]:
        for wave in data["Maps"][real_map_name][faction]:
            update_wave_parameters(wave, start_timer, start_cooldown, spawn_chance, distance)
            start_timer += random.randint(45, 75)
            start_timer = round_to_nearest_10(start_timer)
            start_cooldown += random.randint(1, 2)

def update_files_in_directory(directory, params):
    for filename in os.listdir(directory):
        if filename.endswith('_waves.json'):
            file_path = os.path.join(directory, filename)
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)

            map_key = filename.replace('_waves.json', '')
            real_map_name = map_name_mappings.get(map_key, None)
            if real_map_name is None:
                print(f"Warning: No mapping found for {map_key}")
                continue
            
            for faction in ["PMC", "SCAV"]:
                update_waves(data, real_map_name, faction, params[faction])

            with open(file_path, 'w', encoding='utf-8') as file:
                json.dump(data, file, indent=2)

def update_factory_files_in_directory(directory, params):
    for filename in ["factory_waves.json", "factory_night_waves.json"]:
        file_path = os.path.join(directory, filename)
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)

            real_map_name = map_name_mappings[filename.replace('_waves.json', '')]
            for faction in ["PMC", "SCAV"]:
                update_waves(data, real_map_name, faction, params[faction])

            with open(file_path, 'w', encoding='utf-8') as file:
                json.dump(data, file, indent=2)

def get_params_from_user(faction, folder):
    if faction == "PMC":
        start_timer = int(input(f"Enter the starting TriggerTimer for PMC in {folder}: ").strip())
        start_cooldown = int(input(f"Enter the starting MaxTriggersBeforeCooldown for PMC in {folder}: ").strip())
        spawn_chance = int(input(f"Enter the SpawnChance value for PMC in {folder}: ").strip())
        distance = int(input(f"Enter the TriggerDistance value for PMC in {folder}: ").strip())
    else:
        start_timer = int(input(f"Enter the starting TriggerTimer for SCAV in {folder}: ").strip())
        start_cooldown = int(input(f"Enter the starting MaxTriggersBeforeCooldown for SCAV in {folder}: ").strip())
        spawn_chance = int(input(f"Enter the SpawnChance value for SCAV in {folder}: ").strip())
        distance = int(input(f"Enter the TriggerDistance value for SCAV in {folder}: ").strip())

    return {
        "start_timer": start_timer,
        "start_cooldown": start_cooldown,
        "spawn_chance": spawn_chance,
        "distance": distance
    }

def get_mode_and_params():
    mode = input("Select mode: 1) Update all files 2) Update specific map files 3) Update factory files only: ").strip()
    if mode not in ["1", "2", "3"]:
        print("Invalid mode. Please enter '1', '2', or '3'.")
        return get_mode_and_params()

    params = {}
    folders = [
        "impossibleraids", "crazyraids", "live-like", "live-like-alt", "morepmcs",
        "morescavs", "quietraids", "scav-raids",
        "starting-pmcs-only-live-like", "starting-pmcs-only-live-like-alt", "starting-pmcs-only-morescavs",
        "starting-pmcs-only-quietraids"
    ]
    for folder in folders:
        directory = os.path.join(base_directory, folder)
        for faction in ["PMC", "SCAV"]:
            params[faction] = get_params_from_user(faction, folder)

        if mode == "1":
            update_files_in_directory(directory, params)
        elif mode == "2":
            map_name = input("Enter map name: ").strip()
            if map_name not in map_name_mappings:
                print("Invalid map name. Please enter a valid map name from the provided list.")
                return get_mode_and_params()

            update_files_in_directory(directory, params)
        elif mode == "3":
            update_factory_files_in_directory(directory, params)

if __name__ == "__main__":
    base_directory = "/Users/kevinossa/dev/personal/nookys-swag-presets-spt/BepInEx/plugins/dvize.Donuts/patterns"
    get_mode_and_params()
