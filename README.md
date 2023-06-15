# Nooky's SWAG Custom Presets
![Version: 1.3.0](https://img.shields.io/badge/Version-1.3.0-informational?style=flat-square)

**All credit goes to SWAG by Props**

https://hub.sp-tarkov.com/files/file/878-simple-wave-ai-generator-swag/#overview

**THIS IS A WORK IN PROGRESS**

---

## Config Reference

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

## What is this?

This is an extension of SWAG by props which adds spawns to your raids in "waves". What I've done is create my own custom SWAG presets that try to achieve the following:


- out-of-the-box "live" SWAG - do you like SWAG but don't feel like messing with config files? just copy and paste these and play, no other action needed!
- no more dead raids - my presets have bots spawning in ALL zones of the map consistently throughout your raid. Think you're safe heading to your Trailer Park extract with 5 mins left? Think again.
- a balance of PMC and SCAVs - raids start with more PMCs then balance out throughout the duration
- Rogues and Raiders - Labs should be a challenge, so I filled it with groups of Raiders. Rogues spawn in Lighthouse consistently.
- "live-like" bosses - all bosses should spawn in their "live" location on each map at the very beginning of your raids, no more boss randomness!
- more action in POIs - forget "clearing" Dorms, Resort, etc. Once you think you're safe you may hear PMCs around the corner...
- ...and more - now with the current version of SWAG, the possibilities are endless. 

## How To Install

1. if you already have SWAG installed, delete your "patterns" folder first: `SWAG/config/patterns`

2. download the .zip, extract/copy/paste and overwrite into SPT MODS FOLDER ---> `<YOUR SPT FOLDER>/user/mods/`

3. play the game

## How to Uninstall

If you want to revert to base SWAG - delete the patterns folder and re-install base SWAG
If you want to uninstall SWAG completely - just delete the SWAG folder.

---

## Mod Compatibility
The rule of thumb is: if it's compatible with SWAG, then it's compatible with this mod.

There are some exceptions:

Realism
If using options in the "Bots" tab, be sure you only have "Bot Changes" checked and nothing else, otherwise you have experience mod conflicts. You also must be sure SWAG loads AFTER Realism (it should by default unless you rename your mod folders)

SVM
Similar to Realism, if using any "Bots" options be sure SWAG loads AFTER SVM.

## FAQ
- I'm getting X, Y, Z errors // I can't load into raids // My spawns aren't working // etc...
Try a couple of things first:
- look at your mod list, see if there are any possible conflicts
- do a full re-install of SWAG
- delete the contents of your cache: `<YOUR SPT FOLDER>/user/cache/`

If you're still experiencing issues please leave a comment on this mod page (best option) or find me on the SPT discord.

- I want to modify these, how can I do that?

I've added a short guide to help with this: "how-to-modify-spawns.txt"

Please free to reach out to me on the hub or (better) the SPT discord if you have any questions.

- How do I know this mod is actually working?

When you load your server and launcher, look at your server console logs. SWAG should show you each wave it's configuring from these presets - so as long as those match what you have in the preset then you're good to go.

- What happens if I want to enable default waves?

Regardless of "pmcWaves" setting you should see normal vanilla SPT waves of a mix of PMC/SCAVs in addition to my preset spawns.

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

Defaults:

`pmcSpawnWeight: 20`

`scavSpawnWeight: 80`

- How does SnipeChance and BossChance work?

These are both flat percentages for sniper SCAVs or bosses to spawn in your raids. Default is 50% and 20%, respectively.

- pmcChance?

Same as above, except this setting affects only START-OF-RAID PMCs. Default is 60.

- What is ScavInLabs?

By default my spawns prevent SCAVs from spawning in Labs - however, if you'd still like to see those dummies at the Lab just set this to "true" and the usual SCAV waves should show up throughout the raid.

- Can I change the max map bot cap?

Yes - feel free to tune any of these to your liking - my default caps are just my personal preference:
```json
	"MaxBotCap": {
		"factory": 14,
		"customs": 25,
		"woods": 27,
		"shoreline": 28,
		"lighthouse": 30,
		"reserve": 24,
		"interchange": 24,
		"laboratory": 14,
		"tarkovstreets": 25
	},
```

You can also set separate caps for night raids:
```json
  "NightMaxBotCap": {
		"factory_night": 14,
		"customs": 25,
		"woods": 27,
		"shoreline": 28,
		"lighthouse": 30,
		"reserve": 24,
		"interchange": 24,
		"laboratory": 14,
		"tarkovstreets": 25
  },
```

- This is a bit chaotic, I'm getting killed everywhere! How can I turn down the amount of spawns?

These presets are tuned so that your raids are (hopefully) never dead. So yes, spawns are frequent, you will find yourself in fights OFTEN. If that's not your thing, there are a couple of things you can adjust to your liking in your config.json:

Lower the AI amount...

```
"aiAmount": "low"
```

or increase the time between waves -
for example, my default config is 45 seconds between waves, however, this can be changed so that there is a longer period between waves and can be stretched out over longer periods of time. See below.

- Well, I love chaos, how do I turn these up to 11?

Easy, change this...

```
"aiAmount": "asonline"
```
to "high" or "horde", gl hf.


- I like long raids (60 min+), will these presets work for me?

Yes! Thanks to SWAG number of waves and intervals between them are entirely configurable.
```
"WaveTimerMinSec": 45,
"WaveTimerMaxSec": 90
```
for more spread out waves and/or longer raids. Or you could just simply add more waves:
```
"RandomWaveCount": 20
```

I **STRONGLY RECOMMEND** setting "pmcWaves" to true if your raids are longer than 60 minutes.

### REMINDER - THIS IS A WORK IN PROGRESS - I'm always open for improvements, please give me feedback in the comments or find me in the SPT Discord!
