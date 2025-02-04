import eventlet
import time
from .state import State
import random

STEP_TIMEOUT = 5
class Module:
    def __init__(self, logger, name, sub_step_per_step=1, continuous=False, max_processing_time=1):
        self.logger = logger.clone_with_scope(logger.scope+":"+name)
        self.name = name
        self.continuous = continuous
        self.dead = True
        self.sub_step_per_step = sub_step_per_step
        self.max_processing_time = max_processing_time
        self._stop_event = eventlet.event.Event()
        self.start_step_event = eventlet.event.Event()
        self.step_ready_event = eventlet.event.Event()
        self.events = {}
        self.event_lock = eventlet.semaphore.Semaphore()
        

    # def register_event(self, event_name, function):
    #     with self.event_lock:
    #         self.events[event_name] = function
            
    # def trigger_event(self, event_name, state):
    #     with self.event_lock:
    #         if event_name in self.events:
    #             self.logger.log(f"TRIGGER EVENT {event_name} executing module {str(self.events[event_name])}")
    #             self.execute_module(self.events[event_name], state)

    def _has_timeout(self, start_time):
        if self.max_processing_time and (time.time() - start_time) > self.max_processing_time:
            self.logger.warning(f"{self.name} step timed out")
            return True
        
    def spawn(self, orchestrator):
        self.dead = False
        if self.continuous:
            self.logger.info(f"STARTING CONTINUOUS MODULE {self.name}")
            while not self._stop_event.ready():
                self.start_step_event.wait()
                start_time = time.time()
                for i in range(self.sub_step_per_step):
                    self.logger.debug(f"Step {i}/{self.sub_step_per_step}: {round(time.time() - start_time, 2)} "+ \
                                        f"sec elapsed. TIMEOUT: {self.max_processing_time} sec")
                    if not self._has_timeout(start_time):
                        self.run_step(orchestrator)
                self.start_step_event.reset()
                self.signal_step_ready()
            self.logger.info(f"STOPPING CONTINUOUS MODULE {self.name}")
        else:
            self.logger.info(f"EXECUTING MODULE {self.name}")
            self.run_step(orchestrator)

    def _run_step(self, orchestrator):
        # This method should be overridden by subclasses
        raise NotImplementedError("Subclasses should implement this method")

    def run_step(self, orchestrator):
        try:
            self._run_step(orchestrator)
        except Exception as e:
            self.logger.error(f"{self.name} exited with errors {e}")
            self.die()
    
    def die(self):
        self.dead = True
        self.stop()
        
    def stop(self):
        if not self._stop_event.ready():
            self.logger.info(f"Stopping {self.name}")
            self._stop_event.send()
    
    def signal_start_step(self):
        if self.start_step_event.ready():
            self.start_step_event.reset()
        self.start_step_event.send()
    
    def signal_step_ready(self):
        if self.step_ready_event.ready():
            self.step_ready_event.reset()
        self.step_ready_event.send()

    def wait_step_ready(self):
        self.step_ready_event.wait()
class MovementModule(Module):
    
    def __init__(self, logger):
        super().__init__(logger, "MovementModule", sub_step_per_step=1, continuous=True, max_processing_time=STEP_TIMEOUT)
        
    def _run_step(self, orchestrator):
        self.logger.debug(f"start step")
        state = orchestrator.get_state()
        
        position = state.entity.get_data("position")
        target_position = state.entity.get_data("target_position")
        
        if position is None:
            state.entity.set_data("position", {"x":0,"y":0})
        elif target_position is not None:
            target_position = {"x": int(target_position["x"]), "y": int(target_position["y"])}
            self.logger.info(f"New position: {target_position}")
            state.entity.set_data("position", target_position)
        
        self.logger.debug(f"end step")
        
class PlanModule(Module):
    
    def __init__(self, logger):
        super().__init__(logger, "PlanModule",sub_step_per_step=1, continuous=True, max_processing_time=STEP_TIMEOUT)
        
    def _run_step(self, orchestrator):
        
        state = orchestrator.get_state()
        
        position = state.entity.get_data("position")
        if position is None:
            self.logger.debug("No position defined")
            return
        
        plan_position = state.entity.get_data("plan_position")
        if plan_position is None:
            plan_position = {"x":int(position["x"])+1,"y":int(position["y"])+1}
            plan_position["x"] += random.randint(-10, 10)
            plan_position["y"] += random.randint(-10, 10)
            state.entity.set_data("plan_position", plan_position)

        target_position = state.entity.get_data("target_position")
        self.logger.debug(f"start step {position}. target: {target_position}. plan: {plan_position}")
        
        plan = state.entity.get_data("plan")
        if plan is None:
            
            if isinstance(position["x"], str):
                position["x"] = int(position["x"])
            if isinstance(position["y"], str):
                position["y"] = int(position["y"])
            if isinstance(plan_position["x"], str):
                plan_position["x"] = int(plan_position["x"])
            if isinstance(plan_position["y"], str):
                plan_position["y"] = int(plan_position["y"])
                
            self.logger.debug(f"Plan is none, finding new path between {position} -> {plan_position}")
            
            try:
                newPlan = state.world.find_path((position["x"], position["y"]), (plan_position["x"], plan_position["y"]), self.logger)
                if newPlan:
                    newTarget = newPlan.pop(0)
                    newTarget = {"x":newTarget[0], "y":newTarget[1]}
                    state.entity.set_data("plan", newPlan)
                    state.entity.set_data("target_position", newTarget)
                    self.logger.debug(f"New plan found, new target {newTarget}")
                else:
                    self.logger.debug(f"No new plan found, reseting plan_position")
                    state.entity.set_data("plan_position", None)
            except Exception as e:
                self.logger.error(f"Error finding path: {e}")
                position["x"] += random.choice([-1, 1])
                position["y"] += random.choice([-1, 1])
                state.entity.set_data("position", position)
                
        elif target_position == position:
            plan = state.entity.get_data("plan")
            
            if len(plan) == 0:
                state.entity.set_data("plan", None)
                state.entity.set_data("plan_position",None)
                self.logger.debug(f"Plan is concluded. sleeping....")
            else:
                newTarget = plan.pop(0)
                state.entity.set_data("plan", plan)
                self.logger.debug(f"Plan: {plan[0:10]}")
                plan_position = {"x":newTarget[0], "y":newTarget[1]}
                state.entity.set_data("target_position", plan_position)
                self.logger.debug(f"Reached target position {newTarget} - {len(plan)}")
            
        self.logger.debug(f"end step")