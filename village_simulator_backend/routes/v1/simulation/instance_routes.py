from flask import Blueprint

# Criar um Blueprint para as rotas de usuários
simulation_instance = Blueprint('simulation_instance', __name__)

@simulation_instance.route('/simulation/instance')
def get_users():
    return "List of users", 200