
import csv
import random
from queue import PriorityQueue

class State:
    def __init__(self, logger, data=None):
        self.logger = logger
        self.data = data if data is not None else {}

    def set_data(self, key, value, log=True):
        self.logger.log({"key": key, "value":value, "eventType":"setState"})
        #if log:
            
        self.data[key] = value

    def get_data(self, key, log=True):
        value = self.data.get(key)
        self.logger.log({"key": key, "value":value, "eventType":"getState"})
        #if log:
            
        return value
    
class WorldEnvironment(State):
    filter_layer = ["Arena Blocks", "Sector Blocks","Object Interaction Blocks", "World Blocks", "Spawning Blocks"]
    files = ["arena_blocks.csv","sector_blocks.csv", "game_object_blocks.csv", "world_blocks.csv","spawning_location_blocks.csv"]

    def __init__(self, logger, map):
        super().__init__(logger, map)
        self.map = map
        self.set_data('map', map)
        self.load_csv_data()
        self.parseMap()
        self.parsePositions()
       
    def parseMap(self):
        csv_data = self.get_data('csv_data')
        map_metadata = {}
        for layer in self.map["mapState"]["layers"]:
            if layer["name"] in self.filter_layer or layer["name"] == "Collisions":
                width = layer["width"]
                for index, value in enumerate(layer["data"]):
                    if value != 0:
                        x = index % width
                        y = index // width
                        position = (x, y)
                        if position not in map_metadata:
                            map_metadata[position] = {}
                        
                        if layer["name"]=="Spawning Blocks":
                            map_metadata[position]["PLAYER_SPAWN"] = value
                            print( value,csv_data[str(value)])
                        elif str(value) in csv_data:
                            map_metadata[position][layer["name"]] = csv_data[str(value)]
                        elif layer["name"] == "Collisions":
                            map_metadata[position][layer["name"]] = True
                        else:
                            print(str(value),position,layer["name"])
                        
        self.set_data('map_metadata', map_metadata, log=False)
        
    def parsePositions(self):
        map_metadata = self.get_data('map_metadata')
        reverse_lookup = {}
        
        for position, layers in map_metadata.items():
            for layer_name in layers:
                if layer_name not in reverse_lookup:
                    reverse_lookup[layer_name] = []
                reverse_lookup[layer_name].append(position)
        
        self.set_data('reverse_lookup', reverse_lookup , log=False)

    def load_csv_data(self):
        csv_data = {}
        for file, layer in zip(self.files, self.filter_layer):
            with open("C:/Users/rafae/Documents/Projetos/generative_npc_lab/village_simulator_backend/"+file, mode='r') as csvfile:
                reader = csv.reader(csvfile)
                
                for row in reader:
                    id = row[0]
                    data = row[1:]
                    if id not in csv_data:
                        csv_data[id] = {}
                    csv_data[id] = data
        self.set_data('csv_data', csv_data)
    
    def get_random_player_spawn(self):
        reverse_lookup = self.get_data('reverse_lookup')
        player_spawn_positions = reverse_lookup.get('PLAYER_SPAWN', [])
        if player_spawn_positions:
            return random.choice(player_spawn_positions)
        else:
            self.logger.log("No player spawn positions available.")
            return None

    def find_path(self, start, end):

        def heuristic(a, b):
            return abs(a[0] - b[0]) + abs(a[1] - b[1])

        map_metadata = self.get_data('map_metadata')
        collisions = {pos for pos, layers in map_metadata.items() if layers.get('Collisions', False)}

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
                return path

            neighbors = [(current[0] + dx, current[1] + dy) for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]]
            for neighbor in neighbors:
                if neighbor in collisions:
                    continue

                tentative_g_score = g_score[current] + 1
                if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g_score
                    f_score[neighbor] = tentative_g_score + heuristic(neighbor, end)
                    open_set.put((f_score[neighbor], neighbor))

        self.logger.log("No path found.")
        return None
    
    
class Atavistic(State):
    def __init__(self, logger, data=None):
        super().__init__(logger, data)
        self.set_data('type', 'atavistic')

class Conscious(State):
    def __init__(self, logger, data=None):
        super().__init__(logger, data)
        self.set_data('type', 'conscious')