# Nooky's SWAG Custom Presets
![Version: 1.1.11](https://img.shields.io/badge/Version-1.1.11-informational?style=flat-square)

**SWAG 1.4.3+ by props IS REQUIRED!**

https://hub.sp-tarkov.com/files/file/878-simple-wave-ai-generator-swag/#overview

**THIS IS A WORK IN PROGRESS**

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

Be sure you have SWAG 1.4.3+ installed first!

1. delete your "patterns" folder: `SWAG/config/patterns`

2. download the .zip, extract/copy/paste and overwrite into your SWAG folder: `user/mods/SWAG/`

3. play the game

## How to Uninstall

Copy, paste and overrwrite my files with the SWAG defaults, that's it!

---

## FAQ
- I want to modify these, how can I do that?

I've added a short guide to help with this: "how-to-modify-spawns.txt"

Please free to reach out to me on the hub or (better) the SPT discord if you have any questions.

- How do I know this mod is actually working?

When you load your server and launcher, look at your server console logs. SWAG should show you each wave it's configuring from these presets - so as long as those match what you have in the preset then you're good to go.

- What happens if I want to enable default waves?

Regardless of "pmcWave" setting you should see normal vanilla SPT waves of a mix of PMC/SCAVs in addition to my preset spawns.

- What is "pmcWave" and what does it do?

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

- What is pmc/scavSpawnWeight?

These are values that determine a chance to reduce a number of spawns in each wave. So, generally speaking:

If you want more SCAVs and/or PMCs, then you want a higher number.
If you want fewer, go low.

Defaults:

`pmcSpawnWeight: 25`

`scavSpawnWeight: 70`

- How does SnipeChance and BossChance work?

These are both flat percentages for sniper SCAVs or bosses to spawn in your raids. Default is 50% and 20%, respectively.

- What is ScavInLabs?

By default my spawns prevent SCAVs from spawning in Labs - however, if you'd still like to see those dummies at the Lab just set this to "true" and the usual SCAV waves should show up throughout the raid.

- Can I change the max map bot cap?

Yes - feel free to tune any of these to your liking - my default caps are just my personal preference:
```json
	"MaxBotCap": {
		"factory": 14,
        "customs": 24,
        "woods": 26,
        "shoreline": 26,
        "lighthouse": 30,
        "reserve": 24,
        "interchange": 24,
        "laboratory": 20,
        "tarkovstreets": 24
	}
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
