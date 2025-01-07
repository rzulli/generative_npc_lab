from datetime import datetime
from .db import db
import nanoid
from ..model.simulation import SimulationMeta
from ..model.simulation import SimulationInstance
from .map import MapService

class SimulationService():

    def __init__(self):
        
        self.simulation_instance = db.simulation_instance
        self.simulation_meta = db.simulation_meta

    def list_simulation_meta(self):      
        pipeline = [
            {"$sort": {"version": -1}},  # Ordenar por versão (descendente)
            {"$group": {
                "_id": "$object_uid",  # Agrupar por uid
                "latest": {"$first": "$$ROOT"}  # Selecionar o documento com maior versão
            }},
            {"$replaceRoot": {"newRoot": "$latest"}}  # Substituir a saída pelo documento completo
        ]

        # Executar o pipeline
        result = self.simulation_meta.aggregate(pipeline)
        return result
    
    def get_simulation(self, sim_code):
        
        result = self.simulation_meta.find_one({"meta.fork_sim_code": sim_code})
        return result
    
    def get_simulation_by_uid(self, uid, version):
        
        result = self.simulation_meta.find_one({"object_uid": uid, "version": version})
        
        return result

    def get_latest_simulation(self, uid):
        print(uid)
        result = self.simulation_meta.find_one({"object_uid": uid},sort=[("version", -1)])
        return result

    def create_simulation(self, name, map_uid):
        latest_map = MapService().get_latest_map(map_uid)
        
        if latest_map is None:
            return None, None
        
        uid = nanoid.generate(size=5)
        simulation_data = {
            "record_uid": uid,
            "object_uid": uid,
            "version": 0,
            "name": name,
            "description": None,
            "map_uid": map_uid,
            "map_name": latest_map["name"],
            "map_version": latest_map["version"],
            "persona": [],
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "deleted": False,
            "deleted_at": None
        }

        # Validate the data using Pydantic
        simulation = SimulationMeta(**simulation_data)

        # Insert the validated data into the database
        result = self.simulation_meta.insert_one(simulation.dict())
        return result, uid
    
    def create_instance(self, simulation):
        uid = nanoid.generate(size=5)
        simulation_data = {
            "record_uid": uid,
            "object_uid": uid,
            "current_step": 0,
            "name": simulation["name"]+" ("+uid+")",
            "description": None,
            "map_uid": simulation["map_uid"],
            "map_name": simulation["map_name"],
            "map_version": simulation["map_version"],
            "persona": [],
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "deleted": False,
            "deleted_at": None
        }

        # Validate the data using Pydantic
        simulation = SimulationInstance(**simulation_data)

        # Insert the validated data into the database
        result = self.simulation_instance.insert_one(simulation.dict())
        return result, uid
    
    # def get_or_start_simulation_timeline(self, sim_code, timeline_id):

    #     simulation = self.get_simulation(sim_code)
    #     if simulation is None:
    #         print("ERRO SIMULACAO VAZIA")
    #         return
    #     env = self.environment.find_one({"sim_code":sim_code, "timeline_id": timeline_id})
    #     if env is None:
    #         print("TIMELINE VAZIA. CRIANDO NOVA TIMELINE")
    #         env = {"sim_code": sim_code, "timeline_id": timeline_id, "current_step":0,"steps":
    #                                      {"0":{
    #             "Isabella Rodriguez": {
    #                 "maze": "the_ville",
    #                 "x": 72,
    #                 "y": 14
    #             },
    #             "Klaus Mueller": {
    #                 "maze": "the_ville",
    #                 "x": 126,
    #                 "y": 46
    #             },
    #             "Maria Lopez": {
    #                 "maze": "the_ville",
    #                 "x": 123,
    #                 "y": 57
    #             }
    #             }
    #             }}
    #         self.environment.insert_one(env)
    #     return env
        
        
    # def update_simulation_timeline(self, sim_code, timeline_id, data):
    #     env = self.meta.update_one({"sim_code":sim_code, "timeline_id": timeline_id},{"$set":{"meta":data}} )
    #     print(env)

    # def add_new_simulation_step(self, sim_code, timeline_id, step, state):
    #     print(sim_code, timeline_id, step, state)
    #     self.environment.update_one({"sim_code":sim_code, "timeline_id": timeline_id},
    #                                       {"$set":{"steps."+str(step):state, "current_step":step}} ) 
        
