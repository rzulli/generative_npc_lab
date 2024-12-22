import { State } from "../lib/stateMachine/StateMachine";

interface NewType {
    count: number;
}
class IdleState extends State<NewType, string> {
    onEnter(): void {
        console.log("Entering Idle State");
    }

    onExit(): void {
        console.log("Exiting Idle State");
    }

    onEvent(event: string): State<NewType, string> | null {
        this.context.count;
        if (event === "start") {
            console.log("Transitioning to Loading State");
            return null;
        }
        return null; // Fica no estado atual
    }
}
