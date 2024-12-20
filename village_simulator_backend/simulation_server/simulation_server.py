
from .database.environment import SimulationService
from .legacy.backend_server.newReverie import NewReverieServer

class SimulationServer:
    def __init__(self):
        self.simulation = SimulationService()
        
        
    
    def hello_world(self):
        simulation = self.simulation.get_simulation(self.sim_code)
        print(simulation)
        server = NewReverieServer(self.sim_code, simulation["meta"], simulation["init_env"], timeline_id="original")
        server.start_server(2)
        return 

    def __str__(self):
        return "server"
    
    def get_simulation_by_uid(self, uid, version):
        if version == "" or version is None or not version.isdigit():
            return self.simulation.get_latest_simulation(uid)
        
        return  self.simulation.get_simulation_by_uid(uid, int(version))

    def create_simulation(self, name, map_uid, ):
        return self.simulation.create_simulation(name, map_uid)
    
    def list_simulation_meta(self):
        return self.simulation.list_simulation_meta()