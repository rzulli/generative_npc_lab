from .db import db

class PersonaService():

    def __init__(self):
       
        self.persona_state = db.persona_state
        self.persona_template = db.persona_template

    def get_persona(self, persona_name):
        result = self.persona_state.find_one({"persona_name": persona_name})
        #print("result",result)
        return result
    

    def get_persona_template(self, persona_name):
        result = self.persona_template.find_one({"persona_name": persona_name})
        #print("result",result)
        return result
    
    def get_latest_state(self, sim_code, timeline_id, persona_name):
        result = self.persona_state.find_one({"persona_name": persona_name, "sim_code":sim_code, "timeline_id":timeline_id})
        #print("result",result)
        return result
    
    def add_persona_state(self,  sim_code, name, timeline_id, step, persona_state):
        self.persona_state.insert_one({"sim_code": sim_code, "timeline_id":timeline_id, "step":step, "state": persona_state, "persona_name":name})


    def update_persona(self,persona_name,data):

        result = self.persona_state.update_one({"persona_name": persona_name},
                                            {"$set":{"spatial_memory":data["spatial_memory"],
                                                     "nodes":data["nodes"],
                                                     "scratch":data["scratch"],
                                                     "kw_strength":data["kw"],
                                                     "embeddings":data["embeddings"],}})
        return result
        
        
