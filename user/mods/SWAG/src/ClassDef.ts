import {
  BossLocationSpawn,
} from "@spt-aki/models/eft/common/ILocationBase";

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
  bloodhound: "arenaFighterEvent",
  crazyscavs: "crazyAssaultEvent"
};

export const reverseBossNames: object = {
  bossbully: "reshala",
  bosstagilla: "tagilla",
  bossgluhar: "glukhar",
  bosskilla: "killa",
  bosskojaniy: "shturman",
  bosssanitar: "sanitar",
  bossknight: "goons",
  bosszryachiy: "zryachiy",
  marksman: "snipers",
  sectantpriest: "cultists",
  exusec: "rogues",
  crazyassaultevent: "crazyscavs",
  arenafighterevent: "bloodhounds"
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
