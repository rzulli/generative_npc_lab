import eventlet
import time

from .module import Module

class Orchestrator:
    def __init__(self, logger, state, stop_event):
        self.logger = logger
        self.threads = {}
        self.modules  : list[Module] = {}
        self.state = state
        self.stop_event = stop_event

    def spawn_module(self, module: Module):
        self.modules[module.name] = module
        thread = eventlet.spawn(self._spawn_module_task, self.modules[module.name])
        self.threads[module.name] = thread

    def _spawn_module_task(self, module : Module):
        self.logger.info(f"SPAWN MODULE THREAD {self.logger.scope} - {module.name}")
        module.spawn(self)

    def stop_all_modules(self):
        for module_name, module in self.modules.items():
            module.stop()
            
    def run_step(self):
        
        for module_name, thread in self.threads.items():
            if self.modules[module_name].dead:
                self.logger.info("aquiii")
                if not self.stop_event.ready():
                    self.stop_event.send()
                self.stop_all_modules()
            else:
                self.modules[module_name].signal_start_step()
        
        for module_name, thread in self.threads.items():
                self.modules[module_name].wait_step_ready()
                
    def __del__(self):
        self.stop_all_modules()
        

    def get_state(self):
        return self.state