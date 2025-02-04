import time
from threading import Timer

class Sensor:
    def __init__(self, detection_radius=5.0, timer_interval=1.0):
        self.detection_radius = detection_radius
        self.timer_interval = timer_interval
        self.target = None
        self.last_known_position = None
        self.on_target_changed = lambda: None
        self.timer = None
        self.start_timer()

    @property
    def target_position(self):
        return self.target.position if self.target else (0, 0, 0)

    @property
    def is_target_in_range(self):
        return self.target_position != (0, 0, 0)

    def start_timer(self):
        self.timer = Timer(self.timer_interval, self.update_target_position)
        self.timer.start()

    def update_target_position(self, target=None):
        self.target = target
        if self.is_target_in_range and (self.last_known_position != self.target_position or self.last_known_position != (0, 0, 0)):
            self.last_known_position = self.target_position
            self.on_target_changed()
        self.start_timer()

    def on_trigger_enter(self, other):
        if other.tag != "Player":
            return
        self.update_target_position(other)

    def on_trigger_exit(self, other):
        if other.tag != "Player":
            return
        self.update_target_position()

    def draw_gizmos(self):
        color = "red" if self.is_target_in_range else "green"
        print(f"Drawing sphere at {self.target_position} with radius {self.detection_radius} and color {color}")

# Example usage
class GameObject:
    def __init__(self, position, tag):
        self.position = position
        self.tag = tag

player = GameObject((1, 2, 3), "Player")
sensor = Sensor()

sensor.on_target_changed = lambda: print("Target changed!")
sensor.on_trigger_enter(player)
time.sleep(2)
sensor.on_trigger_exit(player)