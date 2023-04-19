import { DependencyContainer } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import type { StaticRouterModService } from "@spt-aki/services/mod/staticRouter/StaticRouterModService";
import { HttpResponseUtil } from "@spt-aki/utils/HttpResponseUtil";


import { Utils } from "./utils"; //this is how you import and use other classes in other .ts files
const exampleJSON = require("../db/example.json"); //this is how you import json files into the project from your db folder or any other folder.



class Mod implements IPreAkiLoadMod {

    public preAkiLoad(container: DependencyContainer): void {

        const utils = new Utils(); //you need to instantiate your other classes like this

        const logger = container.resolve<ILogger>("WinstonLogger"); // these are classes from the SPT server that we can use.
        const staticRouterModService = container.resolve<StaticRouterModService>("StaticRouterModService");
        const HttpResponse = container.resolve<HttpResponseUtil>("HttpResponseUtil");


        //this is a route hook. This one in particular fires at the start of a raid. We have to make our changes to bots here because this is where Realism Mod does it. 
        //Makes sure this mod is last in load order so it overrwrites Realism.
        staticRouterModService.registerStaticRouter(
            "raidStart",
            [
                {
                    url: "/client/raid/configuration",
                    action: (url, info, sessionID, output) => {

                        try {
                            //This fetches SPT's database so that we can access it and modify it.
                            //At this point, Realism Mod has already modified the server DB, so any changes we make here will overrwite whatever changes Realism mod made.
                            const tables = container.resolve<DatabaseServer>("DatabaseServer").getTables();

                            //I recommend carefully looking at the original database files to make sure everything is in the correct format before you make changes.
                            //Bot data is located at Aki_Data/Sever/database/bots/types

                            //this is the server's version of the Bear LO file (as modified by Realism).
                            //this makes it cleaner and faster to access the same bot type in the future:
                            const bearDB = tables.bots.types["bear"];

                            //we can make the same shortcut for our own files like this:
                            const myBearAppearance = exampleJSON.appearance_bear;

                            //say we want to change the appearance of BEAR PMCs by completely overwriting the server's/Realism's values with our own:
                            bearDB.appearance = myBearAppearance;

                            //say we want to instead only replace the heads:
                            bearDB.appearance.head = myBearAppearance.head;

                            //to get item IDs, you can use this website: https://db.sp-tarkov.com/search

                            //Instead of referencing your own JSON file in the DB, you could do it all in code instead:
                            //in this case, head is an array that holds strings (anything in quotes, like names and IDs is a string), so we set it our own array of strings
                            //you can tell it's an array by the use of square brackets.
                            bearDB.appearance.head = [
                                "5cc084dd14c02e000b0550a3",
                                "5fdb50bb2b730a787b3f78cf",
                                "5fdb7571e4ed5b5ea251e529"
                            ];

                            //if it's using curly braces {}, then it's a JSON object and we treat it slightly different:
                            //in this case, this JSON object has what's called key-value pairs. The key is the string ID, and the value is the number.
                            //in this case, the number is the odds of that item being used when generating the bot, so we can increase the odds of certain items appearing.
                            bearDB.appearance.feet = {
                                "5cc085bb14c02e000e67a5c5": 1,
                                "5d1f588e86f7744bcc048753": 5,
                                "5d1f58a086f7743f8362bcd9": 1,
                                "5d1f58ab86f7743014162042": 2,
                                "5d1f58bd86f7744bce0ee9ef": 3,
                                "5d1f58cb86f7744bca3f0b9a": 1,
                                "5df89f8f86f77412672a1e38": 7,
                                "5e4bb39386f774067f79de05": 1,
                                "5e9dc97c86f774054c19ac9a": 8,
                                "5f5e40400bc58666c37e7819": 1,
                                "5fce3e965a9f8c40685693bc": 9,
                                "6033a3d8ed2e0509b15f9031": 12,
                                "617be9e4e02b3b3fa50fa8f2": 1
                            };

                            //if it's a nested JSON object (an object containing more objects), like appearance is, we have to do it like so:
                            //it's very important that we make sure appearance is getting all of the objects it's suppsed to (body, feet etc.)
                            //in this case I only hve one item per object for brevity.
                            bearDB.appearance = {
                                "body": {
                                    "5cc0858d14c02e000c6bea66": 1
                                },
                                "feet": {
                                    "5cc085bb14c02e000e67a5c5": 1
                                },
                                "hands": [
                                    "5cc0876314c02e000c6bea6b"
                                ],
                                "head": [
                                    "5cc084dd14c02e000b0550a3"
                                ],
                                "voice": [
                                    "Bear_1",
                                ]
                            };

                            //neither way of doing it, via your own JSON file or through code, is better than the other. They have their advantages and disadvantages. You're less likely to make mistakes doing it in code,
                            //but the file might start getting very long depending on how many changes you make.

                            //say we want to only add something to the database, instead of actually replacing anything:
                            //If it's an array we are modifying, we can use the push method which takes an argument of the item ID of the item we want to push. In this case we are pushing the ID for a USEC head.
                            //The end result is that the original head array is preserved, and we are just adding a new item to it.
                            //this is best practice if you only want to add new items, rather than removing or replacing items.
                            bearDB.appearance.head.push("60a6aa8fd559ae040d0d951f");
                            //we can push multiple items like so:
                            bearDB.appearance.head.push("60a6aa8fd559ae040d0d951f", "619f9e338858a474c8685cc9");

                            //if we want to push an item to a JSON object that's a key-value pair, we have to do it like this:
                            bearDB.appearance.feet["5d1f58cb86f7744bca3f0b9a"] = 1;

                            return HttpResponse.nullResponse();
                        }
                        catch (e) {
                            logger.error("INSERT MOD NAME HERE: Failed To Modify DB At Raid Start" + e);
                            return HttpResponse.nullResponse();
                        }
                    }
                }
            ],
            "INSERT MOD NAME HERE"
        );
    }
}

module.exports = { mod: new Mod() }
