from datetime import datetime
from .db import db, get_db
import nanoid
from .entity import MetaEntityBaseModel, MetaEntityService, InstanceEntityBaseModel, InstanceEntityService, BaseDatabaseService
from .map import MapService
from ..utils import global_id
from pydantic import BaseModel, Field
from typing import List, Optional , Dict, Any


class SimulationMeta(MetaEntityBaseModel):
    description : Optional[str] = None
    map_object_uid : str
    map_name : str
    map_version: int
    persona_record_uid: List[str]
    

class SimulationInstance(SimulationMeta, InstanceEntityBaseModel):
    current_step: int


class SimulationService(BaseDatabaseService):
    COLLECTION_ID = "simulation"
    def __init__(self):
        self.meta = MetaEntityService(SimulationService.COLLECTION_ID+"_meta", SimulationMeta)
        self.instance = InstanceEntityService(SimulationService.COLLECTION_ID+"_instance", SimulationInstance)
