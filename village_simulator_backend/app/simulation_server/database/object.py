from .entity import MetaEntityService, InstanceEntityService, MetaEntityBaseModel, InstanceEntityBaseModel, Position,BaseDatabaseService
from pydantic import BaseModel, Field
from typing import List, Optional , Dict, Any

class ObjectMeta(MetaEntityBaseModel):
    description : Optional[str] = None
    contents: List[str] = []
    spawn_position: Position

class ObjectInstance(InstanceEntityBaseModel, ObjectMeta):
    status: List[str]
    current_position: Position

class ObjectService(BaseDatabaseService):
    COLLECTION_ID = "object"
    def __init__(self):
        self.meta = MetaEntityService(ObjectService.COLLECTION_ID+"_meta", ObjectMeta)
        self.instance = InstanceEntityService(ObjectService.COLLECTION_ID+"_instance", ObjectInstance)