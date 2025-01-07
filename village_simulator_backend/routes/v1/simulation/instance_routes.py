from flask import Blueprint
from village_simulator_backend.simulation_server.simulation_instance_server import SimulationInstanceService
from flask import Response
from flask import Blueprint, current_app
from flask import stream_with_context, request
import datetime

# Criar um Blueprint para as rotas de usuários
simulation_instance = Blueprint('simulation_instance', __name__)

@simulation_instance.route('/simulation/instance')
def stream_simulation():
    sim_server = SimulationInstanceService()
    get_message, quit = sim_server.hello_world("uFVuQ")
    @stream_with_context
    def generate():        
        start_time = datetime.datetime.now()
        elapsed = 0
        last_message_time = 0
        while elapsed < 10:
            elapsed = (datetime.datetime.now() - start_time).seconds
            
            message = get_message()
            
            for data in message:
                if message:
                    start_time = datetime.datetime.now()
                    yield f"data: {data}\n\n"
                
            if elapsed > 0 and \
                elapsed % 5 == 0 \
                and last_message_time != elapsed:
                last_message_time = elapsed
                yield "data: Waiting for message...\n\n"
        quit()
        yield "data: Simulation complete\n\n"

    response = Response(generate(), mimetype='text/event-stream')

    @response.call_on_close
    def on_close():
        print("User disconnected. quitting")
        quit()

    return response