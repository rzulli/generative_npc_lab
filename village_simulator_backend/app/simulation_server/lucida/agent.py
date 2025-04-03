
from .simulation.action import *
from .simulation.state import *
from .simulation.orchestrator import *
from .agent import *
from flask_socketio import SocketIO, emit
from flask import current_app as app
from flask import stream_with_context, request, copy_current_request_context
from .simulation.lib.logger import Logger
from nanoid import generate
from .simulation.module import MovementModule, PlanModule
from ..utils import global_id
class ComposedState:
        def __init__(self, **kwargs):
            self._states = kwargs

        def __getattr__(self, name):
            if name in self._states:
                return self._states[name]
            raise AttributeError(f"'ComposedState' object has no attribute '{name}'")

        def __str__(self):
            value = "{"
            for name in self._states:
                value += f" \"{name}\" : {str(self._states[name])},"
            value += "}"
            return value

        def get_dict(self):
            return self._states
        
class Agent:
    
    def __init__(self, world_state :WorldEnvironment, logger : Logger, data, spawn_position, stop_event):
        self.data = data
        self.spawn_position = spawn_position
        self.id = global_id()
        self.stop_event = stop_event
        self.scope = f"agent-{self.id}"
        
        self.logger = logger.clone_with_scope(self.scope)
        self.event_manager = logger.event_manager
        self.atavistic_state = Atavistic(self.logger.clone_with_scope(f"{self.scope}:atavistic"))
        self.conscious_state = Conscious(self.logger.clone_with_scope(f"{self.scope}:conscious"))
        self.entity_state = Entity(self.logger.clone_with_scope(f"{self.scope}:entity"), spawn_position, {"current_world_position":self.data.get("world", {}).get("living_area", "")})
        self.world_state = world_state
        self.agent_state = {"entity": self.entity_state, "atavistic": self.atavistic_state, "conscious_state": self.conscious_state}
        self.global_state = {"world": self.world_state}
      

        self.state = ComposedState(atavistic=self.atavistic_state, conscious=self.conscious_state, world=self.world_state, entity=self.entity_state)
        self.orchestrator = Orchestrator(self.logger.clone_with_scope(f"{self.scope}:orchestrator"), self.state, stop_event)
        #self.orchestrator.register_event('EXECUTE_ACTION_2', ExampleAction3)

        # Update the agent to use static methods of Action classes
        modules = [MovementModule(self.logger), PlanModule(self.logger)]
        self.name = self.data.get("general", {}).get("name", "Unknown")
        self.atavistic_state.set_data("innate", self.data.get("atavistic", {}).get("innate", ""))
        self.atavistic_state.set_data("learned", self.data.get("atavistic", {}).get("learned", ""))
        self.atavistic_state.set_data("currently", self.data.get("atavistic", {}).get("currently", ""))
        self.atavistic_state.set_data("hunger", self.data.get("atavistic", {}).get("hunger", 0))
        self.atavistic_state.set_data("thirst", self.data.get("atavistic", {}).get("thirst", 0))

        #recent_memory = self.data.get("conscious", {}).get("recent_memory", [])
        #for memory in recent_memory:
        #    self.conscious_state.set_data(memory.get("event", ""), memory.get("relevance", 0))

        #self.orchestrator.set_schedule(self.data.get("orchestrator", {}).get("daily_plan", []))
        #self.orchestrator.set_lifestyle(self.data.get("orchestrator", {}).get("lifestyle", ""))

        # self.world = self.data.get("world", {}).get("living_area", "")
        # self.position = self.spawn_position

        self.modules = modules
        self.is_dead = False
        self.logger.log(f"Agent {self.name} created at {spawn_position}")

    def start_agent(self):
        self.is_dead = False
        self.logger.log(f"Agent {self.name} started")
        self.logger.event_manager.emit_event("spawn_agent",  {"name": self.name, "state": self.agent_state}, scope=self.scope)
        self.spawn_modules()
    
    def run_step(self):
        if self.is_dead:
            return self.logger.info(f"Agent {self.name} is dead")
        
        try:
            self.orchestrator.run_step()            
            self.logger.event_manager.emit_event("agent_update", {"name": self.name, "state": self.agent_state}, scope=self.scope)
        except Exception as e:
            self.is_dead = True
            self.logger.info(f"Agent {self.name} is dead")
        
    def stop_agent(self):
        self.orchestrator.stop_all_modules()
        
    def spawn_modules(self):
        for module in self.modules:
            self.orchestrator.spawn_module(module)

