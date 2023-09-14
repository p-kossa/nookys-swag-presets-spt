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
import { ContextVariableType } from "@spt-aki/context/ContextVariableType";
import { ApplicationContext } from "@spt-aki/context/ApplicationContext";
import { WeatherController } from "@spt-aki/controllers/WeatherController";
import { IGetRaidConfigurationRequestData } from "@spt-aki/models/eft/match/IGetRaidConfigurationRequestData";
import { HttpResponseUtil } from "@spt-aki/utils/HttpResponseUtil";
import { StaticRouterModService } from "@spt-aki/services/mod/staticRouter/StaticRouterModService";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { RandomUtil } from "@spt-aki/utils/RandomUtil";
import { DependencyContainer } from "tsyringe";
import { LocationCallbacks } from "@spt-aki/callbacks/LocationCallbacks";
import * as fs from "fs";
import * as path from "path";
import * as ClassDef from "./ClassDef";
import {
  BossPattern,
  GroupPattern,
  aiAmountProper,
  diffProper,
  pmcType,
  roleCase,
  reverseMapNames,
  reverseBossNames
} from "./ClassDef";

import config from "../config/config.json";
import bossConfig from "../config/bossConfig.json";

const modName = "SWAG";
let logger: ILogger;
let LocationCallbacks; LocationCallbacks;
let jsonUtil; JsonUtil;
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

  public static raid_time = {
    time_of_day: "day"
  }

  public static bossCount = {
    count: 0
  }

  preAkiLoad(container: DependencyContainer): void {
    const HttpResponse = container.resolve<HttpResponseUtil>("HttpResponseUtil");

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
      "SWAG"
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
      "SWAG"
    );

    staticRouterModService.registerStaticRouter(
      `${modName}/client/raid/configuration`,
      [
        {
          url: "/client/raid/configuration",
          action: (
            url: string,
            info: any,
            sessionID: string,
            output: string
          ): any => {

            try {
              // PMCs should never convert - we need full control here
              const aki_bots: IBotConfig = configServer.getConfig(
                ConfigTypes.BOT
              );

              aki_bots.pmc.convertIntoPmcChance["assault"].min = 0;
              aki_bots.pmc.convertIntoPmcChance["assault"].max = 0;
              aki_bots.pmc.convertIntoPmcChance["cursedassault"].min = 0;
              aki_bots.pmc.convertIntoPmcChance["cursedassault"].max = 0;
              aki_bots.pmc.convertIntoPmcChance["pmcbot"].min = 0;
              aki_bots.pmc.convertIntoPmcChance["pmcbot"].max = 0;
              aki_bots.pmc.convertIntoPmcChance["exusec"].min = 0;
              aki_bots.pmc.convertIntoPmcChance["exusec"].max = 0;
              aki_bots.pmc.convertIntoPmcChance["arenafighter"].min = 0;
              aki_bots.pmc.convertIntoPmcChance["arenafighter"].max = 0;
              aki_bots.pmc.convertIntoPmcChance["arenafighterevent"].min = 0;
              aki_bots.pmc.convertIntoPmcChance["arenafighterevent"].max = 0;
              aki_bots.pmc.convertIntoPmcChance["crazyassaultevent"].min = 0;
              aki_bots.pmc.convertIntoPmcChance["crazyassaultevent"].max = 0;

              logger.info("SWAG: PMC conversion is OFF (this is good - be sure this loads AFTER Realism/SVM)")

              const appContext = container.resolve<ApplicationContext>("ApplicationContext");
              const matchInfoStartOff = appContext.getLatestValue(ContextVariableType.RAID_CONFIGURATION).getValue<IGetRaidConfigurationRequestData>();
              const weatherController = container.resolve<WeatherController>("WeatherController");

              const time = weatherController.generate().time;

              let realTime = "";

              if (matchInfoStartOff.timeVariant === "PAST") {
                realTime = getTime(time, 12);
              }
              if (matchInfoStartOff.timeVariant === "CURR") {
                realTime = time;
              }

              function getTime(time, hourDiff) {
                let [h, m] = time.split(':');
                if (parseInt(h) == 0) {
                  return `${h}:${m}`
                }
                h = Math.abs(parseInt(h) - hourDiff);
                return `${h}:${m}`
              }

              function getTOD(time) {
                let TOD = "";
                let [h, m] = time.split(':');
                if ((matchInfoStartOff.location != "factory4_night" && parseInt(h) >= 5 && parseInt(h) < 22) || (matchInfoStartOff.location === "factory4_day" || matchInfoStartOff.location === "Laboratory" || matchInfoStartOff.location === "laboratory")) {
                  TOD = "day";
                }
                else {
                  TOD = "night";
                }
                return TOD;
              }

              SWAG.raid_time.time_of_day = getTOD(realTime);

              // set map caps
              if (SWAG.raid_time.time_of_day === "day") {
                aki_bots.maxBotCap.factory4_day = config.MaxBotCap.factory;
                aki_bots.maxBotCap.bigmap = config.MaxBotCap.customs;
                aki_bots.maxBotCap.interchange = config.MaxBotCap.interchange;
                aki_bots.maxBotCap.shoreline = config.MaxBotCap.shoreline;
                aki_bots.maxBotCap.woods = config.MaxBotCap.woods;
                aki_bots.maxBotCap.rezervbase = config.MaxBotCap.reserve;
                aki_bots.maxBotCap.laboratory = config.MaxBotCap.laboratory;
                aki_bots.maxBotCap.lighthouse = config.MaxBotCap.lighthouse;
                aki_bots.maxBotCap.tarkovstreets = config.MaxBotCap.streets;
                logger.info("SWAG: Max Bot Caps set");
              }
              else if (SWAG.raid_time.time_of_day === "night") {
                aki_bots.maxBotCap.factory4_night = config.NightMaxBotCap.factory_night;
                aki_bots.maxBotCap.bigmap = config.NightMaxBotCap.customs;
                aki_bots.maxBotCap.interchange = config.NightMaxBotCap.interchange;
                aki_bots.maxBotCap.shoreline = config.NightMaxBotCap.shoreline;
                aki_bots.maxBotCap.woods = config.NightMaxBotCap.woods;
                aki_bots.maxBotCap.rezervbase = config.NightMaxBotCap.reserve;
                aki_bots.maxBotCap.laboratory = config.NightMaxBotCap.laboratory;
                aki_bots.maxBotCap.lighthouse = config.NightMaxBotCap.lighthouse;
                aki_bots.maxBotCap.tarkovstreets = config.NightMaxBotCap.streets;
                logger.info("SWAG: Night Raid Max Bot Caps set");
              }
              return HttpResponse.nullResponse();
            }
            catch (e) {
              logger.info("SWAG: Failed To modify PMC conversion, you may have more PMCs than you're supposed to" + e);
              return HttpResponse.nullResponse();
            }
          }
        }
      ],
      "SWAG"
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

    SWAG.ReadAllPatterns();

    // as of SPT 3.6.0 we need to disable the new spawn system so that SWAG can clear spawns properly
    if (!config?.UseDefaultSpawns?.Waves || !config?.UseDefaultSpawns?.Bosses || !config?.UseDefaultSpawns?.TriggeredWaves) {
      SWAG.disableSpawnSystems();
    }
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
          SWAG.randomWaveTimer.time_min = config.GlobalSCAVRandomWaveTimer.WaveTimerMinSec;
          SWAG.randomWaveTimer.time_max = config.GlobalSCAVRandomWaveTimer.WaveTimerMaxSec;

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

    // lets shuffle bosses around in case skip boss is true
    // so that a random boss is spawned every time
    let randomizedBossGroups = this.shuffleArray(StaticBossGroups)

    for (let i = 0; i < randomizedBossGroups.length; i++) {
      let boss = randomizedBossGroups[i];
      let actual_boss_name = boss.BossName
      let boss_name = reverseBossNames[boss.BossName] ? reverseBossNames[boss.BossName] : boss.BossName;

      if (actual_boss_name.startsWith("boss") || actual_boss_name.startsWith("useccommander")) {
        let spawnChance = boss.BossChance ? boss.BossChance : bossConfig.BossSpawns[reverseMapNames[globalmap]][boss_name].chance;
        if (spawnChance != 0) {
          SWAG.SpawnBosses(
            boss,
            globalmap,
            AlreadySpawnedBossGroups
          );
          SWAG.bossCount.count += 1
        }
        else {
          continue;
        }
      }
      else {
        SWAG.SpawnBosses(
          boss,
          globalmap,
          AlreadySpawnedBossGroups
        );
      }
    }
    SWAG.bossCount.count = 0
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
    let boss_name = boss.BossName

    if (bossConfig.TotalBossesPerMap[reverseMapNames[globalmap]] === 0) {
      config.DebugOutput && logger.info("SWAG: TotalBosses set to 0 for this map, skipping boss spawn")
      return;
    }
    else if (BossWaveSpawnedOnceAlready && (boss_name.startsWith("boss") || boss_name.startsWith("useccommander"))) {
      boss_name = reverseBossNames[boss.BossName] ? reverseBossNames[boss.BossName] : boss.BossName
      let spawnChance = boss.BossChance ? boss.BossChance : bossConfig.BossSpawns[reverseMapNames[globalmap]][boss_name].chance
      // if spawn chance is 100 lets ignore the boss limits
      if (bossConfig.TotalBossesPerMap[reverseMapNames[globalmap]] === -1 || spawnChance == 100) {
        // do nothing
      }
      else if (SWAG.bossCount.count >= bossConfig.TotalBossesPerMap[reverseMapNames[globalmap]]) {
        config.DebugOutput && logger.info("SWAG: Skipping boss spawn as total boss count has been met already")
        return;
      }
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
    let botType = roleCase[bot.BotType.toLowerCase()] ? roleCase[bot.BotType.toLowerCase()] : bot.BotType
    let botCount = bot.MaxBotCount
    let swagPMCconfig = config["SWAG_SPAWN_CONFIG-ONLY_USE_IF_NOT_USING_DONUTS_SPAWNS"].PMCs
    let swagSCAVconfig = config["SWAG_SPAWN_CONFIG-ONLY_USE_IF_NOT_USING_DONUTS_SPAWNS"].SCAVs

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

    let roll = SWAG.getRandIntInclusive(1, 100)

    if (botType === "pmc" || botType === "sptUsec" || botType === "sptBear" ) {
      player = true

      // check if requested botType is a PMC
      if (botType === "pmc") {
        // let's roll a random PMC type
        botType = pmcType[Math.floor(Math.random() * pmcType.length)]
      }

      // pmcWaves is false then we need to skip this PMC wave
      if (swagPMCconfig.pmcWaves === false) {
        slots = 0
        botCount = 0
      }
      // PMC weight check - let's not skip any Factory starting waves, so check for OnlySpawnOnce here
      else if (roll >= swagPMCconfig.pmcSpawnWeight && group.OnlySpawnOnce === false) {
        slots = 0
        botCount = 0
      }
    }

    else if (botType === "assault") {
      if (swagSCAVconfig.scavWaves === false) {
        slots = 0
        botCount = 0
      }
      // If this is Labs, then don't allow SCAVs to spawn
      else if (globalmap === "laboratory" && swagSCAVconfig.scavInLabs === false) {
        slots = 0
        botCount = 0
      }

      // SCAV weight check
      else if (roll >= swagSCAVconfig.scavSpawnWeight) {
        slots = 0
        botCount = 0
      }
    }

    else if (botType === "exUsec") {
      if (roll >= config.spawnChances.rogues[reverseMapNames[globalmap]]) {
        slots = 0
        botCount = 0
      }
    }

    else if (botType === "pmcBot") {
      if (roll >= config.spawnChances.raiders[reverseMapNames[globalmap]]) {
        slots = 0
        botCount = 0
      }
    }

    else if (botType === "arenaFighterEvent") {
      if (roll >= config.spawnChances.bloodhounds[reverseMapNames[globalmap]]) {
        slots = 0
        botCount = 0
      }
    }
    else if (botType === "crazyAssaultEvent") {
      if (roll >= config.spawnChances.crazyscavs[reverseMapNames[globalmap]]) {
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
            config.SWAG_ONLY_aiAmount ? config.SWAG_ONLY_aiAmount.toLowerCase() : "asonline"
          ]
      ),
      BotPreset: diffProper[config.SWAG_ONLY_aiDifficulty.toLowerCase()],
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
      SWAG.randomWaveTimer.time_min += config.GlobalSCAVRandomWaveTimer.WaveTimerMaxSec;
      SWAG.randomWaveTimer.time_max += config.GlobalSCAVRandomWaveTimer.WaveTimerMaxSec;
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
      escort.BossEscortDifficult = [diffProper[config.SWAG_ONLY_aiDifficulty.toLowerCase()]];
      escort.BossEscortType = roleCase[escort.BossEscortType.toLowerCase()];
    })

    //set bossWaveSpawnedOnceAlready to true if not already
    BossWaveSpawnedOnceAlready = true;

    // first check if BossChance is defined for this spawn
    let spawnChance = boss.BossChance ? boss.BossChance : 100
    let spawnTime = -1
    let spawnZones = null
    let group_chance = boss.BossEscortAmount

    let swagPMCconfig = config["SWAG_SPAWN_CONFIG-ONLY_USE_IF_NOT_USING_DONUTS_SPAWNS"].PMCs
    let pmcChance = swagPMCconfig.pmcChance

    let difficulty = diffProper[config.SWAG_ONLY_aiDifficulty.toLowerCase()]
    let escort_difficulty = diffProper[config.SWAG_ONLY_aiDifficulty.toLowerCase()]

    let bossName = roleCase[boss.BossName.toLowerCase()] ? roleCase[boss.BossName.toLowerCase()] : boss.BossName
    let trigger_id = ""
    let trigger_name = ""

    let bossSettings = bossConfig.BossSpawns[reverseMapNames[globalmap]]

    switch (boss.BossName) {
      // Punisher Compatibility
      case 'bosspunisher':
        if (bossConfig.CustomBosses.punisher) {
          logger.info("SWAG: Custom Boss Punisher Compatibility Patch is ENABLED - Punisher spawn chance will be used from YOUR Punisher progress.json")
          // get actual spawn chance from punisher progress file. thank you GrooveypenguinX!
          const punisherBossProgressFilePath = path.resolve(__dirname, '../../PunisherBoss/src/progress.json');

          difficulty = "impossible"
          escort_difficulty = "impossible"

          try {
            const progressData = JSON.parse(fs.readFileSync(punisherBossProgressFilePath, "utf8"));
            spawnChance = progressData?.actualPunisherChance ?? 1;
          }
          catch (error) {
            logger.warning("SWAG: Unable to load Punisher Boss progress file, either you don't have the mod installed or you don't have a Punisher progress file yet.");
            logger.warning("SWAG: Setting Punisher spawn chance to 1")
            spawnChance = 1
          }
        }
        else {
          logger.warning("SWAG: Detected bosspunisher, but Custom Boss flag is false - using SWAG spawn chance instead")
        }
        break;
      case 'bosszryachiy':
        spawnChance = bossSettings.zryachiy.chance
        spawnTime = bossSettings.zryachiy.time
        spawnZones = bossSettings.zryachiy.zone
        break;
      case 'bossknight':
        spawnChance = bossSettings.goons.chance
        spawnTime = bossSettings.goons.time
        spawnZones = bossSettings.goons.zone
        break;
      case 'bosstagilla':
        spawnChance = bossSettings.tagilla.chance
        spawnTime = bossSettings.tagilla.time
        spawnZones = bossSettings.tagilla.zone
        break;
      case 'bossgluhar':
        spawnChance = bossSettings.glukhar.chance
        spawnTime = bossSettings.glukhar.time
        spawnZones = bossSettings.glukhar.zone
        break;
      case 'bosssanitar':
        spawnChance = bossSettings.sanitar.chance
        spawnTime = bossSettings.sanitar.time
        spawnZones = bossSettings.sanitar.zone
        break;
      case 'bosskojaniy':
        spawnChance = bossSettings.shturman.chance
        spawnTime = bossSettings.shturman.time
        spawnZones = bossSettings.shturman.zone
        break;
      case 'bossbully':
        spawnChance = bossSettings.reshala.chance
        spawnTime = bossSettings.reshala.time
        spawnZones = bossSettings.reshala.zone
        break;
      case 'bosskilla':
        spawnChance = bossSettings.killa.chance
        spawnTime = bossSettings.killa.time
        spawnZones = bossSettings.killa.zone
        break;
      case 'sectantpriest':
        spawnChance = config.spawnChances.cultists[reverseMapNames[globalmap]]
        break;
      case 'pmcbot':
        spawnChance = boss.BossChance ? boss.BossChance : config.spawnChances.raiders[reverseMapNames[globalmap]]
        break;
      case 'exusec':
        spawnChance = boss.BossChance ? boss.BossChance : config.spawnChances.rogues[reverseMapNames[globalmap]]
        break;
      case 'bloodhound':
        spawnChance = boss.BossChance ? boss.BossChance : config.spawnChances.bloodhounds[reverseMapNames[globalmap]]
        break;
      case 'crazyscavs':
        spawnChance = boss.BossChance ? boss.BossChance : config.spawnChances.crazyscavs[reverseMapNames[globalmap]]
        break;
      case 'sptbear':
        spawnChance = boss.BossChance ? boss.BossChance : pmcChance
        break;
      case 'sptusec':
        spawnChance = boss.BossChance ? boss.BossChance : pmcChance
        break;
      case 'marksman':
        spawnChance = boss.BossChance ? boss.BossChance : config.spawnChances.snipers[reverseMapNames[globalmap]]
        break;
      case 'assault':
        spawnChance = boss.BossChance ? boss.BossChance : 100
        break;
      default:
        spawnChance = boss.BossChance ? boss.BossChance : bossConfig.BossSpawns[reverseMapNames[globalmap]][bossName].chance
        spawnTime = boss.Time ? boss.Time : bossConfig.BossSpawns[reverseMapNames[globalmap]][bossName].time
        spawnZones = boss.BossZone ? boss.BossZone : bossConfig.BossSpawns[reverseMapNames[globalmap]][bossName].chance
        break;
    }

    // if it's null skip this part
    if (boss.BossZone != null || spawnZones != null) {
      spawnZones = boss.BossZone ? boss.BossZone : spawnZones
      if (spawnZones.length > 1) {
        // let's just pick one zone, can't trust BSG to do this correctly
        let random_zone = SWAG.getRandIntInclusive(0, spawnZones.length - 1)
        spawnZones = spawnZones[random_zone]
      }
    // if it's not > 1 and not null, then we'll assume there's a single zone defined instead
      else {
        spawnZones = spawnZones[0]
      }
    }

    if (bossName === "sptUsec" || bossName === "sptBear") {
      group_chance = boss.BossEscortAmount ? boss.BossEscortAmount : SWAG.generatePmcGroupChance(swagPMCconfig.pmcGroupChance)
    }

    // if there's a trigger defined then we need to define it for this wave
    if (boss.TriggerId) {
      trigger_id = boss.TriggerId
      trigger_name = boss.TriggerName
    }

    const wave: BossLocationSpawn = {
      BossName: bossName,
      // If we are configuring a boss wave, we have already passed an internal check to add the wave based off the bossChance.
      // Set the bossChance to guarntee the added boss wave is spawned
      BossChance: spawnChance,
      BossZone:
        !!spawnZones
          ? spawnZones
          : (SWAG.savedLocationData[globalmap].openZones && SWAG.savedLocationData[globalmap].openZones.length > 0
            ? randomUtil.getStringArrayValue(SWAG.savedLocationData[globalmap].openZones)
            : ""),
      BossPlayer: false,
      BossDifficult: difficulty,
      BossEscortType: roleCase[boss.BossEscortType.toLowerCase()],
      BossEscortDifficult: escort_difficulty,
      BossEscortAmount: group_chance,
      Time: boss.Time ? boss.Time : spawnTime,
      Supports: boss.Supports,
      RandomTimeSpawn: boss.RandomTimeSpawn,
      TriggerId: trigger_id,
      TriggerName: trigger_name,
    };

    config.DebugOutput && logger.warning("SWAG: Configured Boss Wave: " + JSON.stringify(wave));

    return wave;
  }

  // thanks ChatGPT
  static generatePmcGroupChance(group_chance: string, weights?: number[]): string {
    const defaultWeights: { [key: string]: number[] } = {
      asonline: [0.80, 0.12, 0.05, 0.03, 0],
      low: [0.90, 0.08, 0.02, 0, 0],
      none: [1, 0, 0, 0, 0],
      high: [0.10, 0.15, 0.30, 0.30, 0.15],
      max: [0, 0, 0.20, 0.50, 0.30]
    };

    const totalIntegers = Math.floor(Math.random() * 30) + 1; // Random length from 1 to 15 inclusive
    const selectedWeights = weights || defaultWeights[group_chance];

    let bossEscortAmount: number[] = [];
    for (let i = 0; i < selectedWeights.length; i++) {
      const count = Math.round(totalIntegers * selectedWeights[i]);
      bossEscortAmount.push(...Array(count).fill(i));
    }

    bossEscortAmount.sort((a, b) => a - b); // Sort the occurrences in ascending order

    // thank you DrakiaXYZ, you're a legend
    if (bossEscortAmount.length == 0) {
      bossEscortAmount.push(0);
    }

    return bossEscortAmount.join(',');
  }

  // thanks ChatGPT
  static shuffleArray<T>(array: T[]): T[] {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
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

  static disableSpawnSystems(): void {
    let map: keyof ILocations;
    for (map in locations) {
      if (map === "base" || map === "hideout") {
        continue;
      }
      locations[map].base.OfflineNewSpawn = false
      locations[map].base.OfflineOldSpawn = true
      locations[map].base.NewSpawn = false
      locations[map].base.OldSpawn = true
      config.DebugOutput && logger.info("SWAG: disabled NewSpawnSystem to clear default spawns (SPT 3.6.x)");
    }
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
