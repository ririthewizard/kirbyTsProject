import { GameObj, KaboomCtx } from "kaboom";
import { scale } from "./constants";

export function makePlayer(k: KaboomCtx, posX: number, posY: number) {
    const player = k.make([
        k.sprite("assets", { anim: "kirbIdle" }),
        k.area({ shape: new k.Rect(k.vec2(4, 5.9), 8, 10) }),
        k.body(),
        k.pos(posX * scale, posY * scale),
        k.scale(scale),
        k.doubleJump(10),
        k.health(3),
        k.opacity(1),
        {
            speed: 300,
            direction: "right",
            isInhaling: false,
            isFull: false,
        },
        "player",
    ]);

    player.onCollide("enemy", async (enemy: GameObj) => {
        if (player.isInhaling && enemy.isInhalable) {
            player.isInhaling = false;
            k.destroy(enemy);
            player.isFull = true;
            return;
        }

        if (player.hp() === 0) {
            k.destroy(player);
            k.go("level-2");
            return;
        }
    })
}