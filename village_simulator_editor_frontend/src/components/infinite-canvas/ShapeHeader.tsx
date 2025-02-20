export function ShapeHeader({ children, shape }) {
    return (
        <>
            {shape && (
                <div
                    className={`w-full flex items-center gap-5 ${
                        !shape.isLocked ? "cursor-move" : "cursor-no-drop"
                    }`}
                >
                    {children}
                </div>
            )}
        </>
    );
}
