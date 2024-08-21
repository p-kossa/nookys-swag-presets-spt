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

def get_wave_input():
  mode = input("Select mode: 1) Add wave to all maps 2) Add wave to specific map 3) Add wave to factory files only: ").strip()
  if mode not in ["1", "2", "3"]:
    print("Invalid mode. Please enter '1', '2', or '3'.")
    return get_wave_input()

  if mode == "1":
    add_to_all = True
    faction = input("Enter faction (PMC or SCAV): ").strip().upper()
    if faction not in ["PMC", "SCAV"]:
      print("Invalid faction. Please enter 'PMC' or 'SCAV'.")
      return get_wave_input()
    
    if faction == "PMC":
      wave = {
        "faction": faction,
        "trigger_timer": 600,
        "trigger_distance": 800,
        "spawn_chance": 50,
        "max_triggers_before_cooldown": 2,
        "ignore_timer_first_spawn": False,
        "min_group_size": 1,
        "max_group_size": 5,
        "zones": input("Enter Zones (comma-separated): ").strip().split(',')
      }
    else:
      wave = {
        "faction": faction,
        "trigger_timer": 180,
        "trigger_distance": 800,
        "spawn_chance": 75,
        "max_triggers_before_cooldown": 5,
        "ignore_timer_first_spawn": False,
        "min_group_size": 1,
        "max_group_size": 3,
        "zones": input("Enter Zones (comma-separated): ").strip().split(',')
      }
    return {"mode": "all", "wave": wave}

  elif mode == "2":
    add_to_all = False
    faction = input("Enter faction (PMC or SCAV): ").strip().upper()
    if faction not in ["PMC", "SCAV"]:
      print("Invalid faction. Please enter 'PMC' or 'SCAV'.")
      return get_wave_input()
    
    map_name = input("Enter map name: ").strip()
    if map_name not in map_name_mappings:
      print("Invalid map name. Please enter a valid map name from the provided list.")
      return get_wave_input()

    if faction == "PMC":
      return {
        "mode": "specific",
        "faction": faction,
        "map_name": map_name,
        "trigger_timer": 600,
        "trigger_distance": 800,
        "spawn_chance": 50,
        "max_triggers_before_cooldown": 2,
        "ignore_timer_first_spawn": False,
        "min_group_size": 1,
        "max_group_size": 5,
        "zones": input("Enter Zones (comma-separated): ").strip().split(',')
      }
    else:
      return {
        "mode": "specific",
        "faction": faction,
        "map_name": map_name,
        "trigger_timer": 180,
        "trigger_distance": 800,
        "spawn_chance": 75,
        "max_triggers_before_cooldown": 5,
        "ignore_timer_first_spawn": False,
        "min_group_size": 1,
        "max_group_size": 3,
        "zones": input("Enter Zones (comma-separated): ").strip().split(',')
      }

  else:
    return {"mode": "factory"}

def determine_next_group_num(data, real_map_name, faction):
  if real_map_name in data["Maps"] and faction in data["Maps"][real_map_name]:
    existing_groups = data["Maps"][real_map_name][faction]
    if existing_groups:
      max_group_num = max(group["GroupNum"] for group in existing_groups)
      return max_group_num + 1
  return 1

