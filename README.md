# Nooky's SWAG Custom Presets
![Version: 1.2.0](https://img.shields.io/badge/Version-1.2.0-informational?style=flat-square)

**SWAG 1.4.2 by props IS REQUIRED!**

https://hub.sp-tarkov.com/files/file/878-simple-wave-ai-generator-swag/#overview

**THIS IS A WORK IN PROGRESS**

## What is this?

This is an extension of SWAG by props which adds spawns to your raids in "waves". What I've done is create my own custom SWAG presets that try to achieve the following:

- **out-of-the-box "live" SWAG** - do you like SWAG but don't feel like messing with config files? just copy and paste these and play, no other action needed!

- **no more dead raids** - my presets have bots spawning in ALL zones of the map consistently throughout your raid. Think you're safe heading to your Trailer Park extract with 5 mins left? Think again.

- **a balance of PMC and SCAVs** - raids start with more PMCs then balance out throughout the duration

- **Rogues and Raiders** - Labs should be a challenge, so I filled it with groups of Raiders. Rogues spawn in Lighthouse consistently.

- **"live-like" bosses** - all bosses should spawn in their "live" location on each map at the very beginning of your raids, no more boss randomness!

- **more action in POIs** - forget "clearing" Dorms, Resort, etc. Once you think you're safe you may hear PMCs around the corner...

- **...and more** - now with the current version of SWAG, the possibilities are endless.

## What's Included?

In the .zip you'll see SWAG files:

```
config.json
patterns/
```

`config.json` is my own personal SWAG config that is tuned for these patterns.

My personal config is for those that want an "out-of-the-box" experience without having to change anything, however it is not required - YOU CAN USE YOUR OWN SWAG CONFIG!

These are my patterns for each map. You can pick and choose what maps you want to use, or just copy and paste them all!
```
patterns/
```

## How to Install

**Be sure you have SWAG 1.4.2 installed!**
- download the .zip from the above link
- copy all files from `nookys-swag-presets/`
- paste them into your SWAG mod folder: `user/mods/SWAG/config` and overwrite
- play the game!

## How to Uninstall

Copy, paste and overrwrite my files with the SWAG defaults, that's it!

---
## FAQ  
- **How do I know this mod is actually working?**

When you load your server and launcher, look at your server console logs. SWAG should show you each wave it's configuring from these presets - so as long as those match what you have in the preset then you're good to go.

- **This is a bit chaotic, I'm getting killed everywhere! How can I turn down the amount of spawns?**

These presets are tuned so that your raids are (hopefully) never dead. So yes, spawns are frequent, you will find yourself in fights **often**. If that's not your thing, there are a couple of things you can adjust to your liking in your `config.json`:

Lower the `aiAmount` to `low`
```json
	"aiAmount": "low"
```

or increase the time between waves -  
for example, my default config is 45 seconds between waves, however, this can be changed so that there is a longer period between waves and can be stretched out over longer periods of time. See below.

- **Well, I love chaos, how do I turn these up to 11?**

Easy...
```json
	"aiAmount": "high"
```
or
```json
	"aiAmount": "horde"
```
gl hf.

- **I like long raids (60 min+), will these presets work for me?**

Yes! Thanks to SWAG number of waves and intervals between them are entirely configurable.
```json
	"WaveTimerMinSec": 70,
	"WaveTimerMaxSec": 115
```

for more spread out waves and/or longer raids. Or you could just simply add more waves:
```json
	"RandomWaveCount": 20,
```

REMINDER - THIS IS A WORK IN PROGRESS - I'm always open for improvements, please give me feedback in the comments or find me in the SPT Discord!

## Recommended Mods

[SWAG](https://hub.sp-tarkov.com/files/file/878-simple-wave-ai-generator-swag/) (of course)
[AI Limit](https://hub.sp-tarkov.com/files/file/793-ai-limit/) - if you're experiencing bad performance from lots of spawns, try using this
[No No Zone](https://hub.sp-tarkov.com/files/file/1045-no-no-zone/) - similarly, if you're a psycho that likes to play with 'Horde' mode then use this so that bots don't spawn on top of you
