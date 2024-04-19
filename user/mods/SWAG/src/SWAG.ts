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
import { ILocationConfig } from "@spt-aki/models/spt/config/ILocationConfig";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { IGlobals } from "@spt-aki/models/eft/common/IGlobals";
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
import { SeasonalEventService } from "@spt-aki/services/SeasonalEventService";
import { ProfileHelper } from "@spt-aki/helpers/ProfileHelper";

import * as fs from "fs";
import * as path from "path";
import * as ClassDef from "./ClassDef";
import {
  BossPattern,
  GroupPattern,
  aiAmountProper,
  diffProper,
  roleCase,
  reverseMapNames,
  reverseBossNames,
} from "./ClassDef";

// General SWAG Config
import config from "../config/config.json";
import bossConfig from "../config/bossConfig.json";

// Bosses
import gluhar from "../config/bosses/gluhar.json";
import goons from "../config/bosses/goons.json";
import kaban from "../config/bosses/kaban.json";
import killa from "../config/bosses/killa.json";
import kolontay from "../config/bosses/kolontay.json";
import reshala from "../config/bosses/reshala.json";
import sanitar from "../config/bosses/sanitar.json";
import shturman from "../config/bosses/shturman.json";
import tagilla from "../config/bosses/tagilla.json";
import zryachiy from "../config/bosses/zryachiy.json";

// Spawn Configs
import bloodhounds from "../config/other/bloodhounds.json";
import cultists from "../config/other/cultists.json";
import raiders from "../config/other/raiders.json";
import rogues from "../config/other/rogues.json";
import scav_snipers from "../config/other/scav_snipers.json";

// Custom
import punisher from "../config/custom/punisher.json"
import legion from "../config/custom/legion.json"

const otherSpawnConfigs = [
  bloodhounds,
  cultists,
  scav_snipers,
  raiders,
  rogues
];

const bossSpawnConfigs = [
  gluhar,
  goons,
  kaban,
  killa,
  kolontay,
  reshala,
  sanitar,
  shturman,
  tagilla,
  zryachiy
];

const customSpawnConfigs = [
  punisher,
  legion
]

