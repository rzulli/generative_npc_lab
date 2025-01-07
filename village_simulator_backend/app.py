from flask import Flask,request,abort, url_for, jsonify
from simulation_server.simulation_meta_server import SimulationMetaServer
from pymongo.collection import Collection, ReturnDocument
from bson import json_util
from flask_cors import CORS, cross_origin


from flask_pymongo import PyMongo
from pymongo.errors import DuplicateKeyError
from pymongo import MongoClient
import os
from simulation_server.map_server import MapServer
from routes.v1.map.meta_routes import map_meta 
from routes.v1.map.instance_routes import map_instance
from routes.v1.simulation.meta_routes import simulation_meta
from routes.v1.simulation.instance_routes import simulation_instance
from simulation_server.database.db import get_db, db

def create_app():
    
    APP_DIR = os.path.abspath(os.path.dirname(__file__))
    STATIC_FOLDER = os.path.join(APP_DIR, 'build/static')
    TEMPLATE_FOLDER = os.path.join(APP_DIR, 'build')

    app = Flask(__name__, static_folder=STATIC_FOLDER,
                template_folder=TEMPLATE_FOLDER,
                )
    CORS(app, resources={r"/*": {"origins": "http://localhost:8080"}})
    app.config['MONGO_URI'] = "mongodb://localhost:27017/"
    
    app.register_blueprint(map_meta, url_prefix="/api/v1")
    app.register_blueprint(map_instance, url_prefix="/api/v1")
    app.register_blueprint(simulation_meta, url_prefix="/api/v1")
    app.register_blueprint(simulation_instance, url_prefix="/api/v1")
    with app.app_context():
        get_db()
        a = db.simulation_instance
        
    @app.errorhandler(400)
    def bad_request(error):
        response = jsonify({
            "error": "Bad Request",
            "message": str(error)
        })
        response.status_code = 400
        return response

    @app.route("/")
    def hello_world():
        server = SimulationMetaServer("base")
        return server.hello_world()
    



    return app

app = create_app()
if __name__ == '__main__':
    app.run()
