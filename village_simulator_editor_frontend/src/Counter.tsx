import { useState } from "react";

import { useAppDispatch, useAppSelector } from "@/hooks/hooks";

import {
    decrement,
    increment,
    incrementAsync,
    incrementByAmount,
    incrementIfOdd,
    selectCount,
} from "@/store/slices/simulationMetaSlice";
import { loadMap, selectStatus } from "./store/slices/mapMetaSlice";

export const Counter = () => {
    const dispatch = useAppDispatch();
    const count = useAppSelector(selectCount);
    const status = useAppSelector(selectStatus);

    const [incrementAmount, setIncrementAmount] = useState("2");

    const incrementValue = Number(incrementAmount) || 0;

    return (
        <div>
            <div className={"row"}>
                <button
                    className={"button"}
                    aria-label="Decrement value"
                    onClick={() => dispatch(loadMap({ map_uid: "Rr7paNh" }))}
                >
                    -asdasd
                </button>
                <span aria-label="Count" className={"value"}>
                    {count} {status}
                </span>
                <button
                    className={"button"}
                    aria-label="Increment value"
                    onClick={() => dispatch(increment())}
                >
                    +
                </button>
            </div>
            <div className={"row"}>
                <input
                    className={"textbox"}
                    aria-label="Set increment amount"
                    value={incrementAmount}
                    type="number"
                    onChange={(e) => {
                        setIncrementAmount(e.target.value);
                    }}
                />
                <button
                    className={"button"}
                    onClick={() => dispatch(incrementByAmount(incrementValue))}
                >
                    Add Amount
                </button>
                <button
                    className={"asyncButton"}
                    disabled={status !== "idle"}
                    onClick={() => dispatch(incrementAsync(incrementValue))}
                >
                    Add Async
                </button>
                <button
                    className={"button"}
                    onClick={() => {
                        dispatch(incrementIfOdd(incrementValue));
                    }}
                >
                    Add If Odd
                </button>
            </div>
        </div>
    );
};
