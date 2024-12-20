from .db import db

class MazeService():

    def __init__(self):
        
        self.collection = db.maze

    def get_simulation(self, sim_code):
        result = self.collection.find_one({"fork_sim_code": sim_code})
        print(result)
        return sim_code
        
        
