

class Action:
    @staticmethod
    def execute(logger, state, orchestrator):
        raise NotImplementedError("Subclasses should implement this!")
    
    def __init__(self, logger, name):
        self.logger = logger
        self.name = name
        self.cost = 1
        self.preconditions = set()
        self.effects = set()
        self.strategy = None

    def start(self):
        self.strategy.start()

    def update(self, delta_time):
        if self.strategy.can_perform():
            self.strategy.update(delta_time)
        
        if not self.strategy.complete:
            return
        
        for effect in self.effects:
            effect.evaluate()

    def stop(self):
        self.strategy.stop()

    @property
    def complete(self):
        return self.strategy.complete

    class Builder:
        def __init__(self, name):
            self.action = Action(name)

        def with_cost(self, cost):
            self.action.cost = cost
            return self

        def with_strategy(self, strategy):
            self.action.strategy = strategy
            return self

        def add_precondition(self, precondition):
            self.action.preconditions.add(precondition)
            return self

        def add_effect(self, effect):
            self.action.effects.add(effect)
            return self

        def build(self):
            return self.action
        
        
class ExampleAction(Action):
    @staticmethod
    def execute(logger, state, orchestrator):
        current_value = state.get_data('value')
        logger.error(f"ExampleAction value {current_value}")
        state.set_data('value', current_value + 1 if current_value else 1,log=True)

class ExampleAction2(Action):
    @staticmethod
    def execute(logger, state, orchestrator):
        current_value = state.get_data('value')
        logger.log(f"ExampleAction2 value {current_value}")
        state.set_data('value', current_value + 2 if current_value else 2,log=True)

class ExampleAction3(Action):
    @staticmethod
    def execute(logger, state, orchestrator):
        current_value = state.get_data('value')
        logger.log(f"ExampleAction3 value {current_value}")
        state.set_data('value', current_value + 1 if current_value else 1,log=True)
        orchestrator.trigger_event('EXECUTE_ACTION_2', state)