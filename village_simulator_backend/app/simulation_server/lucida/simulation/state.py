import csv
import random
from queue import PriorityQueue
from threading import Semaphore
import json 

    
class State:
    def __init__(self, logger, data=None):
        self.logger = logger
        self.data = data if data is not None else {}
        self.data_lock = Semaphore()

    def set_data(self, key, value, log=False):
        with self.data_lock:
            if log:
                self.logger.event_manager.emit_event("set_state", {"key": key, "value": value})
            self.data[key] = value

    def get_data(self, key, log=False):
        with self.data_lock:
            value = self.data.get(key)
            if log:
                self.logger.event_manager.emit_event("get_state", {"key": key, "value": value})
            return value
    
    def __str__(self):
        return json.dumps(self.data, default=str, check_circular=False,ensure_ascii=False, skipkeys=True)
        
class WorldEnvironment(State):
    filter_layer = ["Arena Blocks", "Sector Blocks","Object Interaction Blocks", "World Blocks", "Spawning Blocks"]
    files = ["arena_blocks.csv","sector_blocks.csv", "game_object_blocks.csv", "world_blocks.csv","spawning_location_blocks.csv"]

    def __init__(self, logger, map):
        super().__init__(logger, map)
        self.logger = logger
        self.map = map
        self.csv_data = {}
        self.map_metadata = {}
        self.reverse_lookup = {}
        self.load_csv_data()
        self.parseMap()
        self.parsePositions()
        
        
    def parseMap(self):
        self.logger.event_manager.emit_event("map_state", self.map["mapState"])
        
        # Iterate through each layer in the map
        for layer in self.map["mapState"]["layers"]:
            # Check if the layer is one of the filter layers or collisions
            if layer["name"] in self.filter_layer or layer["name"] == "Collisions":
                width = layer["width"]
                
                # Iterate through each value in the layer data
                for index, value in enumerate(layer["data"]):
                    if value != 0:
                        x = index % width
                        y = index // width
                        position = f"{x}:{y}"
                        
                        # Initialize position in map_metadata if not already present
                        if position not in self.map_metadata:
                            self.map_metadata[position] = {}
                        
                        # Handle different layer types
                        if layer["name"] == "Spawning Blocks":
                            self.map_metadata[position]["PLAYER_SPAWN"] = value
                            #self.logger.info(f"Value: {value}, Data: {csv_data[str(value)]}")
                        elif str(value) in self.csv_data:
                            self.map_metadata[position][layer["name"]] = self.csv_data[str(value)]
                        elif layer["name"] == "Collisions":
                            self.map_metadata[position][layer["name"]] = True
                        else:
                            pass
                            #self.logger.info(f"Value: {value}, Position: {position}, Layer: {layer['name']}")
        
        # Store the parsed map metadata in the state
        
        self.logger.event_manager.emit_event("map_metadata", self.map_metadata)
        self.logger.info("Map metadata parsed.")
        
    def parsePositions(self):
        
        
        
        for position, layers in self.map_metadata.items():
            for layer_name in layers:
                if layer_name not in self.reverse_lookup:
                    self.reverse_lookup[layer_name] = []
                self.reverse_lookup[layer_name].append(position)
                
        self.logger.event_manager.emit_event("reverse_lookup",self.reverse_lookup)
        self.logger.info("Reverse lookup table created.")

    def load_csv_data(self):
        self.csv_data = {}
        for file, layer in zip(self.files, self.filter_layer):
            with open("./"+file, mode='r') as csvfile:
                reader = csv.reader(csvfile)
                
                for row in reader:
                    id = row[0]
                    data = row[1:]
                    if id not in self.csv_data:
                        self.csv_data[id] = {}
                    self.csv_data[id] = data
        
    
    def get_random_player_spawn(self):
        
        player_spawn_positions = self.reverse_lookup.get('PLAYER_SPAWN', [])
        if player_spawn_positions:
            return random.choice(player_spawn_positions)
        else:
            self.logger.error("No player spawn positions available.")
            return None

    def find_path(self, start, end, logger=None):
        logger = self.logger if logger is None else logger
        logger.debug(f"Starting find_path {start} -> {end}")
        def heuristic(a, b):
            return abs(a[0] - b[0]) + abs(a[1] - b[1])
        
        collisions = {(int(pos.split(":")[0]), int(pos.split(":")[1])) for pos, layers in self.map_metadata.items() if layers.get('Collisions', False)}
        
        if start in collisions:
            raise ValueError("Start is in collision, nudge position.")
        if end in collisions:
            logger.error(f"End position is in collision: start={start}, end={end}")
            return None
        
        #logger.debug(f"Collisions: {collisions}")
        open_set = PriorityQueue()
        open_set.put((0, start))
        came_from = {}
        g_score = {start: 0}
        f_score = {start: heuristic(start, end)}

        while not open_set.empty():
            _, current = open_set.get()
            
            if current == end:
                path = []
                while current in came_from:
                    path.append(current)
                    current = came_from[current]
                path.append(start)
                path.reverse()
                logger.log(f"Path found {path}")
                return path

            neighbors = [(current[0] + dx, current[1] + dy) for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]]
            logger.debug(f" current: {current} - {end} - {current==end} {neighbors}",propagate=False)
            for neighbor in neighbors:
                if neighbor in collisions:
                    #logger.debug(f"{neighbor} collided!!!!!", propagate=False)
                    continue

                tentative_g_score = g_score[current] + 1
                if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g_score
                    f_score[neighbor] = tentative_g_score + heuristic(neighbor, end)
                    logger.debug(f"{tentative_g_score}, {f_score[neighbor]}",  propagate=False)
                    open_set.put((f_score[neighbor], neighbor))

        logger.log("No path found.")
        return None
    
    
class Atavistic(State):
    def __init__(self, logger, data=None):
        super().__init__(logger, data)
        self.set_data('type', 'atavistic')

class Conscious(State):
    def __init__(self, logger, data=None):
        super().__init__(logger, data)
        self.set_data('type', 'conscious')
        
class Entity(State):
    def __init__(self, logger, start_position, data=None):
        super().__init__(logger, data)
        self.set_data('type', 'entity')
        [x, y ] = start_position.split(":")
        self.set_data('position', {'x': x, 'y': y})