def add_wave_to_file(file_path, wave_input, real_map_name):
  with open(file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

  faction = wave_input["faction"]
  group_num = determine_next_group_num(data, real_map_name, faction)
  wave = {
    "GroupNum": group_num,
    "TriggerTimer": wave_input["trigger_timer"],
    "TriggerDistance": wave_input["trigger_distance"],
    "SpawnChance": wave_input["spawn_chance"],
    "MaxTriggersBeforeCooldown": wave_input["max_triggers_before_cooldown"],
    "IgnoreTimerFirstSpawn": wave_input["ignore_timer_first_spawn"],
    "MinGroupSize": wave_input["min_group_size"],
    "MaxGroupSize": wave_input["max_group_size"],
    "Zones": wave_input["zones"]
  }

  if real_map_name in data["Maps"]:
    if faction in data["Maps"][real_map_name]:
      data["Maps"][real_map_name][faction].append(wave)
    else:
      data["Maps"][real_map_name][faction] = [wave]
  else:
    data["Maps"][real_map_name] = {faction: [wave]}

  with open(file_path, 'w', encoding='utf-8') as file:
    json.dump(data, file, indent=2)

def add_wave_to_all_files(base_directory, folders, wave):
  for folder in folders:
    if wave["faction"] == "PMC" and folder.startswith("starting-pmcs-only-"):
      print(f"Skipping folder {folder} for PMC waves.")
      continue

    directory = os.path.join(base_directory, folder)
    for filename in os.listdir(directory):
      if filename.endswith('_waves.json'):
        file_path = os.path.join(directory, filename)
        real_map_name = map_name_mappings[filename.replace('_waves.json', '')]
        add_wave_to_file(file_path, wave, real_map_name)

def add_wave_to_specific_file(base_directory, folders, wave_input):
  for folder in folders:
    if wave_input["faction"] == "PMC" and folder.startswith("starting-pmcs-only-"):
      print(f"Skipping folder {folder} for PMC waves.")
      continue

    directory = os.path.join(base_directory, folder)
    map_file = f"{wave_input['map_name']}_waves.json"
    file_path = os.path.join(directory, map_file)
    if os.path.exists(file_path):
      real_map_name = map_name_mappings[wave_input["map_name"]]
      add_wave_to_file(file_path, wave_input, real_map_name)

def add_wave_to_factory_files(base_directory, folders):
  for folder in folders:
    directory = os.path.join(base_directory, folder)
    
    # Prompt the user for parameters for each folder
    faction = input(f"Enter faction for {folder} (PMC or SCAV): ").strip().upper()
    if faction not in ["PMC", "SCAV"]:
      print("Invalid faction. Please enter 'PMC' or 'SCAV'.")
      return
    if faction == "PMC":
      wave_input = {
        "faction": faction,
        "trigger_timer": 600,
        "trigger_distance": 800,
        "spawn_chance": 50,
        "max_triggers_before_cooldown": 2,
        "ignore_timer_first_spawn": False,
        "min_group_size": 1,
        "max_group_size": 5,
        "zones": input(f"Enter Zones for {folder} (comma-separated): ").strip().split(',')
      }
    else:
      wave_input = {
        "faction": faction,
        "trigger_timer": 180,
        "trigger_distance": 800,
        "spawn_chance": 75,
        "max_triggers_before_cooldown": 5,
        "ignore_timer_first_spawn": False,
        "min_group_size": 1,
        "max_group_size": 3,
        "zones": input(f"Enter Zones for {folder} (comma-separated): ").strip().split(',')
      }

    for filename in ["factory_waves.json", "factory_night_waves.json"]:
      file_path = os.path.join(directory, filename)
      if os.path.exists(file_path):
        real_map_name = map_name_mappings[filename.replace('_waves.json', '')]
        add_wave_to_file(file_path, wave_input, real_map_name)

if __name__ == "__main__":
  base_directory = "/Users/kevinossa/dev/personal/nookys-swag-presets-spt/BepInEx/plugins/dvize.Donuts/patterns"
  folders = [
    "impossibleraids", "live-like", "live-like-alt", "morepmcs",
    "morescavs", "quietraids", "scav-raids",
    "starting-pmcs-only-live-like", "starting-pmcs-only-live-like-alt", "starting-pmcs-only-morescavs"
  ]

  wave_input = get_wave_input()
  if wave_input["mode"] == "all":
    add_wave_to_all_files(base_directory, folders, wave_input["wave"])
  elif wave_input["mode"] == "specific":
    add_wave_to_specific_file(base_directory, folders, wave_input)
  elif wave_input["mode"] == "factory":
    add_wave_to_factory_files(base_directory, folders)
