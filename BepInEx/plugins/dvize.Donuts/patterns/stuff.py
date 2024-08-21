import os
import json

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
    "laboratory": "laboratory",
    "lighthouse": "lighthouse",
    "shoreline": "shoreline"
}

def update_spawn_chance_and_zones_in_file(file_path, scav_spawn_chance, pmc_spawn_chance):
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    real_map_name = map_name_mappings[os.path.basename(file_path).replace('_waves.json', '')]
    
    if real_map_name in data["Maps"]:
        if "SCAV" in data["Maps"][real_map_name]:
            for wave in data["Maps"][real_map_name]["SCAV"]:
                wave["SpawnChance"] = scav_spawn_chance
                if "start" not in wave["Zones"]:
                    wave["Zones"].append("start")
        
        if "PMC" in data["Maps"][real_map_name]:
            for wave in data["Maps"][real_map_name]["PMC"]:
                wave["SpawnChance"] = pmc_spawn_chance
                if "start" not in wave["Zones"]:
                    wave["Zones"].append("start")

    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=2)

def update_factory_files_in_live_like_folders(base_directory, scav_spawn_chance, pmc_spawn_chance):
    for folder in os.listdir(base_directory):
        if "live-like" in folder:
            directory = os.path.join(base_directory, folder)
            for filename in ["factory_waves.json", "factory_night_waves.json"]:
                file_path = os.path.join(directory, filename)
                if os.path.exists(file_path):
                    update_spawn_chance_and_zones_in_file(file_path, scav_spawn_chance, pmc_spawn_chance)

if __name__ == "__main__":
    base_directory = "/Users/kevinossa/dev/personal/nookys-swag-presets-spt/BepInEx/plugins/dvize.Donuts/patterns"
    scav_spawn_chance = int(input("Enter the new SpawnChance value for SCAV waves: ").strip())
    pmc_spawn_chance = int(input("Enter the new SpawnChance value for PMC waves: ").strip())
    update_factory_files_in_live_like_folders(base_directory, scav_spawn_chance, pmc_spawn_chance)
