from flask import Flask, Blueprint, request, abort, url_for, jsonify
from bson import json_util
# from app.simulation_server.prompt_meta_service import PromptMetaServiceWrapper
from pydantic import ValidationError
from app.simulation_server.database.entity import BaseDatabaseService
from app.simulation_server.database.prompt import PromptService
from app.simulation_server.database.map import MapService
from app.simulation_server.database.object import ObjectService
from app.simulation_server.database.simulation import SimulationService
from app.simulation_server.database.persona import PersonaService
import re
from mistralai import Mistral


def Error_Handler(func):
    def Inner_Function(*args, **kwargs):
        try:
            func(*args, **kwargs)
        except Exception as e:
            abort(500, e)
    return Inner_Function

class MetaRoutes:
    
    def __init__(self, name:str, service: type[BaseDatabaseService]):
        self.name = name
        self.blueprint = Blueprint(f"{name}_meta", __name__)
        self.service = service
                
        @Error_Handler
        @self.blueprint.route(f"{self.name}/meta/", methods=["POST"])
        def create_meta_post():
        
            data = request.get_json()

            # print(data.keys(), self.service.meta.required_fields.keys())
            missing_fields = []
            for field in self.service.meta.required_fields.keys():
                if field not in data.keys():
                    print(field)
                    missing_fields.append(field)
            if len(missing_fields)>0:
                return jsonify({"message":f"Missing fields: { ", ".join(missing_fields)}","error":401}), 401    
            
            try:
                res = self.service.meta.create_entity( **data )
                return json_util.dumps(res)
            except ValidationError as exc:
                return jsonify({"error": exc.errors(include_context=False, include_url=False, include_input=False)}), 400
                
        
                
        @Error_Handler
        @self.blueprint.route(f"{self.name}/meta/<record_uid>", methods=["GET"])
        def get_meta_by_record(record_uid):
        
            res = self.service.meta.get_entity(record_uid)
            if res:
                return json_util.dumps(res)
            abort(404)
        
                
        @Error_Handler
        @self.blueprint.route(f"{self.name}/meta/", methods=["GET"])
        def get_meta_by_object():
            
            object_uid = request.args.get('object_uid',None)
            version = request.args.get('version', None)
            show_deleted = request.args.get("show_deleted", False)
            
            if object_uid is None and version is None:
                res = self.service.meta.list_entities(show_deleted=show_deleted)
            elif version is not None and  version.isdigit():
                res = self.service.meta.get_entity_by_uid(object_uid,int(version),show_deleted=show_deleted)
            else:
                res = self.service.meta.get_latest_entity(object_uid,show_deleted=show_deleted)
           
            if res is not None:
                return json_util.dumps(res)
            
            abort(404)
            
        
        @Error_Handler
        @self.blueprint.route(f"{self.name}/meta/", methods=["PUT"])
        def update_meta():
            
            data = request.get_json()

            # print(data.keys(), self.service.meta.required_fields.keys())
            missing_fields = []
            for field in self.service.meta.required_fields.keys():
                if field not in data.keys():
                    print(field)
                    missing_fields.append(field)
                    
            if len(missing_fields)>0:
                return jsonify({"message":f"Missing fields: { ", ".join(missing_fields)}","error":401}), 401    
            try:
                object_uid = request.args.get("object_uid", None)
                record_uid = self.service.meta.update_entity(object_uid,**data )
                return json_util.dumps({"record_uid":record_uid}), 200
            
            except ValidationError as exc:
                return jsonify({"error": exc.errors(include_context=False, include_url=False, include_input=False)}), 400
            except Exception as e:
                return jsonify({"error": str(e)})
            
        @Error_Handler
        @self.blueprint.route(f"{self.name}/meta/", methods=["DELETE"])
        def delete_meta():
            object_uid = request.args.get("object_uid", None)
            record_uid = request.args.get("record_uid", None)
            
            if record_uid is not None:
                result = self.service.meta.delete_entity_record(record_uid)
            
            elif object_uid is not None:
                result = self.service.meta.delete_entity(object_uid)
              
            else:
                abort(500, "Provide a object_uid or record_uid")
            if result is None:
                abort(404, "Entity not found")
            return jsonify(result)

                    

class PromptMetaRoutes(MetaRoutes):
    def __init__(self):
        super().__init__("prompt", PromptService())
        
class SimulationMetaRoutes(MetaRoutes):
    def __init__(self):
        super().__init__("simulation", SimulationService())
        
