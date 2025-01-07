import threading
from flask import Flask, request, jsonify
import sqlite3
from .simulation.lib.logger import LoggerBuilder
import time
from .simulation.action import *
from .simulation.state import *
from .simulation.orchestrator import *
from .agent import *

MAX_TIMEOUT = 60  # Set your desired timeout in seconds
agent_list = [
    {
        "name": "Abigail Chen",
        "first_name": "Abigail",
        "last_name": "Chen",
        "age": 25,
        "innate": "open-minded, curious, determined",
        "learned": "Abigail Chen is a digital artist and animator who loves to explore how technology can be used to express ideas. She is always looking for new ways to combine art and technology.",
        "currently": "Abigail Chen is working on an animation project for a client. She is also experimenting with different tools and techniques to create interactive art.",
        "lifestyle": "Abigail Chen goes to bed around midnight, awakes up around 8am, eats dinner around 6pm.",
        "living_area": "the Ville:artist's co-living space:Abigail Chen's room"
    },
    {  "name": "John Lin", 
        "first_name": "John", 
        "last_name": "Lin", 
        "age": 45, 
        "innate": "patient, kind, organized", 
        "learned": "John Lin is a pharmacy shop keeper at the Willow Market and Pharmacy who loves to help people. He is always looking for ways to make the process of getting medication easier for his customers.", 
        "currently": "John Lin is living with his wife, Mei Lin, and son, Eddy Lin, and is shop keeping a pharmacy at the Willow Market and Pharmacy. He is also taking online classes to stay up to date on new medications and treatments. John is also curious about who will be running for the local mayor election next month and he is asking everyone he meets about who will be running in the election.", 
        "lifestyle": "John Lin goes to bed around 10pm, awakes up around 6am, eats dinner around 5pm.", 
        "living_area": "the Ville:Lin family's house:Mei and John Lin's bedroom"}
]
class Lucida:
    def __init__(self, map, simulation_instance):  
        self.logger = LoggerBuilder().build()
        self.map = map
        self.simulation_instance = simulation_instance
        self.stop_event = threading.Event()
        self.thread = threading.Thread(target=self.run_simulation)
        self.thread.start()
        self.start_time = time.time()
        self.agents = []

    def run_simulation(self):
        
        print(self.map)
        world_state = WorldEnvironment(self.logger, self.map)
        
        for agent in agent_list:
            self.agents.append(Agent(self.logger, agent, world_state.get_random_player_spawn()))        

        for agent in self.agents:
            agent.start_agent()
        
        while not self.stop_event.is_set():
            if time.time() - self.start_time > MAX_TIMEOUT:
                self.stop_event.set()
                self.logger.log("Simulation stopped due to timeout.")
                break
        
        for agent in self.agents:
           agent.join_agent()
           
    def quit(self):
        self.stop_event.set()
        self.thread.join()
        self.logger.stop()
        
    def get_message(self):
        return self.logger.message_board.get(timeout=10)
    
    def __del__(self):
        self.logger.stop()
   
