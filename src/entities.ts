import { AreaComp, BodyComp, DoubleJumpComp, GameObj, HealthComp, KaboomCtx, OpacityComp, PosComp, ScaleComp, SpriteComp } from "kaboom";
import { scale } from "./constants";

//Creating a specific player game obj because we expect certain actions from players
type PlayerGameObj = GameObj<
    SpriteComp &
    AreaComp &
    BodyComp &
    PosComp &
    ScaleComp &
    DoubleJumpComp &
    HealthComp &
    OpacityComp & {
        speed: number;
        direction: string;
        isInhaling: boolean;
        isFull: boolean;
    }
>;

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
        //default values for player
        {
            speed: 300,
            direction: "right",
            isInhaling: false,
            isFull: false,
        },
        "player",
    ]);

    //if player collides with enemy. async so code doesn't keep running while below things are happening
    player.onCollide("enemy", async (enemy: GameObj) => {

        //destroys enemy if player is inhaling and enemy is inhalable
        if (player.isInhaling && enemy.isInhalable) {
            player.isInhaling = false;
            k.destroy(enemy);
            player.isFull = true;
            return;
        }

        //respawn mechanic if player hp drops to 0
        if (player.hp() === 0) {
            k.destroy(player);
            k.go("level-1");
            return;
        }

        //if none of above things are true, reduce player hp by 1
        player.hurt();

        //tween is basically a loop. gives us flashing effect. turns value from 1 to 0 in given time frame, then 0 to 1 in next tween
        await k.tween(
            player.opacity,
            0,
            0.05,
            (val) => (player.opacity = val),
            k.easings.linear
        );
        await k.tween(
            player.opacity,
            1,
            0.05,
            (val) => (player.opacity = val),
            k.easings.linear
        );
    });

    //when player hits the exit, go to next scene
    player.onCollide("exit", () => {
        k.go("level-2");
    });

    //adds inhale effect as a const and sets opacity to 0
    const inhaleEffect = k.add([
        k.sprite("assets", {anim: "kirbInhaleEffect"}),
        k.pos(),
        k.scale(scale),
        k.opacity(0),
        "inhaleEffect",
    ]);

    //creates the inhale zone based on player
    const inhaleZone = player.add([
        k.area({ shape: new k.Rect(k.vec2(0), 20, 4) }),
        k.pos(),
        "inhaleZone",
    ]);

    //allows us to flip inhale zone & anim based on if player is facing left or right
    inhaleZone.onUpdate(() => {
        if (player.direction === "left") {
            inhaleZone.pos = k.vec2(-14, 8);
            inhaleEffect.pos = k.vec2(player.pos.x - 60, player.pos.y + 0);
            inhaleEffect.flipX = true;
            return;
        }
        inhaleZone.pos = k.vec2(14, 8);
        inhaleEffect.pos = k.vec2(player.pos.x + 60, player.pos.y + 0);
        inhaleEffect.flipX = false;
    });

    //pos y value means player is falling and "dies" so we respawn them
    player.onUpdate(() => {
        if (player.pos.y > 2000) {
            k.go("level-1");
        }
    });

    return player;
}



export function setControls(k: KaboomCtx, player: PlayerGameObj) {
    const inhaleEffectRef = k.get("inhaleEffect")[0];

    k.onKeyDown((key) => {
        if (key === "a") {
            player.direction = "left";
            player.flipX = true;
            player.move(-player.speed, 0);
        }
        if (key === "d") {
            player.direction = "right";
            player.flipX = false;
            player.move(player.speed, 0);
        }
        if (key === ".") {
            if (player.isFull) {
                player.play("kirbFull");
                inhaleEffectRef.opacity = 0;
            }
            player.isInhaling = true;
            player.play("kirbInhaling");
            inhaleEffectRef.opacity = 1;
        }
        
    });

    k.onKeyPress((key) => {
        if (key === "space") { player.doubleJump(); }
    });

    k.onKeyRelease((key) => {
        if (key === ".") {
            if(player.isFull) {
                //kirbInhaling works for both inhaling and shooting the star
                player.play("kirbInhaling");

                //adding the shootingStar obj into game and logic on how to display it and it's movement based on player direction
                const shootingStar = k.add([
                    k.sprite("assets", {
                        anim: "shootingStar",
                        flipX: player.direction === "right",
                    }),
                    k.area({ shape: new k.Rect(k.vec2(5, 4), 6, 6) }),
                    k.pos(
                        player.direction === "left" ? player.pos.x = 80 : player.pos.x + 80,
                        player.pos.y + 5
                    ),
                    k.scale(scale),
                    player.direction === "left"
                    ? k.move(k.LEFT, 800)
                    : k.move(k.RIGHT, 800),
                    "shootingStar",
                ]);
            shootingStar.onCollide("platform", () => k.destroy(shootingStar));
            
            player.isFull = false;
            k.wait(1, () => player.play("kirbIdle"));
            return;
            }

            inhaleEffectRef.opacity = 0;
            player.isInhaling = false;
            player.play("kirbIdle");
        }
    })
}