import eventlet
eventlet.monkey_patch(socket=True)

import datetime
import json
import logging
import os

from bson import json_util
from flask import (
    Blueprint,
    Flask,
    Response,
    abort,
    current_app,
    jsonify,
    request,
    stream_with_context,
    copy_current_request_context,
    url_for,
)
from flask_cors import CORS, cross_origin
from flask_pymongo import PyMongo
from flask_socketio import SocketIO, emit
from pymongo import MongoClient
from pymongo.collection import Collection, ReturnDocument
from pymongo.errors import DuplicateKeyError
# from app.simulation_server.simulation_instance_server import (
#     SimulationInstanceService,
# )

# from .routes.v1.map.instance_routes import map_instance
# from .routes.v1.map.meta_routes import map_meta
# from .routes.v1.simulation.instance_routes import simulation_instance
from app.routes.v1.prompt.meta_routes import PromptMetaRoutes, SimulationMetaRoutes, ObjectMetaRoutes,MapMetaRoutes, PersonaMetaRoutes
from app.routes.v1.prompt.meta_routes import PromptInstanceRoutes, SimulationInstanceRoutes, ObjectInstanceRoutes,MapInstanceRoutes, PersonaInstanceRoutes
# from .routes.v1.simulation.meta_routes import simulation_meta
from app.simulation_server.database.db import db, get_db
# from .simulation_server.map_server import MapServer
# from .simulation_server.simulation_meta_server import SimulationMetaServer
from .event import create_events

socketio = SocketIO(cors_allowed_origins="*", logger=False,engineio_logger=False, async_mode='eventlet')


def create_app():
    
    APP_DIR = os.path.abspath(os.path.dirname(__file__))
    STATIC_FOLDER = os.path.join(APP_DIR, 'build/static')
    TEMPLATE_FOLDER = os.path.join(APP_DIR, 'build')

    app = Flask(__name__, static_folder=STATIC_FOLDER,
                template_folder=TEMPLATE_FOLDER,
                )
    
    CORS(app, resources={r"/*": {"origins": "http://localhost:8080"}})
    app.config['MONGO_URI'] = "mongodb://host.docker.internal:27017/"

    app.register_blueprint(PromptMetaRoutes().blueprint, url_prefix="/api/v1")
    app.register_blueprint(PromptInstanceRoutes().blueprint, url_prefix="/api/v1")
    app.register_blueprint(ObjectMetaRoutes().blueprint, url_prefix="/api/v1")
    app.register_blueprint(ObjectInstanceRoutes().blueprint, url_prefix="/api/v1")
    app.register_blueprint(SimulationMetaRoutes().blueprint, url_prefix="/api/v1")
    app.register_blueprint(SimulationInstanceRoutes().blueprint, url_prefix="/api/v1")
    app.register_blueprint(PersonaMetaRoutes().blueprint, url_prefix="/api/v1")
    app.register_blueprint(PersonaInstanceRoutes().blueprint, url_prefix="/api/v1")
    app.register_blueprint(MapMetaRoutes().blueprint, url_prefix="/api/v1")   
    app.register_blueprint(MapInstanceRoutes().blueprint, url_prefix="/api/v1")   
    
        
    @app.errorhandler(400)
    def bad_request(error):
        response = jsonify({
            "error": "Bad Request",
            "message": str(error)
        })
        response.status_code = 400
        return response

    # @app.route("/")
    # def hello_world():
    #     server = SimulationMetaServer("base")
    #     return server.hello_world()
    
    socketio.init_app(app)
    create_events(socketio, namespace="/simulation/instance/")
    
    
    return app

__all__ = ['socketio']