import eventlet
from flask import Flask, request, jsonify
import sqlite3
from .simulation.lib.logger import LoggerBuilder, Logger
import time
from .simulation.action import *
from .simulation.state import *
from .simulation.orchestrator import *
from .agent import *
import json
from datetime import datetime

MAX_TIMEOUT = 60  # Set your desired timeout in seconds

agent_list = [
    {
        "general": {
            "name": "Abigail Chen",
            "first_name": "Abigail",
            "last_name": "Chen",
            "age": 25,
            "id": 1
        },
        "atavistic": {
            "innate": "open-minded, curious, determined",
            "learned": "Abigail Chen is a digital artist and animator who loves to explore how technology can be used to express ideas. She is always looking for new ways to combine art and technology.",
            "currently": "Abigail Chen is working on an animation project for a client. She is also experimenting with different tools and techniques to create interactive art.",
            "hunger": 50,
            "thirst": 50
        },
        "conscious": {
            "recent_memory": [
                {"event": "Started new animation project", "relevance": 8},
                {"event": "Experimented with new art tools", "relevance": 6}
            ]
        },
        "world": {
            "living_area": "the Ville:artist's co-living space:Abigail Chen's room",
            "position": None  # To be filled with agent spawn
        },
        "orchestrator": {
            "lifestyle": "Abigail Chen goes to bed around midnight, wakes up around 8am, eats dinner around 6pm.",
            "daily_plan": [
                {"time": "8:00", "task": "Wake up"},
                {"time": "9:00", "task": "Work on animation project"},
                {"time": "12:00", "task": "Lunch"},
                {"time": "13:00", "task": "Experiment with art tools"},
                {"time": "18:00", "task": "Dinner"},
                {"time": "19:00", "task": "Relax and unwind"},
                {"time": "24:00", "task": "Go to bed"}
            ]
        }
    },
    {
        "general": {
            "name": "John Lin",
            "first_name": "John",
            "last_name": "Lin",
            "age": 45,
            "id": 2
        },
        "atavistic": {
            "innate": "patient, kind, organized",
            "learned": "John Lin is a pharmacy shop keeper at the Willow Market and Pharmacy who loves to help people. He is always looking for ways to make the process of getting medication easier for his customers.",
            "currently": "John Lin is living with his wife, Mei Lin, and son, Eddy Lin, and is shop keeping a pharmacy at the Willow Market and Pharmacy. He is also taking online classes to stay up to date on new medications and treatments. John is also curious about who will be running for the local mayor election next month and he is asking everyone he meets about who will be running in the election.",
            "hunger": 50,
            "thirst": 50
        },
        "conscious": {
            "recent_memory": [
                {"event": "Helped a customer find medication", "relevance": 7},
                {"event": "Took an online class on new treatments", "relevance": 5}
            ]
        },
        "world": {
            "living_area": "the Ville:Lin family's house:Mei and John Lin's bedroom",
            "position": None  # To be filled with agent spawn
        },
        "orchestrator": {
            "lifestyle": "John Lin goes to bed around 10pm, wakes up around 6am, eats dinner around 5pm.",
            "daily_plan": [
                {"time": "6:00", "task": "Wake up"},
                {"time": "7:00", "task": "Open pharmacy"},
                {"time": "12:00", "task": "Lunch"},
                {"time": "13:00", "task": "Assist customers"},
                {"time": "17:00", "task": "Dinner"},
                {"time": "18:00", "task": "Take online classes"},
                {"time": "22:00", "task": "Go to bed"}
            ]
        }
    }
]

class EventManager:
    def __init__(self, socketio, scope="global"):
        self.logger = LoggerBuilder().build(self)
        self.socketio = socketio
        self.scope = scope
        self.event_handlers = {}
        
    def escape_strings(self, data):
            if isinstance(data, str):
                return data.replace("'", "\\'").replace('"', '\\"')
            elif isinstance(data, dict):
                return {key: self.escape_strings(value) for key, value in data.items()}
            elif isinstance(data, list):
                return [self.escape_strings(item) for item in data]
            return data
        
    def emit_event(self, event_name, data="", scope="global"):
        if not isinstance(data, dict):
            data = {"data": data}
        elif "data" not in data:
            data = {"data": data}
            
        data["scope"] = scope or self.scope
        data["eventTime"] = datetime.now().strftime("%H:%M:%S:%f")
        data["data"] = self.escape_strings(data["data"])
        
        safe_data = json.dumps(data, ensure_ascii=False, skipkeys=True, default=str)
        self.logger.debug(f"{event_name} emitted with {safe_data}", propagate=False)
        self.socketio.emit(event_name, safe_data, namespace="/simulation/instance/")

    def emit_message(self, data, scope="global"):
        self.emit_event("message", data, scope)
        
    def register_event_handler(self, event_name, handler):
        if event_name not in self.event_handlers:
            self.event_handlers[event_name] = []
        self.event_handlers[event_name].append(handler)

    def handle_event(self, event_name, data):
        if event_name in self.event_handlers:
            for handler in self.event_handlers[event_name]:
                handler(data)

    @staticmethod
    def create_event_manager(socketio):
        return EventManager(socketio)
    
