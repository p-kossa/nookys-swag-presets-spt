import { DependencyContainer } from "tsyringe";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { StaticRouterModService } from "@spt-aki/services/mod/staticRouter/StaticRouterModService";
import { RandomUtil } from "@spt-aki/utils/RandomUtil";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import {
BossLocationSpawn,
ILocationBase,
Wave,
} from "@spt-aki/models/eft/common/ILocationBase";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { IBotConfig } from "@spt-aki/models/spt/config/IBotConfig";
import { ILocations } from "@spt-aki/models/spt/server/ILocations";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import * as ClassDef from "./ClassDef";

import config from "../config/config.json";

const modName = "SWAG";
let logger: ILogger;
let jsonUtil: JsonUtil;
let configServer: ConfigServer;
let botConfig: IBotConfig;
let databaseServer: DatabaseServer;
let locations: ILocations;
let randomUtil: RandomUtil;
let BossWaveSpawnedOnceAlready: boolean;

const customPatterns: Record<string, ClassDef.GroupPattern> = {};

type LocationName = keyof Omit<ILocations, "base">;
type LocationBackupData = Record<LocationName,  { waves: Wave[], BossLocationSpawn: BossLocationSpawn[], openZones: string[] } | undefined>;

class SWAG implements IPreAkiLoadMod, IPostDBLoadMod {
  public static roleCase: object = {
    assault: "assault",
    exusec: "exUsec",
    marksman: "marksman",
    pmcbot: "pmcBot",
    sectantpriest: "sectantPriest",
    sectantwarrior: "sectantWarrior",
    assaultgroup: "assaultGroup",
    bossbully: "bossBully",
    bosstagilla: "bossTagilla",
    bossgluhar: "bossGluhar",
    bosskilla: "bossKilla",
    bosskojaniy: "bossKojaniy",
    bosssanitar: "bossSanitar",
    followerbully: "followerBully",
    followergluharassault: "followerGluharAssault",
    followergluharscout: "followerGluharScout",
    followergluharsecurity: "followerGluharSecurity",
    followergluharsnipe: "followerGluharSnipe",
    followerkojaniy: "followerKojaniy",
    followersanitar: "followerSanitar",
    followertagilla: "followerTagilla",
    cursedassault: "cursedAssault",
    pmc: "pmc",
    usec: "usec",
    bear: "bear",
    sptbear: "sptBear",
    sptusec: "sptUsec",
    bosstest: "bossTest",
    followertest: "followerTest",
    gifter: "gifter",
    bossknight: "bossKnight",
    followerbigpipe: "followerBigPipe",
    followerbirdeye: "followerBirdEye",
    bosszryachiy: "bossZryachiy",
    followerzryachiy: "followerZryachiy",
  };

  public static pmcType: string[] = ["sptbear", "sptusec"];

  public static validMaps: string[] = [
    "bigmap",
    "factory4_day",
    "factory4_night",
    "interchange",
    "laboratory",
    "lighthouse",
    "rezervbase",
    "shoreline",
    "tarkovstreets",
    "woods",
  ];

  public static diffProper = {
    easy: "easy",
    asonline: "normal",
    normal: "normal",
    hard: "hard",
    impossible: "impossible",
    random: "random",
  };

  public static aiAmountProper = {
    low: 0.5,
    asonline: 1,
    medium: 1,
    high: 2,
    horde: 4,
  };

  public static savedLocationData: LocationBackupData = {
    factory4_day: undefined,
    factory4_night: undefined,
    bigmap: undefined,
    interchange: undefined,
    laboratory: undefined,
    lighthouse: undefined,
    rezervbase: undefined,
    shoreline: undefined,
    tarkovstreets: undefined,
    woods: undefined,

    // unused
    develop: undefined,
    hideout: undefined,
    privatearea: undefined,
    suburbs: undefined,
    terminal: undefined,
    town: undefined,
  };

  public static actual_bot_type = {
    name: ""
  }

  public static randomWaveTimer = {
    time_min: 0,
    time_max: 0
  };

  public static actual_timers = {
    time_min: 0,
    time_max: 0
  }

  public static pmcWaveTimer = {
    customs: {
      time_min: 0,
      time_max: 0
    },
    woods: {
      time_min: 0,
      time_max: 0
    },
    factory4_day: {
      time_min: 0,
      time_max: 0
    },
    tarkovstreets: {
      time_min: 0,
      time_max: 0
    },
    lighthouse: {
      time_min: 0,
      time_max: 0
    },
    factory4_night: {
      time_min: 0,
      time_max: 0
    },
    interchange: {
      time_min: 0,
      time_max: 0
    },
    shoreline: {
      time_min: 0,
      time_max: 0
    },
    rezervbase: {
      time_min: 0,
      time_max: 0
    }
  }

  public static scavWaveTimer = {
    customs: {
      time_min: 0,
      time_max: 0
    },
    woods: {
      time_min: 0,
      time_max: 0
    },
    factory4_day: {
      time_min: 0,
      time_max: 0
    },
    tarkovstreets: {
      time_min: 0,
      time_max: 0
    },
    lighthouse: {
      time_min: 0,
      time_max: 0
    },
    factory4_night: {
      time_min: 0,
      time_max: 0
    },
    interchange: {
      time_min: 0,
      time_max: 0
    },
    shoreline: {
      time_min: 0,
      time_max: 0
    },
    rezervbase: {
      time_min: 0,
      time_max: 0
    }
  }

  public static raiderWaveTimer = {
    customs: {
      time_min: 0,
      time_max: 0
    },
    woods: {
      time_min: 0,
      time_max: 0
    },
    factory4_day: {
      time_min: 0,
      time_max: 0
    },
    tarkovstreets: {
      time_min: 0,
      time_max: 0
    },
    lighthouse: {
      time_min: 0,
      time_max: 0
    },
    factory4_night: {
      time_min: 0,
      time_max: 0
    },
    interchange: {
      time_min: 0,
      time_max: 0
    },
    shoreline: {
      time_min: 0,
      time_max: 0
    },
    rezervbase: {
      time_min: 0,
      time_max: 0
    }
  }

  public static cultistWaveTimer = {
    customs: {
      time_min: 0,
      time_max: 0
    },
    woods: {
      time_min: 0,
      time_max: 0
    },
    factory4_day: {
      time_min: 0,
      time_max: 0
    },
    tarkovstreets: {
      time_min: 0,
      time_max: 0
    },
    lighthouse: {
      time_min: 0,
      time_max: 0
    },
    factory4_night: {
      time_min: 0,
      time_max: 0
    },
    interchange: {
      time_min: 0,
      time_max: 0
    },
    shoreline: {
      time_min: 0,
      time_max: 0
    },
    rezervbase: {
      time_min: 0,
      time_max: 0
    }
  }

  public static zoneCounter = {
    zones: 0,
    count: 0
  }

  public static waveCounter = {
    count: 1
  }

