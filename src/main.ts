import { Boot } from "./scenes/Boot";
import { Game as MainGame } from "./scenes/Game";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";

import { Game, Types } from "phaser";

const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: "board",
    backgroundColor: "#000",
    pixelArt: false,
    fps: { limit: 60 }, // haha... oh, just realised tick tied to refresh. Oops
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [Boot, Preloader, MainMenu, MainGame, GameOver],
};

export default new Game(config);
