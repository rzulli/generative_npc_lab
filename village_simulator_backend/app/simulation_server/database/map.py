from .db import db
from nanoid import generate
from ..utils import global_id
from .entity import MetaEntityService, InstanceEntityService, MetaEntityBaseModel, InstanceEntityBaseModel, BaseDatabaseService
from pydantic import BaseModel, Field
from typing import List, Optional , Dict, Any

class MapMeta(MetaEntityBaseModel):
    description : Optional[str] = None
    data: Dict[str,any] = {}

class MapInstance(InstanceEntityBaseModel):
    update_stack : List[Dict[str,any]] = []
    
class MapService(BaseDatabaseService):
    COLLECTION_ID = "map"

    def __init__(self):
        self.meta = MetaEntityService(MapService.COLLECTION_ID+"_meta", MapMeta)
        self.instance = InstanceEntityService(MapService.COLLECTION_ID+"_instance", MapInstance)
