class AgentGoal:
    def __init__(self, name: str):
        self.name = name
        self.priority = 0.0
        self.desired_effects = set()

    class Builder:
        def __init__(self, name: str):
            self.goal = AgentGoal(name)

        def with_priority(self, priority: float):
            self.goal.priority = priority
            return self

        def with_desired_effect(self, effect):
            self.goal.desired_effects.add(effect)
            return self

        def build(self):
            return self.goal