class Lucida:
    """
    Lucida is a simulation manager that handles the initialization and execution of a simulation.
    Attributes:
        event_manager (EventManager): Manages events within the simulation.
        logger (Logger): Logs messages and events.
        socketio (SocketIO): Socket.IO server instance for real-time communication.
        map (Map): The map on which the simulation runs.
        simulation_instance (SimulationInstance): The instance of the simulation.
        agents (list): List of agents participating in the simulation.
        stop_event (Event): Event to signal stopping of the simulation.
        thread (Thread): Background thread running the simulation.
        start_time (float): Timestamp when the simulation started.
    Methods:
        __init__(socketio):
            Initializes the Lucida instance with the given Socket.IO server.
        set_map(map):
            Sets the map for the simulation.
        set_simulation_instance(simulation_instance):
            Sets the simulation instance.
        start_simulation():
            Starts the simulation if the map and simulation instance are set.
        quit():
            Stops the simulation and waits for the background thread to finish.
    """
    event_manager: EventManager = None
    logger : Logger = None
    def __init__(self, socketio, namespace="/"):
        self.socketio = socketio
        self.map = None
        self.simulation_instance = None
        self.namespace = namespace
        
        self.agents = []
        Lucida.event_manager = EventManager(socketio)
        Lucida.logger = LoggerBuilder().build(Lucida.event_manager)
        self.stop_event = eventlet.event.Event()
        
        self.thread = None
        self.start_time =  datetime.now()
        self.last_step =   self.start_time
        self.current_step = 1
        self.current_time = datetime.now()
        
        @socketio.on("step_simulation",namespace=self.namespace)
        def handle_step(data):
            Lucida.event_manager.emit_event("step_started", self.current_step)
            
            if not self.stop_event.ready():
                self.last_step = datetime.now()
                for agent in self.agents:
                    
                    if not agent.is_dead:
                        agent.run_step()
                Lucida.event_manager.emit_event("step_ended", self.current_step)        
                self.current_step+=1
                
            else:
                print("alo")
                Lucida.event_manager.emit_event("simulation_dead")

    def set_map(self, map):
        self.map = map

    def set_simulation_instance(self, simulation_instance):
        self.simulation_instance = simulation_instance

    def start_simulation(self):
        if self.stop_event.ready():
            self.stop_event.reset()
        if self.map is None or self.simulation_instance is None:
            raise ValueError("Map and simulation instance must be set before starting the simulation.")
        self.thread = self.socketio.start_background_task(self._run_simulation)
        self.start_time = time.time()

    def _run_simulation(self):
        self.logger.log("Simulation started")
        world_state = WorldEnvironment(Lucida.logger, self.map)

        # for agent in agent_list:
        #     self.agents.append(Agent(Lucida.logger, agent, world_state.get_random_player_spawn(), self.stop_event))

        self.agents.append(Agent(world_state, Lucida.logger, agent_list[0],world_state.get_random_player_spawn(), self.stop_event))
        for agent in self.agents:
            agent.start_agent()
                
        while not self.stop_event.ready():
            self.socketio.sleep(1)
            self.test = datetime.today()
            if time.time() - self.start_time > MAX_TIMEOUT:
                if not self.stop_event.ready():
                    self.stop_event.send()
                self.logger.error("Simulation stopped due to timeout.")
                break
            
        if self.stop_event.ready():
            self.logger.info("Simulation stopped due to stop_event set")
                    
        
        for agent in self.agents:
            agent.stop_agent()
        

    def quit(self):
        if self.stop_event.ready():
            print("quit")
            self.stop_event.reset()
        self.stop_event.send()
        if self.thread:
            self.thread.join()

