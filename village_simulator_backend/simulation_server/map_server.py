from .database.map  import MapService

class MapServer:

    def __init__(self):
        self.map_service = MapService()

    def get_map_by_uid(self, uid, version=None):
        if version is None or version == "" or not version.is_digit():
            return self.map_service.get_latest_map(uid)
        return self.map_service.get_map_by_uid(uid, int(version))
    
    def create_map(self, data):
        return self.map_service.create_map(data)
    
    def update_map(self, data):
        return self.map_service.update_map(data["uid"],data["version"], data["updateStack"], data["mapState"])
    
    def list_map_meta(self):
        return self.map_service.list_map_meta()
    
    def stack_update(self, data):
        current = self.get_map_by_uid(data["uid"], data["version"])
        print(current)
        updatedStack = data["updateStack"] +current["updateStack"]
        

        return self.map_service.update_map_updateStack(data["uid"],data["version"], updatedStack)