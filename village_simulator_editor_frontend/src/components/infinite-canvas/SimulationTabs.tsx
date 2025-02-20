import AgentState from "./AgentState";
import SimulationState from "./SimulationState";

interface SimulationTabsProps {
    selectedTab: number;
    setSelectedTab: React.Dispatch<React.SetStateAction<number>>;
}

export function SimulationTabs({
    selectedTab,
    setSelectedTab,
}: SimulationTabsProps) {
    return (
        <div
            className="w-full flex h-full gap-1"
            onPointerDown={(e) => e.stopPropagation()}
        >
            <div className="bg-slate-50 min-w-[20%] rounded-lg ">
                <ul className="flex space-y-3 flex-col items-center">
                    <li
                        className={`p-3 rounded-lg hover:bg-slate-100 w-full font-semibold ${
                            selectedTab === 0 ? "bg-slate-200" : ""
                        }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTab(0);
                        }}
                    >
                        Tab 0
                    </li>
                    <li
                        className={`p-3 rounded-lg hover:bg-slate-100 w-full font-semibold ${
                            selectedTab === 1 ? "bg-slate-200" : ""
                        }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTab(1);
                        }}
                    >
                        Tab 1
                    </li>
                    <li
                        className={`p-3 rounded-lg hover:bg-slate-100 w-full font-semibold ${
                            selectedTab === 2 ? "bg-slate-200" : ""
                        }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTab(2);
                        }}
                    >
                        Tab 2
                    </li>
                    <li
                        className={`p-3 rounded-lg hover:bg-slate-100 w-full font-semibold ${
                            selectedTab === 3 ? "bg-slate-200" : ""
                        }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTab(3);
                        }}
                    >
                        Tab 3
                    </li>
                </ul>
            </div>
            <div className="w-full bg-slate-50 p-3 rounded-lg">
                {selectedTab === 0 && <SimulationState />}
                {selectedTab === 1 && <div>Content for Tab 1</div>}
                {selectedTab === 2 && <div>Content for Tab 2</div>}
                {selectedTab === 3 && <div>Content for Tab 3</div>}
            </div>
        </div>
    );
}
