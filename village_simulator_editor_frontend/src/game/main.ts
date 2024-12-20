import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { Game as MainGame } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";
import { SimulationScene } from "./scenes/SimulationScene";
import { TestScene } from "./scenes/TestScene";
import { EditorScene } from "./scenes/editor/EditorScene";
export const initialState = {
    "Isabella Rodriguez": {
        maze: "the_ville",
        x: 72,
        y: 14,
    },
    "Klaus Mueller": {
        maze: "the_ville",
        x: 126,
        y: 46,
    },
    "Maria Lopez": {
        maze: "the_ville",
        x: 123,
        y: 57,
    },
};

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: "100%",
    height: "94%",
    parent: "game-container",
    backgroundColor: "#028af8",
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver,
        TestScene,
        SimulationScene,
        EditorScene,
    ],
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
        },
    },
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;