  preAkiLoad(container: DependencyContainer): void {
    const staticRouterModService = container.resolve<StaticRouterModService>(
      "StaticRouterModService"
    );

    staticRouterModService.registerStaticRouter(
      `${modName}/client/match/offline/end`,
      [
        {
          url: "/client/match/offline/end",
          action: (
            url: string,
            info: any,
            sessionID: string,
            output: string
          ): any => {
            SWAG.ClearDefaultSpawns();
            SWAG.ConfigureMaps();
            return output;
          },
        },
      ],
      "aki"
    );

    staticRouterModService.registerStaticRouter(`${modName}/client/locations`,
    [
      {
        url: "/client/locations",
        action: (url: string, info: any, sessionID: string, output: string): any => {
          SWAG.ClearDefaultSpawns();
          SWAG.ConfigureMaps();
          return output;
        }
      }], "aki");
  }

  postDBLoad(container: DependencyContainer): void {
    logger = container.resolve<ILogger>("WinstonLogger");
    jsonUtil = container.resolve<JsonUtil>("JsonUtil");
    configServer = container.resolve<ConfigServer>("ConfigServer");
    botConfig = configServer.getConfig<IBotConfig>(ConfigTypes.BOT);
    databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
    locations = databaseServer.getTables().locations;
    randomUtil = container.resolve<RandomUtil>("RandomUtil");

    const aki_bots = configServer.getConfig("aki-bot")

    SWAG.SetConfigCaps(aki_bots);
    SWAG.ReadAllPatterns();
  }

  static SetConfigCaps(aki_bots): void {
    //Set Max Bot Caps.. these names changed
    botConfig.maxBotCap["factory4_day"] = config.MaxBotCap["factory"];
    botConfig.maxBotCap["factory4_night"] = config.MaxBotCap["factory"];
    botConfig.maxBotCap["bigmap"] = config.MaxBotCap["customs"];
    botConfig.maxBotCap["interchange"] = config.MaxBotCap["interchange"];
    botConfig.maxBotCap["shoreline"] = config.MaxBotCap["shoreline"];
    botConfig.maxBotCap["woods"] = config.MaxBotCap["woods"];
    botConfig.maxBotCap["rezervbase"] = config.MaxBotCap["reserve"];
    botConfig.maxBotCap["laboratory"] = config.MaxBotCap["laboratory"];
    botConfig.maxBotCap["lighthouse"] = config.MaxBotCap["lighthouse"];
    botConfig.maxBotCap["tarkovstreets"] = config.MaxBotCap["tarkovstreets"];

    //Set Max Bots Per Zone Per Map
    for (let map in locations) {
      locations[map].MaxBotPerZone = config.MaxBotPerZone;
    }

    // PMCs should never convert - we need full control here
    aki_bots.pmc.convertIntoPmcChance.assault.min = 0
    aki_bots.pmc.convertIntoPmcChance.assault.max = 0

    aki_bots.pmc.convertIntoPmcChance.cursedassault.min = 0
    aki_bots.pmc.convertIntoPmcChance.cursedassault.max = 0

    aki_bots.pmc.convertIntoPmcChance.pmcbot.min = 0
    aki_bots.pmc.convertIntoPmcChance.pmcbot.max = 0

    aki_bots.pmc.convertIntoPmcChance.exusec.min = 0
    aki_bots.pmc.convertIntoPmcChance.exusec.max = 0

    logger.info("SWAG: PMC conversion is turned OFF (this might conflict with SVM depending on your load order)")
    logger.info("SWAG: Config/Bot Caps Set");
  }

  /**
   * Returns all available OpenZones specified in location.base.OpenZones as well as any OpenZone found in the SpawnPointParams.
   * Filters out all sniper zones
   * @param map
   * @returns
   */
  static GetOpenZones(map: LocationName): string[] {
    const baseobj: ILocationBase = locations[map]?.base;

    // Get all OpenZones defined in the base obj that do not include sniper zones. Need to filter for empty strings as well.
    const foundOpenZones = baseobj?.OpenZones?.split(",")
      .filter((name) => !name.includes("Snipe"))
      .filter((name) => name.trim() !== "") ?? [];

    // Sometimes there are zones in the SpawnPointParams that arent listed in the OpenZones, parse these and add them to the list of zones
    baseobj?.SpawnPointParams?.forEach((spawn) => {
      //check spawn for open zones and if it doesn't exist add to end of array
      if (spawn?.BotZoneName && !foundOpenZones.includes(spawn.BotZoneName) && !spawn.BotZoneName.includes("Snipe")) {
        foundOpenZones.push(spawn.BotZoneName);
      }
    });

    //logger.info(`SWAG: Open Zones(${map}): ${JSON.stringify(foundOpenZones)}`);
    return foundOpenZones;

  }

  static ReadAllPatterns(): void {
    //find dirpath and get one level up
    let dirpath = __dirname;
    dirpath = dirpath.split("\\").slice(0, -1).join("\\");

    //Read all patterns from files in /patterns
    const fs = require("fs");
    if (!fs.existsSync(`${dirpath}/config/patterns/`)) {
      console.log("SWAG: Pattern Directory not found");
      return;
    }
    const files = fs.readdirSync(`${dirpath}/config/patterns/`);
    for (let file of files) {
      const temppattern = require(`${dirpath}/config/patterns/${file}`);
      const tempname = file.split(".")[0];
      //parse the json and push it to the customPatterns array

      customPatterns[tempname] = temppattern;

      logger.info("SWAG: Loaded Pattern: " + tempname);
    }
  }

  //This is the main top level function
  static ConfigureMaps(): void {

    // read all customPatterns and push them to the locations table. Invalid maps were being read, those should be filteredout as it causes an error when
    // assigning an openzone to a map that doesn't exist (base)
    Object.keys(locations).filter(
      (name) => this.validMaps.includes(name)
    ).forEach((globalmap: LocationName) => {
      for (let pattern in customPatterns) {
        //read mapWrapper in pattern and set its values to be used locally
        const mapWrapper: ClassDef.MapWrapper = customPatterns[pattern][0];
        const mapName: string = mapWrapper.MapName.toLowerCase();
        const mapGroups: ClassDef.GroupPattern[] = mapWrapper.MapGroups;
        const mapBosses: ClassDef.BossPattern[] = mapWrapper.MapBosses;

        //reset the bossWaveSpawnedOnceAlready flag
        BossWaveSpawnedOnceAlready = false;

        //if mapName is not the same as the globalmap, skip. otherwise if all or matches, continue
        if (mapName === globalmap || mapName === "all") {
          config.DebugOutput && logger.warning(`Configuring ${globalmap}`);

          // Configure random wave timer.. needs to be reset each map
          SWAG.randomWaveTimer.time_min = config.WaveTimerMinSec;
          SWAG.randomWaveTimer.time_max = config.WaveTimerMaxSec;

          SWAG.SetUpGroups(mapGroups, mapBosses, globalmap);
        }

        //config.DebugOutput && logger.warning(`Waves for ${globalmap} : ${JSON.stringify(locations[globalmap].base?.waves)}`);
      }
    });
  }

