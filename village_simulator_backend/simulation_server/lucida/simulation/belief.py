class BeliefFactory:
    def __init__(self, agent, beliefs):
        self.agent = agent
        self.beliefs = beliefs

    def add_belief(self, key, condition):
        self.beliefs[key] = AgentBelief.Builder(key).with_condition(condition).build()

    def add_sensor_belief(self, key, sensor):
        self.beliefs[key] = AgentBelief.Builder(key) \
            .with_condition(lambda: sensor.is_target_in_range()) \
            .with_location(lambda: sensor.target_position()) \
            .build()

    def add_location_belief(self, key, distance, location_condition):
        if isinstance(location_condition, tuple):
            self._add_location_belief(key, distance, location_condition)
        else:
            self._add_location_belief(key, distance, location_condition.position)

    def _add_location_belief(self, key, distance, location_condition):
        self.beliefs[key] = AgentBelief.Builder(key) \
            .with_condition(lambda: self.in_range_of(location_condition, distance)) \
            .with_location(lambda: location_condition) \
            .build()

    def in_range_of(self, pos, range):
        return self.agent.transform.position.distance_to(pos) < range


class AgentBelief:
    def __init__(self, name):
        self.name = name
        self.condition = lambda: False
        self.observed_location = lambda: (0, 0, 0)

    @property
    def location(self):
        return self.observed_location()

    def evaluate(self):
        return self.condition()

    class Builder:
        def __init__(self, name):
            self.belief = AgentBelief(name)

        def with_condition(self, condition):
            self.belief.condition = condition
            return self

        def with_location(self, observed_location):
            self.belief.observed_location = observed_location
            return self

        def build(self):
            return self.belief