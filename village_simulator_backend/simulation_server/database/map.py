from .db import db
from nanoid import generate


class MapService():

    def __init__(self):
        self.map_meta = db.map_meta

    def get_map_by_uid(self,uid, version):
        return self.map_meta.find_one({"uid":uid,"version":version})
    
    def get_latest_map(self,uid):
        return self.map_meta.find_one({"uid":uid},sort=[("version", -1)])
    
    def list_map_meta(self):
        pipeline = [
            {"$sort": {"version": -1}},  # Ordenar por versão (descendente)
            {"$group": {
                "_id": "$uid",  # Agrupar por uid
                "latest": {"$first": "$$ROOT"}  # Selecionar o documento com maior versão
            }},
            {"$replaceRoot": {"newRoot": "$latest"}}  # Substituir a saída pelo documento completo
        ]

        # Executar o pipeline
        result = self.map_meta.aggregate(pipeline)
        return result
    
    def create_map(self,data):
        print(data)
        return self.map_meta.insert_one({"uid":generate(size=7),"name":data["name"], "version":0, \
                                           "mapState": data["mapState"], "updateStack": data["updateStack"]})

    def update_map_updateStack(self,uid, version, updateStack):
        
        return self.map_meta.update_one({"uid": uid,"version":version}, {"$set":{"updateStack":updateStack}})
                                           
    def update_map(self,uid, version, updateStack, mapState):
    
        return self.map_meta.update_one({"uid": uid,"version":version}, {"$set":{"updateStack":updateStack, "mapState":mapState}})
                    