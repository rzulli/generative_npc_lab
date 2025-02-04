
from flask import Blueprint
from app.simulation_server.simulation_instance_server import SimulationInstanceService
from flask import Response
from flask import Blueprint, current_app
from flask import stream_with_context, request, copy_current_request_context
import datetime
import logging
import json
from flask_socketio import SocketIO, emit
from flask import current_app as app
import eventlet

SIMULATION_CONNECTION_TIMEOUT = 180

def format_message(message, level=logging.DEBUG, scope="global"):
    now = datetime.datetime.now().strftime("%H:%M:%S:%f")
    log_message = {
        "message": message,
        "eventTime": now,
        "scope": scope,
        "level": level
    }
    return log_message

def create_events(socketio, namespace="/"):
    lucida = None
    @socketio.on('spawn_simulation', namespace=namespace)
    def handle_connect(data):
        print("data from the front end: ",str(data))
        @copy_current_request_context
        def generate():
            sim_server = SimulationInstanceService(socketio, namespace=namespace)
            lucida = sim_server.spawn_lucida_simulation("uFVuQ")
            lucida.start_simulation()
            
            elapsed = 0
            last_message_time = 0
            
            while elapsed < SIMULATION_CONNECTION_TIMEOUT and not lucida.stop_event.ready():
                
                elapsed = (datetime.datetime.now() - lucida.last_step).seconds
                if elapsed > 0 and \
                    elapsed % 5 == 0 \
                    and last_message_time != elapsed:
                    last_message_time = elapsed
                    lucida.event_manager.emit_event("heartbeat", {"data": f"idle for {elapsed} seconds"})
                
                eventlet.sleep(0)
            lucida.quit()  
            lucida.event_manager.emit_event("simulation_end", {"data": "simulation ended"})
        
        socketio.start_background_task(generate)
    
    @socketio.on("simulation_stop", namespace=namespace)
    def handle_stop(data):
        if lucida:
            lucida.quit()     
            lucida.event_manager.emit_event("simulation_end", {"data": "simulation ended"})
        
    @socketio.on("connect", namespace=namespace)
    def connected():
        """event listener when client connects to the server"""
        print(request.sid)
        print("client has connected")
        with app.app_context():
            emit("connected", {"data": f"id: {request.sid} is connected"}, namespace=namespace)
            
        

    @socketio.on('data', namespace=namespace)
    def handle_message(data):
        """event listener when client types a message"""
        print("data from the front end: ",str(data))
        with app.app_context():
            emit("data",{'data':data,'id':request.sid},broadcast=True, namespace=namespace)
