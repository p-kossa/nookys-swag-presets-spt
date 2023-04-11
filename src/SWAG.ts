import {
  BossLocationSpawn,
  ILocationBase,
  Wave,
} from "@spt-aki/models/eft/common/ILocationBase";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IBotConfig } from "@spt-aki/models/spt/config/IBotConfig";
import { ILocations } from "@spt-aki/models/spt/server/ILocations";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { StaticRouterModService } from "@spt-aki/services/mod/staticRouter/StaticRouterModService";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { RandomUtil } from "@spt-aki/utils/RandomUtil";
import { DependencyContainer } from "tsyringe";
import { LocationCallbacks } from "@spt-aki/callbacks/LocationCallbacks";
import * as ClassDef from "./ClassDef";
import {
  BossPattern,
  GroupPattern,
  aiAmountProper,
  diffProper,
  pmcType,
  roleCase,
  GlobalRandomWaveTimer,
} from "./ClassDef";

import config from "../config/config.json";
import { roles } from "./ClassDef";
import { spawn } from "child_process";

const modName = "SWAG";
let logger: ILogger;
let LocationCallbacks; LocationCallbacks;
let jsonUtil: JsonUtil;
let configServer: ConfigServer;
let botConfig: IBotConfig;
let databaseServer: DatabaseServer;
let locations: ILocations;
let randomUtil: RandomUtil;
let BossWaveSpawnedOnceAlready: boolean;

const customPatterns: Record<string, ClassDef.GroupPattern> = {};

type LocationName = keyof Omit<ILocations, "base">;
type LocationBackupData = Record<
  LocationName,
  | {
      waves: Wave[];
      BossLocationSpawn: BossLocationSpawn[];
      openZones: string[];
    }
  | undefined
>;

type GlobalPatterns = Record<string, MapPatterns>;
type MapPatterns = {
  MapGroups: GroupPattern[];
  MapBosses: BossPattern[];
};

const globalPatterns: GlobalPatterns = {};

class SWAG implements IPreAkiLoadMod, IPostDBLoadMod {
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

  public static pmcType: string[] = ["sptbear", "sptusec"];

  public static randomWaveTimer = {
    time_min: 0,
    time_max: 0
  };

  public static actual_timers = {
    time_min: 0,
    time_max: 0
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

    staticRouterModService.registerStaticRouter(
      `${modName}/client/locations`,
      [
        {
          url: "/client/locations",
          action: (
            url: string,
            info: any,
            sessionID: string,
            output: string
          ): any => {
            SWAG.ClearDefaultSpawns();
            SWAG.ConfigureMaps();
            return LocationCallbacks.getLocationData(url, info, sessionID);
          },
        },
      ],
      "aki"
    );
  }

  postDBLoad(container: DependencyContainer): void {
    logger = container.resolve<ILogger>("WinstonLogger");
    LocationCallbacks = container.resolve<LocationCallbacks>("LocationCallbacks");
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
      (name) => ClassDef.validMaps.includes(name)
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
          SWAG.randomWaveTimer.time_min = config.GlobalRandomWaveTimer.WaveTimerMinSec;
          SWAG.randomWaveTimer.time_max = config.GlobalRandomWaveTimer.WaveTimerMaxSec;

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

    return group.RandomTimeSpawn || isRandomMax || isRandomMin;
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
      SWAG.SetUpStaticBots(StaticGroups, globalmap, AlreadySpawnedGroups);
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
      for (let i = 0; i < config.RandomWaveCount; i++) {
        SWAG.SpawnBots(
          group,
          globalmap,
          AlreadySpawnedGroups
        );
      }
      // i've completed looping through waves, so lets reset timers for the next group
      SWAG.actual_timers.time_min = 0
      SWAG.actual_timers.time_max = 0
      SWAG.waveCounter.count = 1
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
    if (group.BotZone != null) {
      for (let zone of group.BotZone) {
        for (let bot of group.Bots) {
          const wave: Wave = SWAG.ConfigureBotWave(
            group,
            bot,
            globalmap,
            zone
          );

          locations[globalmap].base.waves.push(wave);
        }
      }
      // now we increment only AFTER all zones have been filled with the above group
      if (group.RandomTimeSpawn === false) {
        SWAG.incrementTime();
      }
    }
    else {
      let zone = null
      for (let bot of group.Bots) {
        const wave: Wave = SWAG.ConfigureBotWave(
          group,
          bot,
          globalmap,
          zone
        );

        locations[globalmap].base.waves.push(wave);
      }
    }
  }

