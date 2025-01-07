import numpy as np
import threading
from queue import Queue

# Dimensões do mapa
MAP_SIZE = 10

# Criação de um mapa 2D com metadados fictícios
# Cada célula contém [tipo_terreno, recurso, evento]
world_map = np.random.choice(['terra', 'água', 'floresta'], size=(MAP_SIZE, MAP_SIZE))
metadata = {
    'tipo_terreno': world_map,
    'recurso': np.random.choice([None, 'ouro', 'madeira'], size=(MAP_SIZE, MAP_SIZE)),
    'evento': np.random.choice([None, 'som', 'luz'], size=(MAP_SIZE, MAP_SIZE))
}

# Filas para comunicação entre sensores e agregador
sensor_queues = [Queue() for _ in range(4)]
aggregator_queue = Queue()

# Função para um sensor que percebe partes do mapa
def sensor(sensor_id, x_range, y_range, metadata, output_queue):
    for x in range(*x_range):
        for y in range(*y_range):
            # Simulação de percepção
            data = {
                'pos': (x, y),
                'tipo_terreno': metadata['tipo_terreno'][x, y],
                'recurso': metadata['recurso'][x, y],
                'evento': metadata['evento'][x, y]
            }
            output_queue.put(data)

# Função para o agregador de dados
def aggregator(sensor_queues, output_queue, map_size):
    collected_data = []
    for q in sensor_queues:
        while not q.empty():
            collected_data.append(q.get())
    # Aplicação do gargalo
    reduced_data = apply_bottleneck(collected_data, map_size)
    output_queue.put(reduced_data)

# Função do gargalo para redução de dados
def apply_bottleneck(data, map_size):
    # Redução: Priorizar recursos e eventos
    reduced = {
        'recursos': [],
        'eventos': []
    }
    for entry in data:
        if entry['recurso']:
            reduced['recursos'].append(entry['pos'])
        if entry['evento']:
            reduced['eventos'].append(entry['pos'])
    return reduced

# Função do controlador
def controller(input_queue):
    while not input_queue.empty():
        state = input_queue.get()
        print("Estado processado pelo controlador:", state)

# Divisão do mapa entre sensores
threads = []
step = MAP_SIZE // len(sensor_queues)
for i, queue in enumerate(sensor_queues):
    x_range = (i * step, (i + 1) * step)
    thread = threading.Thread(target=sensor, args=(i, x_range, (0, MAP_SIZE), metadata, queue))
    threads.append(thread)
    thread.start()

# Esperar sensores terminarem
for thread in threads:
    thread.join()

# Agregação e aplicação do gargalo
aggregator(sensor_queues, aggregator_queue, MAP_SIZE)

# Processamento pelo controlador
controller(aggregator_queue)
