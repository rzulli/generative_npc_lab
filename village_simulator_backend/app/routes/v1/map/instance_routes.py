from flask import Blueprint

# Criar um Blueprint para as rotas de usuários
map_instance = Blueprint('map_instance', __name__)

@map_instance.route('/map/instance')
def get_users():
    return "List of users", 200