  static ConfigureBotWave(
    group: ClassDef.GroupPattern,
    bot: ClassDef.Bot,
    globalmap: LocationName,
    zone: any
  ): Wave {
    const isRandom = SWAG.isGroupRandom(group);

    let slots = 1
    let player = false
    let botType = roleCase[bot.BotType.toLowerCase()]
    let botCount = bot.MaxBotCount

    if (group.OnlySpawnOnce === false && group.RandomTimeSpawn === false) {
      if (SWAG.waveCounter.count == 1) {
        SWAG.actual_timers.time_min = group.Time_min
        SWAG.actual_timers.time_max = group.Time_max
      }
    }
    else {
      SWAG.actual_timers.time_min = group.Time_min
      SWAG.actual_timers.time_max = group.Time_max
    }

    let pmc_random_weight = SWAG.getRandIntInclusive(1, 100)
    let scav_random_weight = SWAG.getRandIntInclusive(1, 100)
    let rogue_random_weight = SWAG.getRandIntInclusive(1, 100)
    let raider_random_weight = SWAG.getRandIntInclusive(1, 100)

    if (botType === "pmc" || botType === "sptUsec" || botType === "sptBear" ) {

      // check if requested botType is a PMC
      if (botType === "pmc") {
        // let's roll a random PMC type
        botType = pmcType[Math.floor(Math.random() * pmcType.length)]
      }

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
      // hopefully this will help ease the PMC spam throughout the duration of raids
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

    else if (botType === "exUsec") {
      if (rogue_random_weight >= config.RogueChance) {
        slots = 0
        botCount = 0
      }
    }

    else if (botType === "pmcBot") {
      if (raider_random_weight >= config.RaiderChance) {
        slots = 0
        botCount = 0
      }
    }

    // if botCount is 0, slots should always be 0
    if (botCount === 0) {
      slots = 0
    }

    const wave: Wave = {
      number: null,
      WildSpawnType: botType,
      time_min: isRandom ? SWAG.randomWaveTimer.time_min : SWAG.actual_timers.time_min,
      time_max: isRandom ? SWAG.randomWaveTimer.time_max : SWAG.actual_timers.time_max,
      slots_min: slots,
      slots_max: Math.floor(
        botCount *
          aiAmountProper[
            config.aiAmount ? config.aiAmount.toLowerCase() : "asonline"
          ]
      ),
      BotPreset: diffProper[config.aiDifficulty.toLowerCase()],
      SpawnPoints:
        !!zone
          ? zone
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
      SWAG.randomWaveTimer.time_min += config.GlobalRandomWaveTimer.WaveTimerMaxSec;
      SWAG.randomWaveTimer.time_max += config.GlobalRandomWaveTimer.WaveTimerMaxSec;
    }

    // increment fixed wave timers so that we have use different timed patterns
    // increment per map
    else if (group.OnlySpawnOnce === false) {
      SWAG.waveCounter.count += 2
    }

    config.DebugOutput && logger.info("SWAG: Configured Bot Wave: " + JSON.stringify(wave));

    return wave;
  }

  static ConfigureBossWave(
    boss: BossLocationSpawn,
    globalmap: LocationName
  ): BossLocationSpawn {
    //read support bots if defined, set the difficulty to match config
    boss?.Supports?.forEach((escort) => {
      escort.BossEscortDifficult = [diffProper[config.aiDifficulty.toLowerCase()]];
      escort.BossEscortType = roleCase[escort.BossEscortType.toLowerCase()];
    })

    //set bossWaveSpawnedOnceAlready to true if not already
    BossWaveSpawnedOnceAlready = true;

    // first check if BossChance is defined for this spawn
    let spawnChance = boss.BossChance ? boss.BossChance : 100
    let raiderChance = config.RaiderChance
    let rogueChance = config.RogueChance

    let boss_spawn_zone = null
    let botType = roleCase[boss.BossName.toLowerCase()]
    let trigger_id = ""
    let trigger_name = ""

    switch (boss.BossName) {
      case 'bosszryachiy':
        spawnChance = config.BossChance.zryachiy
        break;
      case 'bossknight':
        spawnChance = config.BossChance.goons
        break;
      case 'bosstagilla':
        spawnChance = config.BossChance.tagilla
        break;
      case 'bossgluhar':
        spawnChance = config.BossChance.gluhar
        break;
      case 'bosssanitar':
        spawnChance = config.BossChance.sanitar
        break;
      case 'bosskojaniy':
        spawnChance = config.BossChance.shturman
        break;
      case 'bossbully':
        spawnChance = config.BossChance.reshala
        break;
      case 'bosskilla':
        spawnChance = config.BossChance.killa
        break;
    }

    // if it's null skip this part
    if (boss.BossZone) {
      if (boss.BossZone.length > 1) {
        // let's just pick one zone, can't trust BSG to do this correctly
        let random_zone = SWAG.getRandIntInclusive(0, boss.BossZone.length - 1)
        boss_spawn_zone = boss.BossZone[random_zone]
      }
    // if it's not > 1 and not null, then we'll assume there's a single zone defined instead
      else {
        boss_spawn_zone = boss.BossZone[0]
      }
    }

    if (botType === "marksman" ) {
      spawnChance = config.SniperChance
    }
    // Guarantee any "boss spawn" that's not a boss
    else if (botType === "sptUsec" || botType === "sptBear") {
      // if PMC waves are false and this is NOT a starting PMC spawn, then we need to skip it
      if (config.pmcWaves === false && boss.Time != -1) {
        spawnChance = 0
      }
    }
    // check if BossChance is defined for these,
    // otherwise use what's defined in config.json
    else if (botType === "exUsec") {
      spawnChance = boss.BossChance ? boss.BossChance : rogueChance
    }

    else if (botType === "pmcBot") {
      spawnChance = boss.BossChance ? boss.BossChance : raiderChance
    }

    // if there's a trigger defined then we need to define it for this wave
    if (boss.TriggerId) {
      trigger_id = boss.TriggerId
      trigger_name = boss.TriggerName
    }

    const wave: BossLocationSpawn = {
      BossName: botType,
      // If we are configuring a boss wave, we have already passed an internal check to add the wave based off the bossChance.
      // Set the bossChance to guarntee the added boss wave is spawned
      BossChance: spawnChance,
      BossZone:
        !!boss_spawn_zone
          ? boss_spawn_zone
          : (SWAG.savedLocationData[globalmap].openZones && SWAG.savedLocationData[globalmap].openZones.length > 0
            ? randomUtil.getStringArrayValue(SWAG.savedLocationData[globalmap].openZones)
            : ""),
      BossPlayer: false,
      BossDifficult: diffProper[config.aiDifficulty.toLowerCase()],
      BossEscortType: roleCase[boss.BossEscortType.toLowerCase()],
      BossEscortDifficult: diffProper[config.aiDifficulty.toLowerCase()],
      BossEscortAmount: boss.BossEscortAmount,
      Time: boss.Time,
      Supports: boss.Supports,
      RandomTimeSpawn: boss.RandomTimeSpawn,
      TriggerId: trigger_id,
      TriggerName: trigger_name,
    };

    config.DebugOutput && logger.warning("SWAG: Configured Boss Wave: " + JSON.stringify(wave));

    return wave;
  }

  static incrementTime(): void {
    let min = SWAG.actual_timers.time_min
    let max = SWAG.actual_timers.time_max
    SWAG.actual_timers.time_min = max
    SWAG.actual_timers.time_max = SWAG.actual_timers.time_min + (max - min)
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
