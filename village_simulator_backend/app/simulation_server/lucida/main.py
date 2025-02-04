import threading
import queue
import time

from simulation.lib.logger  import logger
from simulation.action import *
from simulation.state import *
from simulation.orchestrator import *
from agent import *


if __name__ == "__main__":
        
    atavistic_state = Atavistic()
    conscious_state = Conscious()
    orchestrator = Orchestrator()

    # Update the orchestrator to work with static methods of Action classes
    orchestrator.register_event('EXECUTE_ACTION_2', ExampleAction3)

    # Update the agent to use static methods of Action classes
    actions = [ExampleAction, ExampleAction2, ExampleAction3]

    agent = Agent("Agent1", atavistic_state, conscious_state, orchestrator, actions)
    agent.spawn_modules()
    orchestrator.wait_for_completion()