class MapMetaRoutes(MetaRoutes):
    def __init__(self):
        super().__init__("map", MapService())
        
class PersonaMetaRoutes(MetaRoutes):
    def __init__(self):
        super().__init__("persona", PersonaService())
        
class ObjectMetaRoutes(MetaRoutes):
    def __init__(self):
        super().__init__("object", ObjectService())
        


class InstanceRoutes:
    
    def __init__(self, name:str, service: type[BaseDatabaseService]):
        self.name = name
        self.blueprint = Blueprint(f"{name}_instance", __name__)
        self.service = service
                
        @Error_Handler
        @self.blueprint.route(f"{self.name}/instance/", methods=["POST"])
        def create_instance_post():
        
            data = request.get_json()

            # print(data.keys(), self.service.meta.required_fields.keys())
            missing_fields = []
            for field in self.service.instance.required_fields.keys():
                if field not in data.keys():
                    print(field)
                    missing_fields.append(field)
            if len(missing_fields)>0:
                return jsonify({"message":f"Missing fields: { ", ".join(missing_fields)}","error":401}), 401    
            
            try:
                res = self.service.instance.create_entity( **data )
                self.on_create_entity(**{**res,"output":data["output"], "preamble":data["preamble"], "content":data["content"]})
                return json_util.dumps(res)
            except ValidationError as exc:
                res = {"error": exc.errors(include_context=False, include_url=False, include_input=False)}
                self.on_create_entity(success=False, **res)
                return jsonify(res), 400        
                
        @Error_Handler
        @self.blueprint.route(f"{self.name}/instance/<record_uid>", methods=["GET"])
        def get_instance_by_record(record_uid):
        
            res = self.service.instance.get_entity(record_uid)
            if res:
                return json_util.dumps(res)
            abort(404)
        
                
        @Error_Handler
        @self.blueprint.route(f"{self.name}/instance/", methods=["GET"])
        def get_instance_by_object():
            
            object_uid = request.args.get('object_uid',None)
            version = request.args.get('version', None)
            
            if object_uid is None and version is None:
                res = self.service.instance.list_entities()
            elif version is not None and  version.isdigit():
                res = self.service.instance.get_entity_by_uid(object_uid,int(version))
            else:
                res = self.service.instance.get_latest_entity(object_uid)
                
            if res is not None:
                return json_util.dumps(res)
            
            abort(404)
            
        
        @Error_Handler
        @self.blueprint.route(f"{self.name}/instance/", methods=["PUT"])
        def update_meta():
            
            data = request.get_json()

            # print(data.keys(), self.service.meta.required_fields.keys())
            missing_fields = []
            for field in self.service.instance.required_fields.keys():
                if field not in data.keys():
                    print(field)
                    missing_fields.append(field)
                    
            if len(missing_fields)>0:
                return jsonify({"message":f"Missing fields: { ", ".join(missing_fields)}","error":401}), 401    
            try:
                object_uid = request.args.get("object_uid", None)
                record_uid = self.service.instance.update_entity(object_uid,**data )
                return json_util.dumps({"record_uid":record_uid}), 200
            
            except ValidationError as exc:
                return jsonify({"error": exc.errors(include_context=False, include_url=False, include_input=False)}), 400
            except Exception as e:
                return jsonify({"error": str(e)})
            
    def on_create_entity(self, success=True,**result):
        pass
    
class PromptInstanceRoutes(InstanceRoutes):
    def __init__(self):
        super().__init__("prompt", PromptService())

    def on_create_entity(self, success=True,**result):
        if success:
            client = Mistral(api_key="6huAoT03KJU4v9XISX7q83g1SlOzlqOe")

            text = result["preamble"]["text"]+"\n"+result["content"]["text"]+"\n"+result["output"]["text"]
            print(text)
            
            model = "mistral-large-latest"
            messages = [{"role":"user", "content":text}]

            chat_response = client.chat.complete(model=model, messages=messages)
            print(chat_response.choices[0].message.content)
class SimulationInstanceRoutes(InstanceRoutes):
    def __init__(self):
        super().__init__("simulation", SimulationService())
        
class MapInstanceRoutes(InstanceRoutes):
    def __init__(self):
        super().__init__("map", MapService())
        
class PersonaInstanceRoutes(InstanceRoutes):
    def __init__(self):
        super().__init__("persona", PersonaService())
        
class ObjectInstanceRoutes(InstanceRoutes):
    def __init__(self):
        super().__init__("object", ObjectService())