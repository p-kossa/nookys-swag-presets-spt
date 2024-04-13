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
  bossboar: "bossBoar",
  bossboarsniper: "bossBoarSniper",
  bosskolontay: "bossKolontay",
  bosspunisher: "bosspunisher",
  bosslegion: "bosslegion",
  followerboar: "followerBoar",
  followerboarclose1: "followerBoarClose1",
  followerboarclose2: "followerBoarClose2",
  followerbully: "followerBully",
  followergluharassault: "followerGluharAssault",
  followergluharscout: "followerGluharScout",
  followergluharsecurity: "followerGluharSecurity",
  followergluharsnipe: "followerGluharSnipe",
  followerkojaniy: "followerKojaniy",
  followersanitar: "followerSanitar",
  followertagilla: "followerTagilla",
  followerkolontayassault: "followerKolontayAssault",
  followerkolontaysecurity: "followerKolontaySecurity",
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
  arenafighterevent: "arenaFighterEvent",
  crazyassaultevent: "crazyAssaultEvent"
};

export const reverseBossNames: object = {
  bossboar: "kaban",
  bossbully: "reshala",
  bosstagilla: "tagilla",
  bossgluhar: "gluhar",
  bosskilla: "killa",
  bosskojaniy: "shturman",
  bosssanitar: "sanitar",
  bossknight: "goons",
  bosszryachiy: "zryachiy",
  bosskolontay: "kolontay",
  marksman: "scav_snipers",
  sectantpriest: "cultists",
  exusec: "rogues",
  pmcbot: "raiders",
  crazyassaultevent: "crazyscavs",
  arenafighterevent: "bloodhounds",
  bosspunisher: "punisher",
  bosslegion: "legion",
  gifter: "santa"
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
  tarkovstreets: "streets",
  sandbox: "groundzero"
};

export const diffProper = {
  easy: "easy",
  asonline: "random",
  normal: "normal",
  hard: "hard",
  impossible: "impossible"
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
  "sandbox"
];

export const aiAmountProper = {
  low: 0.5,
  asonline: 1,
  medium: 1,
  high: 2,
  horde: 4,
};
