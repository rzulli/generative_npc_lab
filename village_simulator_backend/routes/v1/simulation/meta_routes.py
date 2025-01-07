
from flask import Flask, Blueprint, request,abort, url_for, jsonify

from village_simulator_backend.simulation_server.simulation_meta_server import SimulationMetaServer
from bson import json_util

# Criar um Blueprint para as rotas de usuários
simulation_meta = Blueprint('simulation_meta', __name__)

@simulation_meta.route("/simulation/meta", methods=["GET"])
def get_simulation_meta():
    data = request.args
    print(data, "uid" in data)
    if "uid" in data:
        version = data["version"] if "version" in data else ""
        sim_server = SimulationMetaServer()
        map = sim_server.get_simulation_by_uid(data["uid"], version)
        print(map)
        if map:
            return json_util.dumps(map)
    abort(404)

@simulation_meta.route("/simulation/meta", methods=["POST"])
def post_simulation_meta():
    data = request.get_json()
    
    if "version" in data and "uid" in data:
        abort(403)
    if "name" in data and "map_uid" in data:
        sim_server = SimulationMetaServer()
        response, uid  = sim_server.create_simulation(data["name"],data["map_uid"])
        if response:
            print(response)
            return json_util.dumps({"uid": uid})
        abort(400)
        

@simulation_meta.route("/simulation/meta/list", methods=["GET"])
def list_simulation_meta():

    sim_server = SimulationMetaServer()
    response = sim_server.list_simulation_meta()
    print(response)
    if response:
        return json_util.dumps(response)
    abort(400)
    
