
from .database.environment import SimulationService
from .database.map import MapService
from .legacy.backend_server.newReverie import NewReverieServer
from .lucida.lucida import Lucida
from datetime import datetime
import json
class SimulationInstanceService:
    def __init__(self):
        self.simulation = SimulationService()
        self.map = MapService()

    def hello_world(self, uid):

        simulation = self.simulation.get_latest_simulation(uid)
        map = self.map.get_map_by_uid(simulation["map_uid"], simulation[
            "map_version"
        ])
        print(simulation)
        lucida_instance = Lucida(map, simulation)
        
        def get_message():
            now = datetime.now().strftime("%H:%M:%S:%f")
            try:
                message = lucida_instance.get_message()
                yield json.dumps(message)
            except Exception as e:
                if hasattr(e,"message"):            
                    yield {"message": f"{now} -SIMULATOR EXCEPTION - {str(e)}"}
                else:
                    yield None       
        
        return [get_message, lucida_instance.quit]

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