  /**
   * Groups can be marked random with the RandomTimeSpawn. groups that dont have a time_max or time_min will also be considered random
   * @param group
   * @returns
   */
  static isGroupRandom(group: ClassDef.GroupPattern) {
    const isRandomMin = group.Time_min === null || group.Time_min === undefined;
    const isRandomMax = group.Time_max === null || group.Time_max === undefined;

    return group.RandomTimeSpawn || isRandomMax || isRandomMin
  }

  static SetUpGroups(
    mapGroups: ClassDef.GroupPattern[],
    mapBosses: ClassDef.BossPattern[],
    globalmap: LocationName
  ): void {
    //set up local variables to contain outside of loop
    const RandomGroups: ClassDef.GroupPattern[] = [];
    const RandomBossGroups: ClassDef.BossPattern[] = [];
    const StaticGroups: ClassDef.GroupPattern[] = [];
    const StaticBossGroups: ClassDef.BossPattern[] = [];
    const AlreadySpawnedGroups: ClassDef.GroupPattern[] = [];
    const AlreadySpawnedBossGroups: ClassDef.BossPattern[] = [];

    //read mapGroups and see if value Random, OnlySpawnOnce, or BotZone is set and set local values
    for (let group of mapGroups) {
      const groupRandom = SWAG.isGroupRandom(group);

      //if groupRandom is true, push group to RandomGroups, otherwise push to StaticGroups
      if (groupRandom) {
        RandomGroups.push(group);
      } else {
        StaticGroups.push(group);
      }
    }

    //read BossGroups and see if value Random, OnlySpawnOnce, or BotZone is set and set local values
    for (let boss of mapBosses) {
      const groupRandom: boolean = boss.RandomTimeSpawn;

      //if groupRandom is true, push group to RandomGroups, otherwise push to StaticGroups
      if (groupRandom) {
        RandomBossGroups.push(boss);
      } else {
        StaticBossGroups.push(boss);
      }

    }

    //if RandomGroups is not empty, set up bot spawning for random groups
    if (RandomGroups.length > 0) {
      //call SetUpRandomBots amount of times specified in config.RandomWaveCount
      for (let i = 0; i < config.RandomWaveCount; i++) {
        SWAG.SetUpRandomBots(RandomGroups, globalmap, AlreadySpawnedGroups);
      }
    }

    //if StaticGroups is not empty, set up bot spawning for static groups
    if (StaticGroups.length > 0) {
      for (let i = 0; i < config.RandomWaveCount; i++) {
        SWAG.SetUpStaticBots(StaticGroups, globalmap, AlreadySpawnedGroups);
      }
      SWAG.actual_timers.time_min = 0
      SWAG.actual_timers.time_max = 0
      SWAG.waveCounter.count = 1
    }

    //if RandomBossGroups is not empty, set up bot spawning for random boss groups
    if (RandomBossGroups.length > 0) {
      //call SetUpRandomBots amount of times specified in config.RandomWaveCount
      for (let i = 0; i < config.BossWaveCount; i++) {
        SWAG.SetUpRandomBosses(
          RandomBossGroups,
          globalmap,
          AlreadySpawnedBossGroups
        );
      }
    }

    //if StaticBossGroups is not empty, set up bot spawning for static boss groups
    if (StaticBossGroups.length > 0) {
      SWAG.SetUpStaticBosses(
        StaticBossGroups,
        globalmap,
        AlreadySpawnedBossGroups
      );
    }
  }

  static SetUpRandomBots(
    RandomGroups: ClassDef.GroupPattern[],
    globalmap: LocationName,
    AlreadySpawnedGroups: ClassDef.GroupPattern[]
  ): void {
    //read a random group from RandomGroups
    const randomGroup = randomUtil.getArrayValue(RandomGroups);

    SWAG.SpawnBots(
      randomGroup,
      globalmap,
      AlreadySpawnedGroups
    );
  }

  static SetUpRandomBosses(
    RandomBossGroups: ClassDef.BossPattern[],
    globalmap: LocationName,
    AlreadySpawnedBossGroups: ClassDef.BossPattern[]
  ): void {
    //read a random group from RandomBossGroups
    const randomBossGroup = randomUtil.getArrayValue(RandomBossGroups);

    SWAG.SpawnBosses(
      randomBossGroup,
      globalmap,
      AlreadySpawnedBossGroups
    );
  }

  static SetUpStaticBots(
    StaticGroups: ClassDef.GroupPattern[],
    globalmap: LocationName,
    AlreadySpawnedGroups: ClassDef.GroupPattern[]
  ): void {
    //read StaticGroups and set local values
    for (let group of StaticGroups) {
      SWAG.SpawnBots(
        group,
        globalmap,
        AlreadySpawnedGroups
      );
    }
  }

  static SetUpStaticBosses(
    StaticBossGroups: ClassDef.BossPattern[],
    globalmap: LocationName,
    AlreadySpawnedBossGroups: ClassDef.BossPattern[]
  ): void {
    //read StaticBossGroups and set local values
    for (let boss of StaticBossGroups) {
      SWAG.SpawnBosses(
        boss,
        globalmap,
        AlreadySpawnedBossGroups
      );
    }
  }

  static SpawnBosses(
    boss: ClassDef.BossPattern,
    globalmap: LocationName,
    AlreadySpawnedBossGroups: ClassDef.BossPattern[]
  ): void {

    //check to see if RandomBossGroupSpawnOnce is true, if so, check to see if group is already spawned
    if (boss.OnlySpawnOnce && AlreadySpawnedBossGroups.includes(boss)) {
      return;
    }

    AlreadySpawnedBossGroups.push(boss);

    //check make sure BossWaveSpawnedOnceAlready = true and config.SkipOtherBossWavesIfBossWaveSelected = true
    if (BossWaveSpawnedOnceAlready && config.SkipOtherBossWavesIfBossWaveSelected) {
      config.DebugOutput && logger.info("SWAG: Skipping boss spawn as one spawned already")
      return;
    }

    //read group and create wave from individual boss but same timing and location if RandomBossGroupBotZone is not null
    let wave: BossLocationSpawn = SWAG.ConfigureBossWave(
      boss,
      globalmap
    );

    locations[globalmap].base.BossLocationSpawn.push(wave);
  }

