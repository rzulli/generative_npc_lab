import threading
import queue
import time


class Orchestrator:
    def __init__(self, logger):
        self.logger = logger
        self.threads = []
        self.events = {}
        self.event_lock = threading.Lock()

    def register_event(self, event_name, function):
        with self.event_lock:
            self.events[event_name] = function

    def execute_module(self, module, state):
        self.logger.log(f"START THREAD {module}")
        thread = threading.Thread(target=self._execute_module_with_events, args=(module, state))
        self.threads.append(thread)
        thread.start()

    def _execute_module_with_events(self, module, state):
        module.execute(self.logger, state, self)

    def wait_for_completion(self):
        for thread in self.threads:
            thread.join()

    def trigger_event(self, event_name, state):
        with self.event_lock:
            self.logger.log(f"TRIGGER EVENT {event_name}")
            if event_name in self.events:
                self.execute_module(self.events[event_name], state)
