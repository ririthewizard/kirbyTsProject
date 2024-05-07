import { k } from "./kaboomCtx";
import { makeMap } from "./utils";

async function gameSetup() {
    //loads all the character sprites we need once so we don't continuously load them
    k.loadSprite("assets", "./kirby-like.png", {
        sliceX: 9,
        sliceY: 10,
        anims: {
            kirbIdle: 0,
            kirbInhaling: 1,
            kirbFull: 2,
            kirbInhaleEffect: { from: 3, to: 8, speed: 15, loop: true },
            shootingStar: 9,
            flame: { from: 36, to: 37, speed: 4, loop: true },
            guyIdle: 18,
            guyWalk: { from: 18, to: 19, speed: 4, loop: true },
            bird: { from: 27, to: 28, speed: 4, loop: true },
        },
    });

    //loads first level sprite
    k.loadSprite("level-1", "./level-1.png");

    //destructure const so adding maps with spawn points doesnt get confusing/buggy later on
    const { map: level1Layout, spawnPoints: level1SpawnPoints } = await makeMap(k, "level-1");

    //sets gravity and bg to first level
    k.scene("level-1", () => {
        k.setGravity(2100);
        k.add([
            k.rect(k.width(), k.height()),
            k.color(k.Color.fromHex("#f7d7db")),
            k.fixed(),
        ]);

        k.add(level1Layout);
    
    });

    k.go("level-1");
}

gameSetup();
