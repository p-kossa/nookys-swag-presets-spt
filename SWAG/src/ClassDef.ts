import {
  BossLocationSpawn,
  WildSpawnType,
} from "@spt-aki/models/eft/common/ILocationBase";

export interface SWAGConfig {
  aiDifficulty: "normal" | "easy" | "hard" | "impossible" | "random";
  aiAmount: "low" | "asonline" | "medium" | "high" | "horde";
  RandomWaveCount: number;
  BossWaveCount: number;
  BossChance: {
    gluhar: number;
    killa: number;
    tagilla: number;
    zryachiy: number;
    sanitar: number;
    reshala: number;
    shturman: number;
    goons: number;
    cultists: number;
  };
  SkipOtherBossWavesIfBossWaveSelected: boolean;
  GlobalRandomWaveTimer: {
    WaveTimerMinSec: number;
    WaveTimerMaxSec: number;
  };
  MaxBotCap: {
    factory: number;
    customs: number;
    woods: number;
    shoreline: number;
    lighthouse: number;
    reservebase: number;
    interchange: number;
    laboratory: number;
    tarkovstreets: number;
  };
  NightMaxBotCap: {
    factory_night: number;
    customs: number;
    woods: number;
    shoreline: number;
    lighthouse: number;
    reservebase: number;
    interchange: number;
    laboratory: number;
    tarkovstreets: number;
  };
  MaxBotPerZone: number;
  UseDefaultSpawns: {
    Waves: boolean;
    Bosses: boolean;
    TriggeredWaves: boolean;
  };
  DebugOutput: boolean;
}

export class GlobalRandomWaveTimer {
  static WaveTimerMinSec: number;
  static WaveTimerMaxSec: number;
}

export interface BossPattern extends BossLocationSpawn {
  OnlySpawnOnce?: boolean;
}

export class Bot {
  BotType: string;
  MaxBotCount: number;
}

export class GroupPattern {
  Name: string;
  Bots: Bot[];
  Time_min: number;
  Time_max: number;
  BotZone: string;
  RandomTimeSpawn?: boolean;
  OnlySpawnOnce?: boolean;
}

export class MapWrapper {
  MapName: string;
  MapGroups: GroupPattern[];
  MapBosses: BossPattern[];
}

export class SpawnPointParam {
  Id: string;
  Position: Position;
  Rotation: number;
  Sides: string[];
  Categories: string[];
  Infiltration: string;
  DelayToCanSpawnSec: number;
  ColliderParams: ColliderParams;
  BotZoneName: string;
}

export class Position {
  x: number;
  y: number;
  z: number;
}

export class ColliderParams {
  _parent: string;
  _props: Props;
}

export class Center {
  x: number;
  y: number;
  z: number;
}

export class Props {
  Center: Center;
  Radius: number;
}

export const roles: string[] = [
  "assault",
  "exusec",
  "marksman",
  "pmcbot",
  "sectantpriest",
  "sectantwarrior",
  "assaultgroup",
  "bossbully",
  "bosstagilla",
  "bossgluhar",
  "bosskilla",
  "bosskojaniy",
  "bosssanitar",
  "followerbully",
  "followergluharassault",
  "followergluharscout",
  "followergluharsecurity",
  "followergluharsnipe",
  "followerkojaniy",
  "followersanitar",
  "followertagilla",
  "cursedassault",
  "pmc",
  "usec",
  "bear",
  "sptbear",
  "sptusec",
  "bosstest",
  "followertest",
  "gifter",
  "bossknight",
  "followerbigpipe",
  "followerbirdeye",
  "bosszryachiy",
  "followerzryachiy",
];

export const roleCase: object = {
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
  bloodhound: "arenaFighterEvent"
};

export const reverseMapNames: object = {
  factory4_day: "factory",
  factory4_night: "factory_night",
  bigmap: "customs",
  woods: "woods",
  shoreline: "shoreline",
  lighthouse: "lighthouse",
  rezervbase: "reserve",
  interchange: "interchange",
  laboratory: "laboratory",
  tarkovstreets: "streets"
};

export const diffProper = {
  easy: "easy",
  asonline: "normal",
  normal: "normal",
  hard: "hard",
  impossible: "impossible",
  random: "random",
};

export const pmcType: string[] = ["sptbear", "sptusec"];

export const validMaps: string[] = [
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

export const aiAmountProper = {
  low: 0.5,
  asonline: 1,
  medium: 1,
  high: 2,
  horde: 4,
};
