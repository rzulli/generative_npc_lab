import { Scene } from "phaser";
import { player, cursors, initialState } from "../main";
export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
        let { width, height } = this.sys.game.canvas;

        //  A simple progress bar. This is the outline of the bar.
        this.add
            .rectangle(width / 2, 384, width / 2, 32)
            .setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(width / 4, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on("progress", (progress: number) => {
            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (width / 2) * progress;
        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        // this.load.setPath("assets");

        // this.load.image(
        //     "blocks_1",
        //     "simulation/the_ville/visuals/map_assets/blocks/blocks_1.png"
        // );
        // this.load.image(
        //     "walls",
        //     "simulation/the_ville/visuals/map_assets/v1/Room_Builder_32x32.png"
        // );
        // this.load.image(
        //     "interiors_pt1",
        //     "simulation/the_ville/visuals/map_assets/v1/interiors_pt1.png"
        // );
        // this.load.image(
        //     "interiors_pt2",
        //     "simulation/the_ville/visuals/map_assets/v1/interiors_pt2.png"
        // );
        // this.load.image(
        //     "interiors_pt3",
        //     "simulation/the_ville/visuals/map_assets/v1/interiors_pt3.png"
        // );
        // this.load.image(
        //     "interiors_pt4",
        //     "simulation/the_ville/visuals/map_assets/v1/interiors_pt4.png"
        // );
        // this.load.image(
        //     "interiors_pt5",
        //     "simulation/the_ville/visuals/map_assets/v1/interiors_pt5.png"
        // );
        // this.load.image(
        //     "CuteRPG_Field_B",
        //     "simulation/the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Field_B.png"
        // );
        // this.load.image(
        //     "CuteRPG_Field_C",
        //     "simulation/the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Field_C.png"
        // );
        // this.load.image(
        //     "CuteRPG_Harbor_C",
        //     "simulation/the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Harbor_C.png"
        // );
        // this.load.image(
        //     "CuteRPG_Village_B",
        //     "simulation/the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Village_B.png"
        // );
        // this.load.image(
        //     "CuteRPG_Forest_B",
        //     "simulation/the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Forest_B.png"
        // );
        // this.load.image(
        //     "CuteRPG_Desert_C",
        //     "simulation/the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Desert_C.png"
        // );
        // this.load.image(
        //     "CuteRPG_Mountains_B",
        //     "simulation/the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Mountains_B.png"
        // );
        // this.load.image(
        //     "CuteRPG_Desert_B",
        //     "simulation/the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Desert_B.png"
        // );
        // this.load.image(
        //     "CuteRPG_Forest_C",
        //     "simulation/the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Forest_C.png"
        // );

        // Joon: This is the export json file you get from Tiled.

        // An atlas is a way to pack multiple images together into one texture. I'm
        // using it to load all the player animations (walking left, walking right,
        // etc.) in one image. For more info see:
        // https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
        // If you don't use an atlas, you can do the same thing with a spritesheet,
        // see: https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
        // Joon: Technically, I think this guy had the best tutorial for atlas:
        //       https://www.youtube.com/watch?v=fdXcD9X4NrQ&ab_channel=MorganPage
        this.load.atlas(
            "atlas",
            "assets/simulation/characters/atlas.png",
            "assets/simulation/characters/atlas.json"
        );
    }

    create() {
        this.registry.set("personas", {});
        this.registry.set("pronunciatios", {});
        this.registry.set("step", 1);
        this.registry.set("sim_code", "teste");
        let persona_names = {};
        for (let [person, position] of Object.entries(initialState)) {
            persona_names[person] = [
                parseInt(position.x),
                parseInt(position.y),
            ];
        }
        console.log(persona_names);
        this.registry.set("persona_names", persona_names);
        var spawn_tile_loc = {};
        // for (var i = 0; i < persona_names.length; i++) {
        // 	spawn_tile_loc[persona_names[i]] = [0, 0]
        // }

        for (var key in persona_names) {
            spawn_tile_loc[key] = persona_names[key];
        }
        console.log(spawn_tile_loc);
        this.registry.set("spawn_tile_loc", spawn_tile_loc);
        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    }

    update(time: number, delta: number): void {
        this.scene.start("EditorScene");
    }
}