  static SpawnBots(
    group: ClassDef.GroupPattern,
    globalmap: LocationName,
    AlreadySpawnedGroups: ClassDef.GroupPattern[]
  ): void {
    //check to see if OnlySpawnOnce is true, if so, check to see if group is already spawned
    if (group.OnlySpawnOnce && AlreadySpawnedGroups.includes(group)) {
      return;
    }

    AlreadySpawnedGroups.push(group);

    //read group and create wave from individual bots but same timing and location if StaticGroupBotZone is not null
    for (let bot of group.Bots) {
      const wave: Wave = SWAG.ConfigureBotWave(
        group,
        bot,
        globalmap
      );

      locations[globalmap].base.waves.push(wave);
      SWAG.actual_bot_type.name = SWAG.roleCase[bot.BotType.toLowerCase()]
    }

    if (SWAG.waveCounter.count == 0 && SWAG.zoneCounter.count == 0) {
      SWAG.setSpawnTimer(globalmap, SWAG.actual_bot_type.name)
    }

    // now that we've iterated through a wave we need to increment timers for the next wave
    SWAG.actual_bot_type.name = ""
  }

  static ConfigureBotWave(
    group: ClassDef.GroupPattern,
    bot: ClassDef.Bot,
    globalmap: LocationName
  ): Wave {
    const isRandom = SWAG.isGroupRandom(group);

    let slots = 1
    let player = false
    let botType = SWAG.roleCase[bot.BotType.toLowerCase()]
    let botCount = bot.MaxBotCount

    // if this is true then we'll assume this is the 1st wave, so timers should be set to whatever they're defined to in the config
    // We also need to set the starting intervals for each map timer
    if (group.OnlySpawnOnce === false && group.RandomTimeSpawn === false) {
      if (SWAG.waveCounter.count == 1) {
        SWAG.actual_timers.time_min = group.Time_min
        SWAG.actual_timers.time_max = group.Time_max
        SWAG.setDefaultTimers(globalmap, botType)
      }
    } else {
      SWAG.actual_timers.time_min = group.Time_min
      SWAG.actual_timers.time_max = group.Time_max
    }

    let pmcs = ["sptUsec", "sptBear"]
    let pmc_random_weight = SWAG.getRandIntInclusive(1, 100)
    let scav_random_weight = SWAG.getRandIntInclusive(1, 100)

    if (botType === "pmc" || botType === "sptUsec" || botType === "sptBear" ) {
      player = true

      // pmcWaves is false then we need to skip this PMC wave
      if (config.pmcWaves === false) {

        // if it's Factory then we need the Factory PMC waves, but not the "all" waves, so we need to make sure botCount > 2
        if (globalmap === "factory4_day" || globalmap === "factory4_night" && botCount > 2) {
          slots = 1
        }
        else {
          slots = 0
          botCount = 0
        }
      }
      // if pmcWaves is true, let's roll for a PMC to be 0-1 inclusive
      // hopefully this will help ease the PMC spam mid-raid
      // also need to check < 4, so that we don't fuck with the Factory starting spawns
      else if (pmc_random_weight >= config.pmcSpawnWeight && botCount < 4) {
        slots = 0
        botCount = 1
      }
    }

    else if (botType === "assault") {
      if (scav_random_weight >= config.scavSpawnWeight) {
        slots = 0
        botCount = 1
      }
      // If this is Labs, then don't allow SCAVs to spawn
      if (globalmap === "laboratory" && config.ScavInLabs === false) {
        slots = 0
        botCount = 0
      }
    }

    // if botCount is 0, slots should always be 0
    if (botCount === 0) {
      slots = 0
    }

    // this is the "magic", sort of
    let spawn_zone = group.BotZone
    if (group.OnlySpawnOnce === false && group.RandomTimeSpawn === false) {
      SWAG.zoneCounter.zones = group.BotZone.length

      // This is the last zone, so we need to correct the index for later
      if (SWAG.zoneCounter.count == SWAG.zoneCounter.zones) {
        spawn_zone = group.BotZone[SWAG.zoneCounter.count - 1]
      }
      else {
        spawn_zone = group.BotZone[SWAG.zoneCounter.count]
      }
    }

    // check if requested botType is a PMC
    if (botType === "pmc") {
      // let's roll a random PMC type
      botType = pmcs[Math.floor(Math.random() * pmcs.length)]
    }

    const wave: Wave = {
      number: null,
      WildSpawnType: botType,
      time_min: isRandom ? SWAG.randomWaveTimer.time_min : SWAG.actual_timers.time_min,
      time_max: isRandom ? SWAG.randomWaveTimer.time_max : SWAG.actual_timers.time_max,
      slots_min: slots,
      slots_max: Math.floor(
        botCount *
          SWAG.aiAmountProper[
            config.aiAmount ? config.aiAmount.toLowerCase() : "asonline"
          ]
      ),
      BotPreset: SWAG.diffProper[config.aiDifficulty.toLowerCase()],
      SpawnPoints:
        !!spawn_zone
          ? spawn_zone
          : (SWAG.savedLocationData[globalmap].openZones && SWAG.savedLocationData[globalmap].openZones.length > 0
            ? randomUtil.getStringArrayValue(SWAG.savedLocationData[globalmap].openZones)
            : ""),
      //set manually to Savage as supposedly corrects when bot data is requested
      BotSide: "Savage",
      //verify if its a pmcType and set isPlayers to true if it is
      isPlayers: player,
    };

    // If the wave has a random time, increment the wave timer counts
    if (isRandom) {

      //wave time increment is getting bigger each wave. Fix this by adding maxtimer to min timer
      SWAG.randomWaveTimer.time_min += config.WaveTimerMaxSec;
      SWAG.randomWaveTimer.time_max += config.WaveTimerMaxSec;
    }

    // increment fixed wave timers so that we have use different timed patterns
    // increment per map
    else if (group.OnlySpawnOnce === false) {
      if (SWAG.zoneCounter.count == (SWAG.zoneCounter.zones - 1)) {
        SWAG.setMapTimer(globalmap, botType)
        SWAG.zoneCounter.count = 0
        SWAG.waveCounter.count = 0
      }
      else {
        SWAG.waveCounter.count += 2
        SWAG.zoneCounter.count++
      }
    }

    config.DebugOutput && logger.info("SWAG: Configured Bot Wave: " + JSON.stringify(wave));

    return wave;
  }

