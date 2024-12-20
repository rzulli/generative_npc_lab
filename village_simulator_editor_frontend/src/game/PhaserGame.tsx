import {
    forwardRef,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
} from "react";
import StartGame from "./main";
import { EventBus } from "./EventBus";
import useSimulation from "../context/SimulationContext";
import { SimulationContext } from "@/hooks/useSimulationContext";

export interface IRefPhaserGame {
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
}

interface IProps {}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(
    function PhaserGame({}, ref) {
        const { mapMeta } = useContext(SimulationContext);

        const game = useRef<Phaser.Game | null>(null!);

        useLayoutEffect(() => {
            if (game.current === null) {
                game.current = StartGame("game-container");

                if (typeof ref === "function") {
                    ref({ game: game.current, scene: null });
                } else if (ref) {
                    ref.current = { game: game.current, scene: null };
                }
            }

            return () => {
                if (game.current) {
                    game.current.destroy(true);
                    if (game.current !== null) {
                        game.current = null;
                    }
                }
            };
        }, [ref]);

        return <div id="game-container"></div>;
    }
);

