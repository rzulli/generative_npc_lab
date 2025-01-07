
from .simulation.action import *
from .simulation.state import *
from .simulation.orchestrator import *
from .agent import *

from nanoid import generate
class Agent:
    def __init__(self, logger, data, spawn_position):
        self.data = data
        self.spawn_position = spawn_position
        self.id = generate(size=4)
        self.logger = logger.clone_with_scope(f"agent-{self.id}")
        self.atavistic_state = Atavistic(self.logger.clone_with_scope(f"agent-{self.id}-atavistic"))
        self.conscious_state = Conscious(self.logger.clone_with_scope(f"agent-{self.id}-conscious"))
        self.orchestrator = Orchestrator(self.logger.clone_with_scope(f"agent-{self.id}-orchestrator"))

        # Update the orchestrator to work with static methods of Action classes
        #self.orchestrator.register_event('EXECUTE_ACTION_2', ExampleAction3)

        # Update the agent to use static methods of Action classes
        modules = [ExampleAction, ExampleAction2, ExampleAction3]
        self.name = self.data["name"]
        self.atavistic_state = self.atavistic_state
        self.conscious_state = self.conscious_state
        self.orchestrator = self.orchestrator
        self.modules = modules
        self.conscious_state.set_data("value", 0)

    def start_agent(self):
        self.execute_modules()
    
    def join_agent(self):
        self.orchestrator.wait_for_completion()
        
    def execute_modules(self):
        for module in self.modules:
            self.orchestrator.execute_module(module, self.conscious_state)

    def __del__(self):
        self.logger.stop()
    
class AgentBuilder:
    def __init__(self):
        self.name = None
        self.atavistic_state = None
        self.conscious_state = None
        self.orchestrator = None
        self.modules = []

    def set_name(self, name):
        self.name = name
        return self

    def set_atavistic_state(self, atavistic_state):
        self.atavistic_state = atavistic_state
        return self

    def set_conscious_state(self, conscious_state):
        self.conscious_state = conscious_state
        return self

    def set_orchestrator(self, orchestrator):
        self.orchestrator = orchestrator
        return self

    def add_module(self, module):
        self.modules.append(module)
        return self

    def build(self):
        return Agent(self.name, self.atavistic_state, self.conscious_state, self.orchestrator, self.modules)

