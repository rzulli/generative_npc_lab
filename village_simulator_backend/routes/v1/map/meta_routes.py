from flask import Flask, Blueprint, request, abort, url_for, jsonify

from simulation_server.map_server import MapServer
from bson import json_util

# Criar um Blueprint para as rotas de usuários
map_meta = Blueprint("map_meta", __name__)


@map_meta.route("/map/meta", methods=["GET"])
def get_map_meta():
    data = request.args
    print(data, "version" in data and "uid" in data)
    if "uid" in data:
        version = data["version"] if "version" in data else ""
        map_server = MapServer()
        map = map_server.get_map_by_uid(data["uid"],version)
        if map:
            return json_util.dumps(map)
    abort(404)


@map_meta.route("/map/meta", methods=["POST"])
def post_map_meta():
    data = request.get_json()
    print(data, "version" in data and "uid" in data)
    if "version" in data and "uid" in data:
        abort(403)
    if "name" in data and "mapState" in data and "updateStack" in data:
        map_server = MapServer()
        map = map_server.create_map(data)
        if map:
            print(map)
            return json_util.dumps({"uid": map.inserted_id})
        abort(400)


@map_meta.route("/map/meta", methods=["PUT"])
def update_map_meta():
    data = request.get_json()
    print(data, "version" in data and "uid" in data)
    if (
        "version" in data
        and "uid" in data
        and ("updateStack" in data or "mapState" in data)
    ):
        map_server = MapServer()
        response = map_server.update_map(data)
        if response.acknowledged:
            return "", 200
        abort(400)


@map_meta.route("/map/meta/stack", methods=["POST"])
def stack_update():
    data = request.get_json()
    print(data, "version" in data and "uid" in data)
    if "version" in data and "uid" in data and "updateStack" in data:
        map_server = MapServer()
        response = map_server.stack_update(data)
        if response.acknowledged:
            return "", 200
        abort(400)


@map_meta.route("/map/meta/list", methods=["GET"])
def list_map_meta():
    map_server = MapServer()
    response = map_server.list_map_meta()
    print(response)
    if response:
        return json_util.dumps(response)
    abort(400)
