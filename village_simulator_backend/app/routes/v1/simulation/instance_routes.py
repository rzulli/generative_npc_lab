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

def format_message(message, level=logging.DEBUG, scope="global"):
    now = datetime.datetime.now().strftime("%H:%M:%S:%f")
    log_message = {
        "message": message,
        "eventTime": now,
        "scope": scope,
        "level": level
    }
    return log_message


# Criar um Blueprint para as rotas de usuários
simulation_instance = Blueprint('simulation_instance', __name__)

# @socketio.on('connect', namespace='/simulation/instance')
# def handle_connect():
#     sim_server = SimulationInstanceService()
#     get_message, quit = sim_server.hello_world("uFVuQ")
    
#     def generate():
#         start_time = datetime.datetime.now()
#         elapsed = 0
#         last_message_time = 0
#         while elapsed < 10:
#             elapsed = (datetime.datetime.now() - start_time).seconds
            
#             message = get_message()
            
#             for data in message:
#                 if data:
#                     start_time = datetime.datetime.now()
#                     emit('message', {'data': data}, namespace='/simulation/instance')
                
#             if elapsed > 0 and \
#                 elapsed % 5 == 0 \
#                 and last_message_time != elapsed:
#                 last_message_time = elapsed
#                 d = format_message("Waiting for message...")
#                 emit('message', {'data': d}, namespace='/simulation/instance')
#         quit()
#         d = format_message("Waiting for message...")
#         emit('message', {'data': d}, namespace='/simulation/instance')
    
#     socketio.start_background_task(generate)

# @socketio.on('disconnect', namespace='/simulation/instance')
# def handle_disconnect():
#     print("User disconnected. quitting")
#     quit()
    
    
@simulation_instance.route('legacy/simulation/instance')
def stream_simulation():
    sim_server = SimulationInstanceService()
    get_message, quit = sim_server.spawn_lucida_simulation("uFVuQ")
    @stream_with_context
    def generate():        
        start_time = datetime.datetime.now()
        elapsed = 0
        last_message_time = 0
        while elapsed < 10:
            elapsed = (datetime.datetime.now() - start_time).seconds
            
            message = get_message()
            print(elapsed)
            for data in message:
                if data:
                    start_time = datetime.datetime.now()
                    yield f"data: {data}\n\n"
                
            if elapsed > 0 and \
                elapsed % 5 == 0 \
                and last_message_time != elapsed:
                d = format_message(f"Waiting for message...{elapsed} {last_message_time}")
                last_message_time = elapsed
             
                yield f"data: {d}\n\n"
                
            eventlet.sleep(1)
            
        quit()
        print(elapsed)
        d = format_message("Waiting for message...")
        yield f"data: {d}\n\n"

    response = Response(generate(), mimetype='text/event-stream')

    @response.call_on_close
    def on_close():
        print("User disconnected. quitting")
        quit()

    return response