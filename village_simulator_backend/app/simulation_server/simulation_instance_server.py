
from .database.simulation import SimulationService
from .database.map import MapService
from .legacy.backend_server.newReverie import NewReverieServer
from .lucida.lucida import Lucida
from datetime import datetime
import json

class SimulationInstanceService:
    def __init__(self, socketio, namespace):
        self.simulation = SimulationService()
        self.map = MapService()
        self.socketio = socketio
        self.namespace = namespace

    def spawn_lucida_simulation(self, uid):
        lucida_instance = Lucida(self.socketio, self.namespace)
        
        simulation = self.simulation.get_latest_simulation(uid)
        
        if not simulation:
            Lucida.event_manager.emit_message("Simulation not found")
            return
        
        lucida_instance.set_simulation_instance(simulation)
        map = self.map.get_map_by_uid(simulation["map_uid"], simulation[
            "map_version"
        ])
        
        if not map:
            Lucida.event_manager.emit_message("Map not found")
            return
        lucida_instance.set_map( map)
        
        @self.socketio.on("disconnect", namespace=self.namespace)
        def disconnected():
            lucida_instance.quit()
            
        Lucida.event_manager.emit_event("simulation_start", simulation)
        
        return lucida_instance

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