  static ConfigureBossWave(
    boss: BossLocationSpawn,
    globalmap: LocationName
  ): BossLocationSpawn {
    //read support bots if defined, set the difficulty to match config
    boss?.Supports?.forEach((escort => {
      escort.BossEscortDifficult = [SWAG.diffProper[config.aiDifficulty.toLowerCase()]];
      escort.BossEscortType = SWAG.roleCase[escort.BossEscortType.toLowerCase()];
    })

    //set bossWaveSpawnedOnceAlready to true if not already
    BossWaveSpawnedOnceAlready = true;

    let spawnChance = config.BossChance
    let botType = SWAG.roleCase[boss.BossName.toLowerCase()]

    if (botType == "marksman" ) {
      spawnChance = config.SniperChance
    }

    // Guarantee any "boss spawn" that's not a boss
    if (botType === "sptUsec" || botType === "sptBear") {

      // if PMC waves are false and this is NOT a starting PMC spawn, then we need to skip it
      if (config.pmcWaves === false && boss.Time != -1) {
        spawnChance = 0
      } else {
        // This makes sure the starting PMCs do spawn, regardless of pmcWaves option
        spawnChance = 100
      }
    }

    // if it's anything other than a PMC or boss then guarantee its spawn
    else if (botType === "assault" || botType === "pmcBot" || botType === "exUsec" || botType === "sectantPriest" || botType === "sectantWarrior") {
      spawnChance = 100
    }

    const wave: BossLocationSpawn = {
      BossName: SWAG.roleCase[boss.BossName.toLowerCase()],
      // If we are configuring a boss wave, we have already passed an internal check to add the wave based off the bossChance.
      // Set the bossChance to guarntee the added boss wave is spawned
      BossChance: spawnChance,
      BossZone:
        !!boss.BossZone
          ? boss.BossZone
          : (SWAG.savedLocationData[globalmap].openZones && SWAG.savedLocationData[globalmap].openZones.length > 0
            ? randomUtil.getStringArrayValue(SWAG.savedLocationData[globalmap].openZones)
            : ""),
      BossPlayer: false,
      BossDifficult: SWAG.diffProper[config.aiDifficulty.toLowerCase()],
      BossEscortType: SWAG.roleCase[boss.BossEscortType.toLowerCase()],
      BossEscortDifficult: SWAG.diffProper[config.aiDifficulty.toLowerCase()],
      BossEscortAmount: boss.BossEscortAmount,
      Time: boss.Time,
      Supports: boss.Supports,
      RandomTimeSpawn: boss.RandomTimeSpawn,
      TriggerId: "",
      TriggerName: "",
    };

    config.DebugOutput && logger.warning("SWAG: Configured Boss Wave: " + JSON.stringify(wave));

    return wave;
  }

  static setDefaultTimers(map_name: any, bot_type: any): void {
    switch (bot_type) {
      case "pmc":
      case "sptBear":
      case "sptUsec":
        SWAG.setDefaultPmcTimers(map_name)
        break;
      case "assault":
        SWAG.setDefaultScavTimers(map_name)
        break;
      case "pmcBot":
        SWAG.setDefaultRaiderTimers(map_name)
        break;
      case "sectantPriest":
      case "sectantWarrior":
        SWAG.setDefaultCultistTimers(map_name)
    }
  }

  static setDefaultPmcTimers(map_name: any): void {
    switch (map_name) {
      case "bigmap":
        SWAG.pmcWaveTimer.customs.time_min = SWAG.actual_timers.time_min
        SWAG.pmcWaveTimer.customs.time_max = SWAG.actual_timers.time_max
        break;
      case "woods":
        SWAG.pmcWaveTimer.woods.time_min = SWAG.actual_timers.time_min
        SWAG.pmcWaveTimer.woods.time_max = SWAG.actual_timers.time_max
        break;
      case "factory4_day":
        SWAG.pmcWaveTimer.factory4_day.time_min = SWAG.actual_timers.time_min
        SWAG.pmcWaveTimer.factory4_day.time_max = SWAG.actual_timers.time_max
        break;
      case "factory4_night":
        SWAG.pmcWaveTimer.factory4_night.time_min = SWAG.actual_timers.time_min
        SWAG.pmcWaveTimer.factory4_night.time_max = SWAG.actual_timers.time_max
      case "tarkovstreets":
        SWAG.pmcWaveTimer.tarkovstreets.time_min = SWAG.actual_timers.time_min
        SWAG.pmcWaveTimer.tarkovstreets.time_max = SWAG.actual_timers.time_max
        break;
      case "lighthouse":
        SWAG.pmcWaveTimer.lighthouse.time_min = SWAG.actual_timers.time_min
        SWAG.pmcWaveTimer.lighthouse.time_max = SWAG.actual_timers.time_max
        break;
      case "interchange":
        SWAG.pmcWaveTimer.interchange.time_min = SWAG.actual_timers.time_min
        SWAG.pmcWaveTimer.interchange.time_max = SWAG.actual_timers.time_max
        break;
      case "rezervbase":
        SWAG.pmcWaveTimer.rezervbase.time_min = SWAG.actual_timers.time_min
        SWAG.pmcWaveTimer.rezervbase.time_max = SWAG.actual_timers.time_max
      case "shoreline":
        SWAG.pmcWaveTimer.shoreline.time_min = SWAG.actual_timers.time_min
        SWAG.pmcWaveTimer.shoreline.time_max = SWAG.actual_timers.time_max
    }
  }

  static setDefaultScavTimers(map_name: any): void {
    switch (map_name) {
      case "bigmap":
        SWAG.scavWaveTimer.customs.time_min = SWAG.actual_timers.time_min
        SWAG.scavWaveTimer.customs.time_max = SWAG.actual_timers.time_max
        break;
      case "woods":
        SWAG.scavWaveTimer.woods.time_min = SWAG.actual_timers.time_min
        SWAG.scavWaveTimer.woods.time_max = SWAG.actual_timers.time_max
        break;
      case "factory4_day":
        SWAG.scavWaveTimer.factory4_day.time_min = SWAG.actual_timers.time_min
        SWAG.scavWaveTimer.factory4_day.time_max = SWAG.actual_timers.time_max
        break;
      case "factory4_night":
        SWAG.scavWaveTimer.factory4_night.time_min = SWAG.actual_timers.time_min
        SWAG.scavWaveTimer.factory4_night.time_max = SWAG.actual_timers.time_max
      case "tarkovstreets":
        SWAG.scavWaveTimer.tarkovstreets.time_min = SWAG.actual_timers.time_min
        SWAG.scavWaveTimer.tarkovstreets.time_max = SWAG.actual_timers.time_max
        break;
      case "lighthouse":
        SWAG.scavWaveTimer.lighthouse.time_min = SWAG.actual_timers.time_min
        SWAG.scavWaveTimer.lighthouse.time_max = SWAG.actual_timers.time_max
        break;
      case "interchange":
        SWAG.scavWaveTimer.interchange.time_min = SWAG.actual_timers.time_min
        SWAG.scavWaveTimer.interchange.time_max = SWAG.actual_timers.time_max
        break;
      case "rezervbase":
        SWAG.scavWaveTimer.rezervbase.time_min = SWAG.actual_timers.time_min
        SWAG.scavWaveTimer.rezervbase.time_max = SWAG.actual_timers.time_max
        break;
      case "shoreline":
        SWAG.scavWaveTimer.shoreline.time_min = SWAG.actual_timers.time_min
        SWAG.scavWaveTimer.shoreline.time_max = SWAG.actual_timers.time_max
        break;
    }
  }

  static setDefaultRaiderTimers(map_name: any): void {
    switch (map_name) {
      case "bigmap":
        SWAG.raiderWaveTimer.customs.time_min = SWAG.actual_timers.time_min
        SWAG.raiderWaveTimer.customs.time_max = SWAG.actual_timers.time_max
        break;
      case "woods":
        SWAG.raiderWaveTimer.woods.time_min = SWAG.actual_timers.time_min
        SWAG.raiderWaveTimer.woods.time_max = SWAG.actual_timers.time_max
        break;
      case "factory4_day":
        SWAG.raiderWaveTimer.factory4_day.time_min = SWAG.actual_timers.time_min
        SWAG.raiderWaveTimer.factory4_day.time_max = SWAG.actual_timers.time_max
        break;
      case "factory4_night":
        SWAG.raiderWaveTimer.factory4_night.time_min = SWAG.actual_timers.time_min
        SWAG.raiderWaveTimer.factory4_night.time_max = SWAG.actual_timers.time_max
      case "tarkovstreets":
        SWAG.raiderWaveTimer.tarkovstreets.time_min = SWAG.actual_timers.time_min
        SWAG.raiderWaveTimer.tarkovstreets.time_max = SWAG.actual_timers.time_max
        break;
      case "lighthouse":
        SWAG.raiderWaveTimer.lighthouse.time_min = SWAG.actual_timers.time_min
        SWAG.raiderWaveTimer.lighthouse.time_max = SWAG.actual_timers.time_max
        break;
      case "interchange":
        SWAG.raiderWaveTimer.interchange.time_min = SWAG.actual_timers.time_min
        SWAG.raiderWaveTimer.interchange.time_max = SWAG.actual_timers.time_max
        break;
      case "rezervbase":
        SWAG.raiderWaveTimer.rezervbase.time_min = SWAG.actual_timers.time_min
        SWAG.raiderWaveTimer.rezervbase.time_max = SWAG.actual_timers.time_max
        break;
      case "shoreline":
        SWAG.raiderWaveTimer.shoreline.time_min = SWAG.actual_timers.time_min
        SWAG.raiderWaveTimer.shoreline.time_max = SWAG.actual_timers.time_max
        break;
    }
  }

  static setDefaultCultistTimers(map_name: any): void {
    switch (map_name) {
      case "bigmap":
        SWAG.cultistWaveTimer.customs.time_min = SWAG.actual_timers.time_min
        SWAG.cultistWaveTimer.customs.time_max = SWAG.actual_timers.time_max
        break;
      case "woods":
        SWAG.cultistWaveTimer.woods.time_min = SWAG.actual_timers.time_min
        SWAG.cultistWaveTimer.woods.time_max = SWAG.actual_timers.time_max
        break;
      case "factory4_day":
        SWAG.cultistWaveTimer.factory4_day.time_min = SWAG.actual_timers.time_min
        SWAG.cultistWaveTimer.factory4_day.time_max = SWAG.actual_timers.time_max
        break;
      case "factory4_night":
        SWAG.cultistWaveTimer.factory4_night.time_min = SWAG.actual_timers.time_min
        SWAG.cultistWaveTimer.factory4_night.time_max = SWAG.actual_timers.time_max
      case "tarkovstreets":
        SWAG.cultistWaveTimer.tarkovstreets.time_min = SWAG.actual_timers.time_min
        SWAG.cultistWaveTimer.tarkovstreets.time_max = SWAG.actual_timers.time_max
        break;
      case "lighthouse":
        SWAG.cultistWaveTimer.lighthouse.time_min = SWAG.actual_timers.time_min
        SWAG.cultistWaveTimer.lighthouse.time_max = SWAG.actual_timers.time_max
        break;
      case "interchange":
        SWAG.cultistWaveTimer.interchange.time_min = SWAG.actual_timers.time_min
        SWAG.cultistWaveTimer.interchange.time_max = SWAG.actual_timers.time_max
        break;
      case "rezervbase":
        SWAG.cultistWaveTimer.rezervbase.time_min = SWAG.actual_timers.time_min
        SWAG.cultistWaveTimer.rezervbase.time_max = SWAG.actual_timers.time_max
        break;
      case "shoreline":
        SWAG.cultistWaveTimer.shoreline.time_min = SWAG.actual_timers.time_min
        SWAG.cultistWaveTimer.shoreline.time_max = SWAG.actual_timers.time_max
        break;
    }
  }

  static setSpawnTimer(map_name: any, bot_type: any): void {
    switch (bot_type) {
      case "pmc":
      case "sptBear":
      case "sptUsec":
        SWAG.setPmcSpawnMapTimer(map_name)
        break;
      case "assault":
        SWAG.setScavSpawnMapTimer(map_name)
        break;
      case "pmcBot":
        SWAG.setRaiderSpawnMapTimer(map_name)
        break;
      case "sectantPriest":
      case "sectantWarrior":
        SWAG.setCultistSpawnMapTimer(map_name)
        break;
    }
  }

  static setPmcSpawnMapTimer(map_name: any): void {
    switch (map_name) {
      case "bigmap":
        SWAG.actual_timers.time_min = SWAG.pmcWaveTimer.customs.time_min
        SWAG.actual_timers.time_max = SWAG.pmcWaveTimer.customs.time_max
        break;
      case "woods":
        SWAG.actual_timers.time_min = SWAG.pmcWaveTimer.woods.time_min
        SWAG.actual_timers.time_max = SWAG.pmcWaveTimer.woods.time_max
        break;
      case "factory4_day":
        SWAG.actual_timers.time_min = SWAG.pmcWaveTimer.factory4_day.time_min
        SWAG.actual_timers.time_max = SWAG.pmcWaveTimer.factory4_day.time_max
        break;
      case "factory4_night":
        SWAG.actual_timers.time_min = SWAG.pmcWaveTimer.factory4_night.time_min
        SWAG.actual_timers.time_max = SWAG.pmcWaveTimer.factory4_night.time_max
      case "tarkovstreets":
        SWAG.actual_timers.time_min = SWAG.pmcWaveTimer.tarkovstreets.time_min
        SWAG.actual_timers.time_max = SWAG.pmcWaveTimer.tarkovstreets.time_max
        break;
      case "lighthouse":
        SWAG.actual_timers.time_min = SWAG.pmcWaveTimer.lighthouse.time_min
        SWAG.actual_timers.time_max = SWAG.pmcWaveTimer.lighthouse.time_max
        break;
      case "interchange":
        SWAG.actual_timers.time_min = SWAG.pmcWaveTimer.interchange.time_min
        SWAG.actual_timers.time_max = SWAG.pmcWaveTimer.interchange.time_max
        break;
      case "rezervbase":
        SWAG.actual_timers.time_min = SWAG.pmcWaveTimer.rezervbase.time_min
        SWAG.actual_timers.time_max = SWAG.pmcWaveTimer.rezervbase.time_max
        break;
      case "shoreline":
        SWAG.actual_timers.time_min = SWAG.pmcWaveTimer.shoreline.time_min
        SWAG.actual_timers.time_max = SWAG.pmcWaveTimer.shoreline.time_max
        break;
    }
  }

  static setScavSpawnMapTimer(map_name: any): void {
    switch (map_name) {
      case "bigmap":
        SWAG.actual_timers.time_min = SWAG.scavWaveTimer.customs.time_min
        SWAG.actual_timers.time_max = SWAG.scavWaveTimer.customs.time_max
        break;
      case "woods":
        SWAG.actual_timers.time_min = SWAG.scavWaveTimer.woods.time_min
        SWAG.actual_timers.time_max = SWAG.scavWaveTimer.woods.time_max
        break;
      case "factory4_day":
        SWAG.actual_timers.time_min = SWAG.scavWaveTimer.factory4_day.time_min
        SWAG.actual_timers.time_max = SWAG.scavWaveTimer.factory4_day.time_max
        break;
      case "factory4_night":
        SWAG.actual_timers.time_min = SWAG.scavWaveTimer.factory4_night.time_min
        SWAG.actual_timers.time_max = SWAG.scavWaveTimer.factory4_night.time_max
      case "tarkovstreets":
        SWAG.actual_timers.time_min = SWAG.scavWaveTimer.tarkovstreets.time_min
        SWAG.actual_timers.time_max = SWAG.scavWaveTimer.tarkovstreets.time_max
        break;
      case "lighthouse":
        SWAG.actual_timers.time_min = SWAG.scavWaveTimer.lighthouse.time_min
        SWAG.actual_timers.time_max = SWAG.scavWaveTimer.lighthouse.time_max
        break;
      case "interchange":
        SWAG.actual_timers.time_min = SWAG.scavWaveTimer.interchange.time_min
        SWAG.actual_timers.time_max = SWAG.scavWaveTimer.interchange.time_max
        break;
      case "rezervbase":
        SWAG.actual_timers.time_min = SWAG.scavWaveTimer.rezervbase.time_min
        SWAG.actual_timers.time_max = SWAG.scavWaveTimer.rezervbase.time_max
        break;
      case "shoreline":
        SWAG.actual_timers.time_min = SWAG.scavWaveTimer.shoreline.time_min
        SWAG.actual_timers.time_max = SWAG.scavWaveTimer.shoreline.time_max
        break;
    }
  }

  static setRaiderSpawnMapTimer(map_name: any): void {
    switch (map_name) {
      case "bigmap":
        SWAG.actual_timers.time_min = SWAG.raiderWaveTimer.customs.time_min
        SWAG.actual_timers.time_max = SWAG.raiderWaveTimer.customs.time_max
        break;
      case "woods":
        SWAG.actual_timers.time_min = SWAG.raiderWaveTimer.woods.time_min
        SWAG.actual_timers.time_max = SWAG.raiderWaveTimer.woods.time_max
        break;
      case "factory4_day":
        SWAG.actual_timers.time_min = SWAG.raiderWaveTimer.factory4_day.time_min
        SWAG.actual_timers.time_max = SWAG.raiderWaveTimer.factory4_day.time_max
        break;
      case "factory4_night":
        SWAG.actual_timers.time_min = SWAG.raiderWaveTimer.factory4_night.time_min
        SWAG.actual_timers.time_max = SWAG.raiderWaveTimer.factory4_night.time_max
      case "tarkovstreets":
        SWAG.actual_timers.time_min = SWAG.raiderWaveTimer.tarkovstreets.time_min
        SWAG.actual_timers.time_max = SWAG.raiderWaveTimer.tarkovstreets.time_max
        break;
      case "lighthouse":
        SWAG.actual_timers.time_min = SWAG.raiderWaveTimer.lighthouse.time_min
        SWAG.actual_timers.time_max = SWAG.raiderWaveTimer.lighthouse.time_max
        break;
      case "interchange":
        SWAG.actual_timers.time_min = SWAG.raiderWaveTimer.interchange.time_min
        SWAG.actual_timers.time_max = SWAG.raiderWaveTimer.interchange.time_max
        break;
      case "rezervbase":
        SWAG.actual_timers.time_min = SWAG.raiderWaveTimer.rezervbase.time_min
        SWAG.actual_timers.time_max = SWAG.raiderWaveTimer.rezervbase.time_max
        break;
      case "shoreline":
        SWAG.actual_timers.time_min = SWAG.raiderWaveTimer.shoreline.time_min
        SWAG.actual_timers.time_max = SWAG.raiderWaveTimer.shoreline.time_max
        break;
    }
  }

  static setCultistSpawnMapTimer(map_name: any): void {
    switch (map_name) {
      case "bigmap":
        SWAG.actual_timers.time_min = SWAG.cultistWaveTimer.customs.time_min
        SWAG.actual_timers.time_max = SWAG.cultistWaveTimer.customs.time_max
        break;
      case "woods":
        SWAG.actual_timers.time_min = SWAG.cultistWaveTimer.woods.time_min
        SWAG.actual_timers.time_max = SWAG.cultistWaveTimer.woods.time_max
        break;
      case "factory4_day":
        SWAG.actual_timers.time_min = SWAG.cultistWaveTimer.factory4_day.time_min
        SWAG.actual_timers.time_max = SWAG.cultistWaveTimer.factory4_day.time_max
        break;
      case "factory4_night":
        SWAG.actual_timers.time_min = SWAG.cultistWaveTimer.factory4_night.time_min
        SWAG.actual_timers.time_max = SWAG.cultistWaveTimer.factory4_night.time_max
      case "tarkovstreets":
        SWAG.actual_timers.time_min = SWAG.cultistWaveTimer.tarkovstreets.time_min
        SWAG.actual_timers.time_max = SWAG.cultistWaveTimer.tarkovstreets.time_max
        break;
      case "lighthouse":
        SWAG.actual_timers.time_min = SWAG.cultistWaveTimer.lighthouse.time_min
        SWAG.actual_timers.time_max = SWAG.cultistWaveTimer.lighthouse.time_max
        break;
      case "interchange":
        SWAG.actual_timers.time_min = SWAG.cultistWaveTimer.interchange.time_min
        SWAG.actual_timers.time_max = SWAG.cultistWaveTimer.interchange.time_max
        break;
      case "rezervbase":
        SWAG.actual_timers.time_min = SWAG.cultistWaveTimer.rezervbase.time_min
        SWAG.actual_timers.time_max = SWAG.cultistWaveTimer.rezervbase.time_max
        break;
      case "shoreline":
        SWAG.actual_timers.time_min = SWAG.cultistWaveTimer.shoreline.time_min
        SWAG.actual_timers.time_max = SWAG.cultistWaveTimer.shoreline.time_max
        break;
    }
  }

  static setMapTimer(map_name: any, bot_type: any): void {
    switch (bot_type) {
      case "pmc":
      case "sptBear":
      case "sptUsec":
        SWAG.incrementPmcTimer(map_name)
        break;
      case "assault":
        SWAG.incrementScavTimer(map_name)
        break;
      case "pmcBot":
        SWAG.incrementRaiderTimer(map_name)
        break;
      case "sectantPriest":
      case "sectantWarrior":
        SWAG.incrementCultistTimer(map_name)
        break;
    }
  }

  static incrementPmcTimer(map_name: any): void {
    switch (map_name) {
      case "bigmap":
        SWAG.pmcWaveTimer.customs.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.pmcWaveTimer.customs.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "woods":
        SWAG.pmcWaveTimer.woods.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.pmcWaveTimer.woods.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "factory4_day":
        SWAG.pmcWaveTimer.factory4_day.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.pmcWaveTimer.factory4_day.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "factory4_night":
        SWAG.pmcWaveTimer.factory4_night.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.pmcWaveTimer.factory4_night.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
      case "tarkovstreets":
        SWAG.pmcWaveTimer.tarkovstreets.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.pmcWaveTimer.tarkovstreets.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "lighthouse":
        SWAG.pmcWaveTimer.lighthouse.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.pmcWaveTimer.lighthouse.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "interchange":
        SWAG.pmcWaveTimer.interchange.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.pmcWaveTimer.interchange.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "rezervbase":
        SWAG.pmcWaveTimer.rezervbase.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.pmcWaveTimer.rezervbase.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "shoreline":
        SWAG.pmcWaveTimer.shoreline.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.pmcWaveTimer.shoreline.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
    }
  }

  static incrementScavTimer(map_name: any): void {
    switch (map_name) {
      case "bigmap":
        SWAG.scavWaveTimer.customs.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.scavWaveTimer.customs.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "woods":
        SWAG.scavWaveTimer.woods.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.scavWaveTimer.woods.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "factory4_day":
        SWAG.scavWaveTimer.factory4_day.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.scavWaveTimer.factory4_day.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "factory4_night":
        SWAG.scavWaveTimer.factory4_night.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.scavWaveTimer.factory4_night.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
      case "tarkovstreets":
        SWAG.scavWaveTimer.tarkovstreets.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.scavWaveTimer.tarkovstreets.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "lighthouse":
        SWAG.scavWaveTimer.lighthouse.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.scavWaveTimer.lighthouse.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "interchange":
        SWAG.scavWaveTimer.interchange.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.scavWaveTimer.interchange.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "rezervbase":
        SWAG.scavWaveTimer.rezervbase.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.scavWaveTimer.rezervbase.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "shoreline":
        SWAG.scavWaveTimer.shoreline.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.scavWaveTimer.shoreline.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
    }
  }

  static incrementRaiderTimer(map_name: any): void {
    switch (map_name) {
      case "bigmap":
        SWAG.raiderWaveTimer.customs.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.raiderWaveTimer.customs.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "woods":
        SWAG.raiderWaveTimer.woods.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.raiderWaveTimer.woods.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "factory4_day":
        SWAG.raiderWaveTimer.factory4_day.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.raiderWaveTimer.factory4_day.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "factory4_night":
        SWAG.raiderWaveTimer.factory4_night.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.raiderWaveTimer.factory4_night.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
      case "tarkovstreets":
        SWAG.raiderWaveTimer.tarkovstreets.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.raiderWaveTimer.tarkovstreets.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "lighthouse":
        SWAG.raiderWaveTimer.lighthouse.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.raiderWaveTimer.lighthouse.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "interchange":
        SWAG.raiderWaveTimer.interchange.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.raiderWaveTimer.interchange.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "rezervbase":
        SWAG.raiderWaveTimer.rezervbase.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.raiderWaveTimer.rezervbase.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "shoreline":
        SWAG.raiderWaveTimer.shoreline.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.raiderWaveTimer.shoreline.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
    }
  }

  static incrementCultistTimer(map_name: any): void {
    switch (map_name) {
      case "bigmap":
        SWAG.cultistWaveTimer.customs.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.cultistWaveTimer.customs.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "woods":
        SWAG.cultistWaveTimer.woods.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.cultistWaveTimer.woods.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "factory4_day":
        SWAG.cultistWaveTimer.factory4_day.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.cultistWaveTimer.factory4_day.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "factory4_night":
        SWAG.cultistWaveTimer.factory4_night.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.cultistWaveTimer.factory4_night.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
      case "tarkovstreets":
        SWAG.cultistWaveTimer.tarkovstreets.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.cultistWaveTimer.tarkovstreets.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "lighthouse":
        SWAG.cultistWaveTimer.lighthouse.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.cultistWaveTimer.lighthouse.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "interchange":
        SWAG.cultistWaveTimer.interchange.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.cultistWaveTimer.interchange.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "rezervbase":
        SWAG.cultistWaveTimer.rezervbase.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.cultistWaveTimer.rezervbase.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
      case "shoreline":
        SWAG.cultistWaveTimer.shoreline.time_min += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        SWAG.cultistWaveTimer.shoreline.time_max += (SWAG.actual_timers.time_max - SWAG.actual_timers.time_min)
        break;
    }
  }

  static getRandIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static ClearDefaultSpawns(): void {
    let map: keyof ILocations;
    for (map in locations) {
      if (map === "base" || map === "hideout") {
        continue;
      }

      // Save a backup of the wave data and the BossLocationSpawn to use when restoring defaults on raid end. Store openzones in this data as well
      if (!SWAG.savedLocationData[map]) {
        const locationBase = locations[map].base;
        SWAG.savedLocationData[map] = { waves: locationBase.waves, BossLocationSpawn: locationBase.BossLocationSpawn, openZones: this.GetOpenZones(map) };
      }

      // Reset Database, Cringe  -- i stole this code from LUA
      locations[map].base.waves = [...SWAG.savedLocationData[map].waves];
      locations[map].base.BossLocationSpawn = [
        ...SWAG.savedLocationData[map].BossLocationSpawn,
      ];

      //Clear bots spawn
      if (!config?.UseDefaultSpawns?.Waves) {
        locations[map].base.waves = [];
      }

      //Clear boss spawn
      const bossLocationSpawn = locations[map].base.BossLocationSpawn;
      if (
        !config?.UseDefaultSpawns?.Bosses &&
        !config?.UseDefaultSpawns?.TriggeredWaves
      ) {
        locations[map].base.BossLocationSpawn = [];
      } else {
        // Remove Default Boss Spawns
        if (!config?.UseDefaultSpawns?.Bosses) {
          for (let i = 0; i < bossLocationSpawn.length; i++) {
            // Triggered wave check
            if (bossLocationSpawn[i]?.TriggerName?.length === 0) {
              locations[map].base.BossLocationSpawn.splice(i--, 1);
            }
          }
        }

        // Remove Default Triggered Waves
        if (!config?.UseDefaultSpawns?.TriggeredWaves) {
          for (let i = 0; i < bossLocationSpawn.length; i++) {
            // Triggered wave check
            if (bossLocationSpawn[i]?.TriggerName?.length > 0) {
              locations[map].base.BossLocationSpawn.splice(i--, 1);
            }
          }
        }
      }
    }
  }
}

module.exports = { mod: new SWAG() };
