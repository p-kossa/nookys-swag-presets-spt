# SWAG + Donuts (SWAG 3)
![Version: 3.0.4](https://img.shields.io/badge/Version-3.0.4-informational?style=flat-square)

**All credit goes to Props, creator of SWAG and DONUTS**

https://hub.sp-tarkov.com/files/file/878-simple-wave-ai-generator-swag/#overview

---

## SWAG Config Reference

```
{
	"aiDifficulty": "normal",   <------- bot difficulty, the same as in-game.
	"aiAmount": "asonline",   <------- in-game AI amount - this only affects SCAV and PMC (if pmcWaves: true) waves
	"RandomWaveCount": 7,   <------- # of waves
	"BossWaveCount": 1,   <------- # of boss waves - don't change this unless you want to experiment
	"SkipOtherBossWavesIfBossWaveSelected": false,   <------- same as BossWaveCount, don't change this unless you want to experiment
  "GlobalRandomWaveTimer": {
    "WaveTimerMinSec": 60,   <------- global wave timers - these only apply to RANDOM waves, i.e. all_scav.json
    "WaveTimerMaxSec": 120
  },
	"BossChance": {   <------- set your own boss chance, per boss, per map. it's just a flat percentage. (OPTIONAL) if you add a boss to a NEW MAP then you have to add it below
    "glukhar": {
      "reserve": 25,
      "streets": 15
    },
    "killa": {
      "interchange": 25,
      "streets": 15
    },
    "tagilla": {
      "factory": 25
    },
    "zryachiy": {
      "lighthouse": 100
    },
    "sanitar": {
      "shoreline": 25
    },
    "reshala": {
      "customs": 25
    },
    "shturman": {
      "woods": 25
    },
    "goons": {
      "customs": 25,
      "woods": 22,
      "shoreline": 22,
      "lighthouse": 25
    },
    "cultists": {
      "customs": 10,
      "woods": 10,
      "shoreline": 10,
      "factory_night": 100
    }
  },
  "PMCs": {
    "pmcWaves": true,   <------- set to true if you want PMCs to spawn throughout the duration of your raids (waves). false disables all PMC waves so that only your start-of-raid PMCs spawn.
    "pmcSpawnWeight": 35,   <------- A flat percentage that is checked before spawning a wave - SWAG will roll a random number between 1-100 and check if it's greater than this weight, if it is then that wave will be "skipped". So, more PMCs, higher weight. Fewer PMCs, lower weight.
    "pmcChance": 65,   <------- A flat percentage, similar to BossChance above, this affects all start-of-raid PMCs. See FAQ below for more details.
    "pmcGroupChance": "asonline"   <------- Affects chance start-of-raid PMCs are solo or in a group. See FAQ below for more details.
  },
  "Others": {
    "scavWaves": true,   <------- same as pmcWaves, except this disables ALL SCAVs.
    "scavSpawnWeight": 80,   <------- same as pmcSpawnWeight
    "sniperChance": 50,   <------- same as BossChance, pmcChance, etc.
    "scavInLabs": false   <------- if false, no SCAVs should spawn in Labs. if true, SCAV waves will spawn as normal.
    "rogueChance": {   <------- same as BossChance, pmcChance, etc. (OPTIONAL) if you add rogues to a NEW MAP then you have to add it below
      "lighthouse": 75
    },
    "raiderChance": {   <------- same as BossChance, pmcChance, etc. (OPTIONAL) if you add raiders to a NEW MAP then you have to add it below
      "laboratory": 60,
      "reserve": 75
    }
  },
	"MaxBotCap": {   <------- Max bot caps - this is the max allowed bot spawns on each map. Once the cap is reached the game still stop spawning bots and then start a queue - once bots die new ones will take their place.
		"factory": 14,
		"customs": 24,
		"woods": 27,
		"shoreline": 28,
		"lighthouse": 30,
		"reserve": 23,
		"interchange": 24,
		"labs": 14,
		"streets": 24
	},
  "NightMaxBotCap": {   <------- same as MaxBotCap, except this is specifically for night raids. when you load into a night raid specifically, then the below caps are used instead for each map.
		"factory_night": 14,
		"customs": 24,
		"woods": 27,
		"shoreline": 28,
		"lighthouse": 30,
		"reserve": 23,
		"interchange": 24,
		"labs": 14,
		"streets": 24
  },
	"MaxBotPerZone": 7,   <------- Max allowed bots per zone.
	"UseDefaultSpawns": {   <------- vanilla SPT spawns - don't change this unless you want to experiment
		"Waves": false,
		"Bosses": false,
		"TriggeredWaves": false
	},
	"DebugOutput": false   <------- debug logs - set to true if you want to see SWAG wave details, SWAG will print each generated wave to your console logs. useful for when experimenting (it's a lot of log spam, be warned)
}
```

## Donuts config reference

```
{
  "MapName": "bigmap",
  "GroupNum": 1,
  "Name": "pmc_trailer_park",
  "Position": {
    "x": -321.211029,
    "y": 0.8538656,
    "z": -231.526016
  },
  "WildSpawnType": "pmc",
  "MinDistance": 1.0,
  "MaxDistance": 5.0,
  "BotTriggerDistance": 400.0,
  "BotTimerTrigger": 3600.0,
  "MaxRandomNumBots": 2,
  "SpawnChance": 80,
  "MaxSpawnsBeforeCoolDown": 2,
  "IgnoreTimerFirstSpawn": true,
  "MinSpawnDistanceFromPlayer": 80
}

"MapName" - name of the map. be sure you use proper names, i.e. "bigmap" for Customs
"GroupNum" - spawn group. all spawns with the same GroupNum will share one trigger. in other words, if you have 3 spawn points in one group, and one of those trigger, then the other 2 won't.
"Name" - name of spawn. you can name them whatever you want
"Position": { - x,y,z coordinates of spawn position. this is provided by the in-raid spawn point editor
  "x": 89.5103455,
  "y": 4.672584,
  "z": -158.156723
}
"WildSpawnType" - bot type, i.e. pmc, sptusec, assault, etc.
"MinDistance" - min spawn point radius (can be 0)
"MaxDistance" - max spawn point radius - this is the size of the spawn point. when using the spawn editor, enable "real size" markers to see the actual radius of your spawn point
"MaxRandomNumBots" - max number of bots to spawn. this is 1-max inclusive and it's random
"BotTriggerDistance" - distance to player for spawn trigger. once the player is within this distance then the spawn timer will start
"BotTimerTrigger" - spawn timer. if the player is within trigger distance this timer will continue to run
"SpawnChance" - spawn chance %
"MaxSpawnsBeforeCooldown" - once this many bots have spawned the spawn point will enter a cooldown (wait for 180s, default, configurable in F12 menu)
"IgnoreTimerFirstSpawn" - if true, once player is within BotTriggerDistance the spawn will trigger regardless of timer. If false, the timer must run at least once for the first spawn trigger.
"MinSpawnDistanceFromPlayer" - the min distance from player that bots should spawn. this is to hopefully prevent bots spawning too close to you.
```
---
## The Rules of Donuts
```
Rules
1. Bots will only spawn in same level/height as the spawn marker
2. Bots will only spawn in maximum distance (radius) around the spawn marker
3. One random spawn marker will be picked in a group
 - if the timer is passed its eligible to spawn (Unless IgnoreTimerFirstSpawn is true for the point. It will be set to false after a successful spawn)
 - if they are within the BotTimerTrigger distance the point is eligible to spawn.
 - If the SpawnChance is reached, it is eligible to spawn.
 - Validate that the spawn is not in a wall, in the air, in the player's line of site, minimum distance from the player.  It will attempt to find a valid point up to the Bepinex Configured Max Tries specified.
 - One to MaxRandomNumBots from the Spawn Marker info will be generated of type WildSpawnType
4. Timers will be reset if there is a successful spawn or a failure from within a group.
5. If a spawn sucessfully spawns up to their MaxSpawnsBeforeCooldown number, then it is in 'cooldown' until the timer specified in the bepinex config is reached.

Assumptions
- Spawns within a group will be on/around the same bot trigger distance otherwise only the closest spawn will be enabled.
- Each unique or standalone spawn should be given its own group number.
```

---

**ALL CREDIT GOES TO PROPS, THE CREATOR OF SWAG AND DONUTS**

## What is this?

SWAG (Simple AI Wave Generator) is a mod that gives you full control over all bot spawns in your raids.

SWAG 3 now includes DONUTS, which is a powerful spawn editor and dynamic spawning tool created by props.

## What is Donuts?

DONUTS is a client mod that is a full in-game spawn point editor and dynamic spawn system.

Together, SWAG + DONUTS provide complete spawn control and freedom. Bots in D2. Crackhouse. Streets Apartments. Interchange Railway. Anywhere where there is valid navmesh with extended waypoints mod (see the media tab for a sneak peek).

Bots are dynamically spawned around the player with many configurable options - **all PMCs now spawn in their actual live spawn points on all maps**, as well as "hot spots" such as Dorms, Resort, etc.

## How To Install

**IMPORTANT**
The following mods are REQUIRED:

BIGBRAIN by DrakiaXYZ - https://hub.sp-tarkov.com/files/file/1219-bigbrain/#overview
WAYPOINTS by DrakiaXYZ -https://hub.sp-tarkov.com/files/file/1119-waypoints-expanded-bot-patrols-and-navmesh/#overview
SAIN by Solarint - https://hub.sp-tarkov.com/files/file/1062-sain-2-0-solarint-s-ai-modifications-full-ai-combat-system-replacement/#overview
LOOTING BOTS by Skwizzy - https://hub.sp-tarkov.com/files/file/1096-looting-bots/

1. **if you already have SWAG installed** - delete SWAG completely first

2. download the .zip, extract to your SPT folder

3. play the game

## How to Uninstall

1. Delete the SWAG folder from `<YOUR SPT FOLDER>/user/mods/`
2. Delete the Donuts (dvize.Donuts) folder from `<YOUR SPT FOLDER>/BepInEx/plugins/`

---

## Mod Compatibility
Any mod that changes spawns may conflict with SWAG!

IF YOU USE REALISM MOD:
On the Realism 'Bots' tab (from the GUI), be sure you leave the following options DISABLED:

- Spawn Wave Tweaks
- Boss Spawn Tweaks​​​​​​
- OpenZones Fix
- Increased Bot Cap
​- PMC Type Changes (for SAIN compatibility)​

Everything else should be fully compatible.​​

---

## Donuts Spawn Point Editor

See the mod page for details

---

## FAQ
- I'm getting X, Y, Z errors // I can't load into raids // My spawns aren't working // etc...
Try a couple of things first:
- look at your mod list, see if there are any possible conflicts
- do a full re-install of SWAG
- delete the contents of your cache: `<YOUR SPT FOLDER>/user/cache/`

If you're still experiencing issues please leave a comment on this mod page (best option) or find me on the SPT discord.

- I want to modify these, how can I do that?

I've added a short guide to help with this: "how-to-modify-spawns.txt" or use the in-game Donuts spawn point editor.

Please free to reach out to me on the hub or (better) the SPT discord if you have any questions.

- How do I know this mod is actually working?

When you load your server and launcher, look at your server console logs. SWAG should show you each wave it's configuring from these presets - so as long as those match what you have in the preset then you're good to go.

- What happens if I want to enable default waves?

SWAG spawns + vanilla SPT spawns = lots of bots and weirdness. Leave all of them turned off unless you know what you're doing.

- I like Donuts, but I don't like the PMC respawns, how can I turn that off?

Easy - remove all map.json files from your Donuts patterns, located here: `<YOUR_SPT_FOLDER>/BepInEx/plugins/dvize.Donuts/patterns/`

so all of these: `customs.json`, `woods.json`, etc.

or if you don't want to delete any files then adjust SpawnChance values in the Donuts patterns down to 0 (NOT the pmc start patterns).

Keep in mind, however, that all PMCs spawn at their actual live locations - **there is no guarantee that your PMC bots will make their way toward hot spots without dynamic spawns!**


**IF YOU ARE USING DONUTS (SWAG 3.0+) THEN LEAVE THIS DISABLED**
- What is "pmcWaves" and what does it do?

If set to "false" what you should expect to see in you raids:

- PMC spawns spread around the map at the start of every raid
- SCAV spawns shortly after
- SCAV waves throughout the duration of the raid

If set to "true" (default), what you should expect:

- PMC spawns spread around the map at the start of every raid
- SCAV spawns shortly after
- SCAV waves throughout the duration of the raid
- small number of PMC waves throughout the duration of the raid
- PMC spawns at POIs throughout the duration of the raid (Dorms, Resort, etc.)

So, if you're not sure which to choose...

If you want a pure live experience where PMC numbers are finite, set pmcWaves: false

if you:
  - play long raids (1 hr+)
  - enjoy lots of PvP all over the map

then set pmcWaves: true (default)

- What is "scavWaves"?

Same thing as pmcWaves - don't want to see our cheeki breeki bozos anymore? Set this to false.

- what is pmcGroupChance?

`pmcGroupChance` can be one of the following strings:

"none"
"low"
"asonline"
"high"
"max"

where each string represents a certain range of probabilities that the **START-OF-RAID PMCs** will spawn solo or in a group.

"none" - no groups
"low" - mostly solo, rare duos, even more rare trios, no quads, no 5-mans
"asonline" - ~70% solo, ~20% duos, rare trios, rare quads, even more rare 5-mans
"high" - lower chances of solo, mostly duos and trios, some quads, some 5-mans
"max" - no solos, no duos, a mix of trios/quads/5-mans

Please keep in mind that increasing group chance **will spawn more PMCs in your raids at the start** (obviously) so you may want to adjust other settings as well so that things stay somewhat balanced (like bot caps, `pmcChance`, etc...)

- What is pmc/scavSpawnWeight?

These are values that determine a chance to reduce a number of spawns in each wave. So, generally speaking:

If you want more SCAVs and/or PMCs, then you want a higher number.
If you want fewer, go low.

- How does SnipeChance and BossChance work?

These are both flat percentages for sniper SCAVs or bosses to spawn in your raids. Default is 50% and 20%, respectively.

**IF YOU ARE USING DONUTS (SWAG 3.0+) LEAVE THIS SET TO 0**
- pmcChance?

Same as above, except this setting affects only START-OF-RAID PMCs. Default is 60.

- What is ScavInLabs?

By default my spawns prevent SCAVs from spawning in Labs - however, if you'd still like to see those dummies at the Lab just set this to "true" and the usual SCAV waves should show up throughout the raid.

- Can I change the max map bot cap?

Yes - feel free to tune any of these to your liking - the default caps are just my personal preference:
```json
	"MaxBotCap": {
		"factory": 6,
		"customs": 12,
		"woods": 12,
		"shoreline": 12,
		"lighthouse": 15,
		"reserve": 12,
		"interchange": 12,
		"laboratory": 8,
		"streets": 12
	},
```

You can also set separate caps for night raids:
```json
  "NightMaxBotCap": {
		"factory_night": 6,
		"customs": 12,
		"woods": 12,
		"shoreline": 12,
		"lighthouse": 15,
		"reserve": 12,
		"interchange": 12,
		"laboratory": 8,
		"streets": 12
  },
```

You can also adjust the Donuts max bot caps from the BepInEx F12 menu in-game.

- This is too much action/too many bots & My raids are hella dead!

**IF YOU ARE USING SWAG 3.0+ WITH DONUTS**

Use the spawn point editor and/or modify the included Donuts patterns to tweak options such as spawn chance, timers, trigger distance and more.

Fewer bots? Decrease spawn chances in Donuts spawn patterns (you can make it 0 if you want), increase timers, etc.

More bots? with SWAG: re-enable SWAG PMCs for more PMCs (`pmcChance`), increase weight values, enable `pmcWaves`, etc., or increase your Donuts spawn chances, shorter timers, etc.

- I like long raids (60 min+), will these presets work for me?

Yes - all spawns are on timers that continue to run throughout the length of your raids regardless of raid time.

### REMINDER - THIS IS A WORK IN PROGRESS - I'm always open for improvements, please give me feedback in the comments or find me in the SPT Discord!