const modName = "SWAG";
let logger: ILogger;
let LocationCallbacks;
LocationCallbacks;
let jsonUtil;
JsonUtil;
let botConfig: IBotConfig;
let pmcConfig: IBotConfig;
let iGlobals: IGlobals;
let configServer: ConfigServer;
let databaseServer: DatabaseServer;
let locations: ILocations;
let seasonalEvents: SeasonalEventService;
let randomUtil: RandomUtil;
let profileHelper: ProfileHelper;
let sessionId : string;
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
    time_max: 0,
  };

  public static actual_timers = {
    time_min: 0,
    time_max: 0,
  };

  public static waveCounter = {
    count: 1,
  };

  public static raid_time = {
    time_of_day: "day",
  };

  public static bossCount = {
    count: 0,
  };

  preAkiLoad(container: DependencyContainer): void {
    const HttpResponse =
      container.resolve<HttpResponseUtil>("HttpResponseUtil");

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
            sessionId = sessionID;
            SWAG.ClearDefaultSpawns();
            SWAG.ConfigureMaps();
            return LocationCallbacks.getLocationData(url, info, sessionID);
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
            sessionId = sessionID;
            SWAG.ClearDefaultSpawns();
            SWAG.ConfigureMaps();
            return LocationCallbacks.getLocationData(url, info, sessionID);
          },
        },
      ],
      "SWAG"
    );

    staticRouterModService.registerStaticRouter(
      `${modName}/client/items`,
      [
        {
          url: "/client/items",
          action: (
            url: string,
            info: any,
            sessionID: string,
            output: string
          ) => {
            sessionId = sessionID;
            const locationConfig = container.resolve<ConfigServer>("ConfigServer").getConfig<ILocationConfig>(ConfigTypes.LOCATION);

            // as of SPT 3.6.0 we need to disable the new spawn system so that SWAG can clear spawns properly
            if (
              !config?.UseDefaultSpawns?.Waves ||
              !config?.UseDefaultSpawns?.Bosses ||
              !config?.UseDefaultSpawns?.TriggeredWaves
            ) {
              SWAG.disableSpawnSystems();
            }

            // disable more vanilla spawn stuff
            locationConfig.splitWaveIntoSingleSpawnsSettings.enabled = false;
            locationConfig.rogueLighthouseSpawnTimeSettings.enabled = false;
            locationConfig.fixEmptyBotWavesSettings.enabled = false;
            locationConfig.addOpenZonesToAllMaps = false;
            locationConfig.addCustomBotWavesToMaps = false;
            locationConfig.enableBotTypeLimits = false;

            logger.info(
              "SWAG: Vanilla spawn systems disabled"
            );

            return output;
          },
        },
      ],
      "SWAG"
    );

    staticRouterModService.registerStaticRouter(
      `${modName}/client/raid/configuration`,
      [{
        url: "/client/raid/configuration",
        action: (
          url: string,
          info: any,
          sessionID: string,
          output: string
        ): any => {
          try {
            // Retrieve configurations
            const botConfig = container.resolve<ConfigServer>("ConfigServer").getConfig<IBotConfig>(ConfigTypes.BOT);
            const pmcConfig = container.resolve<ConfigServer>("ConfigServer").getConfig<IBotConfig>(ConfigTypes.PMC);

            // Disable PMC conversion
            const conversionTypes = ["assault", "cursedassault", "pmcbot", "exusec", "arenafighter", "arenafighterevent", "crazyassaultevent"];
            conversionTypes.forEach(type => {
              pmcConfig.convertIntoPmcChance[type] = { min: 0, max: 0 };
            });

            logger.info("SWAG: PMC conversion is OFF (this is good - be sure this loads AFTER Realism/SVM)");

            // Adjust time and map caps
            const appContext = container.resolve<ApplicationContext>("ApplicationContext");
            const weatherController = container.resolve<WeatherController>("WeatherController");
            const matchInfoStartOff = appContext.getLatestValue(ContextVariableType.RAID_CONFIGURATION).getValue<IGetRaidConfigurationRequestData>();
            const time = weatherController.generate().time;

            let realTime = time;
            if (matchInfoStartOff.timeVariant === "PAST") {
              let [hours, minutes] = time.split(":").map(Number);
              hours = (hours - 12 + 24) % 24; // Adjust time backwards by 12 hours and ensure it wraps correctly
              realTime = `${hours}:${minutes}`;
            }

            // Determine Time of Day
            let TOD = "day";
            let [hours] = realTime.split(":").map(Number);
            if ((matchInfoStartOff.location !== "factory4_night" && hours >= 5 && hours < 22) ||
              matchInfoStartOff.location === "factory4_day" ||
              matchInfoStartOff.location.toLowerCase() === "laboratory") {
              TOD = "day";
            } else {
              TOD = "night";
            }

            // Set map caps based on Time of Day
            if (TOD === "day") {
              Object.keys(config.MaxBotCap).forEach(key => {
                botConfig.maxBotCap[key] = config.MaxBotCap[key];
              });
            } else { // "night"
              Object.keys(config.NightMaxBotCap).forEach(key => {
                botConfig.maxBotCap[key] = config.NightMaxBotCap[key];
              });
            }
            logger.info(`SWAG: ${TOD} Raid Max Bot Caps set`);

            return HttpResponse.nullResponse();
          } catch (e) {
            logger.error(`SWAG: Failed To modify PMC conversion, you may have more PMCs than you're supposed to. Error: ${e}`);
            return HttpResponse.nullResponse();
          }
        },
      }],
      "SWAG"
    );
  }

  postDBLoad(container: DependencyContainer): void {
    logger = container.resolve<ILogger>("WinstonLogger");
    LocationCallbacks =
      container.resolve<LocationCallbacks>("LocationCallbacks");
    jsonUtil = container.resolve<JsonUtil>("JsonUtil");
    configServer = container.resolve<ConfigServer>("ConfigServer");
    botConfig = configServer.getConfig<IBotConfig>(ConfigTypes.BOT);
    pmcConfig = configServer.getConfig<IBotConfig>(ConfigTypes.PMC);
    databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
    locations = databaseServer.getTables().locations;
    randomUtil = container.resolve<RandomUtil>("RandomUtil");
    seasonalEvents = container.resolve<SeasonalEventService>("SeasonalEventService");
    profileHelper = container.resolve<ProfileHelper>("ProfileHelper");
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
    const foundOpenZones =
      baseobj?.OpenZones?.split(",")
        .filter((name) => !name.includes("Snipe"))
        .filter((name) => name.trim() !== "") ?? [];

    // Sometimes there are zones in the SpawnPointParams that arent listed in the OpenZones, parse these and add them to the list of zones
    baseobj?.SpawnPointParams?.forEach((spawn) => {
      //check spawn for open zones and if it doesn't exist add to end of array
      if (
        spawn?.BotZoneName &&
        !foundOpenZones.includes(spawn.BotZoneName) &&
        !spawn.BotZoneName.includes("Snipe")
      ) {
        foundOpenZones.push(spawn.BotZoneName);
      }
    });

    //logger.info(`SWAG: Open Zones(${map}): ${JSON.stringify(foundOpenZones)}`);
    return foundOpenZones;
  }

  static shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  static ConfigureMaps(): void {

    const bossConfigs: { [key: string]: any[] } = {};
    const otherConfigs: { [key: string]: any[] } = {};
    const customConfigs: { [key: string]: any[] } = {};

    bossSpawnConfigs.forEach(data => {
      Object.keys(data).forEach(mapKey => {
        if (bossConfig.TotalBossesPerMap[mapKey] === 0 || config.disableAllSpawns.bosses) {
          return;
        }

        if (!bossConfigs[mapKey]) {
          bossConfigs[mapKey] = [];
        }

        const filteredBosses = data[mapKey].filter(boss => {

          // ignore boarsniper
          if (boss.BossName == "bossboarsniper") {
            return false;
          }

          const shouldSkip = boss.BossChance === 0 ||
            (bossConfig.Bosses.useGlobalBossSpawnChance &&
              bossConfig.Bosses[reverseBossNames[boss.BossName]][mapKey] === 0);
          return !shouldSkip;
        });

        bossConfigs[mapKey].push(...filteredBosses);
      });
    });

    otherSpawnConfigs.forEach(data => {
      Object.keys(data).forEach(mapKey => {

        if (!otherConfigs[mapKey]) {
          otherConfigs[mapKey] = [];
        }

        const filteredBosses = data[mapKey].filter(boss => {
          const bossType = reverseBossNames[boss.BossName];

          if (config.disableAllSpawns[bossType]) {
            return false;
          }

          const shouldSkip = boss.BossChance === 0 ||
            (config.Spawns.useGlobalSpawnChance && config.Spawns[bossType][mapKey] === 0);

          return !shouldSkip;
        });

        otherConfigs[mapKey].push(...filteredBosses);
      });
    });

    customSpawnConfigs.forEach(data => {
      Object.keys(data).forEach(mapKey => {
        if (!customConfigs[mapKey]) {
          customConfigs[mapKey] = [];
        }

        const filteredBosses = data[mapKey].filter(boss => {

          if (boss.BossName == "gifter") {
            if (!bossConfig.CustomBosses.santa.enabled ||
              (!seasonalEvents.christmasEventEnabled() && !bossConfig.CustomBosses.santa.forceSpawnOutsideEvent)) {
              return false;
            }
          }

          const shouldSkip = boss.BossChance === 0 ||
            !bossConfig.CustomBosses[reverseBossNames[boss.BossName]].enabled ||
            (bossConfig.CustomBosses[reverseBossNames[boss.BossName]].enabled &&
              bossConfig.CustomBosses[reverseBossNames[boss.BossName]][mapKey] === 0);
          return !shouldSkip;
        });

        customConfigs[mapKey].push(...filteredBosses);
      });
    });

    // Shuffle each array within the configuration objects
    Object.values(bossConfigs).forEach(array => this.shuffleArray(array));
    Object.values(otherConfigs).forEach(array => this.shuffleArray(array));
    Object.values(customConfigs).forEach(array => this.shuffleArray(array));

    ClassDef.validMaps.forEach((globalmap: LocationName) => {
      if (bossConfigs[reverseMapNames[globalmap]]) {
        bossConfigs[reverseMapNames[globalmap]].forEach(boss => {
          SWAG.SpawnBosses(boss, globalmap);
          SWAG.bossCount.count += 1;
        });
      }
      // reset boss count for the next map
      SWAG.bossCount.count = 0;

      if (otherConfigs[reverseMapNames[globalmap]]) {
        otherConfigs[reverseMapNames[globalmap]].forEach(spawn => {
          SWAG.SpawnBots(spawn, globalmap);
        });
      }

      if (customConfigs[reverseMapNames[globalmap]]) {
        customConfigs[reverseMapNames[globalmap]].forEach(custom => {
          SWAG.SpawnCustom(custom, globalmap);
        });
      }

      logger.warning(`SWAG: Configured boss spawns for map ${globalmap}`);
    });
  }

  static SpawnBosses(
    boss: ClassDef.BossPattern,
    globalmap: LocationName,
  ): void {

    if (bossConfig.TotalBossesPerMap[reverseMapNames[globalmap]] == 0) {
      config.DebugOutput &&
        logger.info(
          "SWAG: TotalBosses set to 0 for this map, skipping boss spawn"
        );
      return;
    }

    else if (bossConfig.TotalBossesPerMap[reverseMapNames[globalmap]] != -1 && (SWAG.bossCount.count >= bossConfig.TotalBossesPerMap[reverseMapNames[globalmap]])) {
      config.DebugOutput &&
        logger.info(
          "SWAG: Skipping boss spawn as total boss count has been met already"
        );
      return;
    }

    else {
      let wave: BossLocationSpawn = SWAG.ConfigureBossWave(boss, globalmap);
      locations[globalmap].base.BossLocationSpawn.push(wave);
    }
  }

  static SpawnBots(
    boss: ClassDef.BossPattern,
    globalmap: LocationName,
  ): void {

    let wave: BossLocationSpawn = SWAG.ConfigureBossWave(boss, globalmap);
    locations[globalmap].base.BossLocationSpawn.push(wave);
  }

  static SpawnCustom(
    boss: ClassDef.BossPattern,
    globalmap: LocationName,
  ): void {

    let wave: BossLocationSpawn = SWAG.ConfigureBossWave(boss, globalmap);
    locations[globalmap].base.BossLocationSpawn.push(wave);
  }

  static ConfigureBossWave(boss: BossLocationSpawn, globalmap: LocationName): BossLocationSpawn {
    let spawnChance = 0;
    let spawnZones = boss.BossZone || null;
    let bossName = roleCase[boss.BossName.toLowerCase()] || boss.BossName;

    const getRandomDifficulty = () => {
        const availableDifficulties = ["easy", "normal", "hard", "impossible"];
        const randomIndex = Math.floor(Math.random() * availableDifficulties.length);
        return availableDifficulties[randomIndex];
    };

    let difficultyKey = boss.BossDifficult || config.BossDifficulty.toLowerCase();
    let difficulty = difficultyKey === "asonline" ? getRandomDifficulty() : diffProper[difficultyKey];

    let escortDifficultyKey = boss.BossEscortDifficult || config.BossEscortDifficulty.toLowerCase();
    let escort_difficulty = escortDifficultyKey === "asonline" ? getRandomDifficulty() : diffProper[escortDifficultyKey];

    boss?.Supports?.forEach((escort) => {
        escort.BossEscortDifficult = [escort_difficulty];
        escort.BossEscortType = roleCase[escort.BossEscortType.toLowerCase()];
    });

    // exclusive to bosses only
    if (boss.BossName.startsWith("boss")) {
      spawnChance = this.adjustBossSpawnChance(boss, globalmap);
    }
    // something other than bosses
    else if (config.Spawns.useGlobalSpawnChance) {
      spawnChance = config.Spawns[reverseBossNames[boss.BossName]][reverseMapNames[globalmap]];
    }
    else {
      spawnChance = boss.BossChance || 0;
    }

    // zones
    if (spawnZones != null) {
      spawnZones = boss.BossZone || spawnZones;
      if (spawnZones.length > 1) {
        // let's just pick one zone, can't trust BSG to do this correctly
        let random_zone = SWAG.getRandIntInclusive(0, spawnZones.length - 1);
        spawnZones = spawnZones[random_zone];
      }
      // if it's not > 1 and not null, then we'll assume there's a single zone defined instead
      else {
        spawnZones = spawnZones[0];
      }
    }

    // Using the SPT class here
    const wave: BossLocationSpawn = {
      BossName: bossName,
      BossChance: spawnChance,
      BossZone: !!spawnZones
        ? spawnZones
        : SWAG.savedLocationData[globalmap].openZones &&
          SWAG.savedLocationData[globalmap].openZones.length > 0
          ? randomUtil.getStringArrayValue(
            SWAG.savedLocationData[globalmap].openZones
          )
          : "",
      BossPlayer: false,
      BossDifficult: difficulty,
      BossEscortType: roleCase[boss.BossEscortType.toLowerCase()],
      BossEscortDifficult: escort_difficulty,
      BossEscortAmount: boss.BossEscortAmount || "0",
      Time: boss.Time || -1,
      Supports: boss.Supports || null,
      RandomTimeSpawn: boss.RandomTimeSpawn || false,
      TriggerId: boss.TriggerId || "",
      TriggerName: boss.TriggerName || ""
    };

    if (spawnChance != 0) {
      config.DebugOutput && logger.warning(`Configured Boss Wave: ${JSON.stringify(wave)}`);
    }

    return wave;
  }

  static adjustBossSpawnChance(boss: BossLocationSpawn, globalmap: LocationName): number {

    // I need to refactor this garbage
    if (boss.BossName === "bosspunisher") {
      if (bossConfig.CustomBosses.punisher.enabled) {
        if (bossConfig.CustomBosses.punisher.useProgressSpawnChance) {
          const pmcProfile = profileHelper.getPmcProfile(sessionId);
          const profileId = pmcProfile?._id;
          const punisherBossProgressFilePath = path.resolve(
            __dirname,
            `../../PunisherBoss/profiles/${profileId}/progress.json`
          );

          try {
            const progressData = JSON.parse(
              fs.readFileSync(punisherBossProgressFilePath, "utf8")
            );
            return progressData?.actualPunisherChance ?? 1;
          } catch (error) {
            logger.warning(
              "SWAG: Unable to load Punisher Boss progress file, either you don't have the mod installed or you don't have a Punisher progress file yet.",
            );
            return 1;
          }
        } else {
          // if progress spawn chance is not enabled
          return bossConfig.Bosses["punisher"][reverseMapNames[globalmap]];
        }
      } else {
        // if punisher is not enabled
        return 0;
      }
    }


    if (boss.BossName === "bosslegion") {
      if (bossConfig.CustomBosses.legion.enabled) {
        if (bossConfig.CustomBosses.legion.useProgressSpawnChance) {

          const legionBossProgressFilePath = path.resolve(
            __dirname,
            "../../RaidOverhaul/config/LegionChance.json"
          );

          try {
            const progressData = JSON.parse(
              fs.readFileSync(legionBossProgressFilePath, "utf8")
            );
            return progressData?.legionChance ?? 15;

          } catch (error) {
            logger.warning(
              "SWAG: Unable to load Legion Boss progress file, either you don't have the mod installed or you deleted your LegionChance.json."
            );
          }
        }
        // if progress spawn chance is not enabled
        return bossConfig.Bosses["legion"][reverseMapNames[globalmap]];
      }
      // if legion is not enabled
      else {
        return 0;
      }
    }

    // all other bosses...
    else if (bossConfig.Bosses.useGlobalBossSpawnChance) {
      // edge case, only applies to Kaban
      if (boss.BossName == "bossboarsniper") {
        return boss.BossChance;
      }
      return bossConfig.Bosses[reverseBossNames[boss.BossName]][reverseMapNames[globalmap]];
    }

    // if global boss chance is not enabled
    else {
      return boss.BossChance;
    }
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
      locations[map].base.OfflineNewSpawn = false;
      locations[map].base.OfflineOldSpawn = true;
      locations[map].base.NewSpawn = false;
      locations[map].base.OldSpawn = true;
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
        SWAG.savedLocationData[map] = {
          waves: locationBase.waves,
          BossLocationSpawn: locationBase.BossLocationSpawn,
          openZones: this.GetOpenZones(map),
        };
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

module.exports = { mod: new SWAG() };
