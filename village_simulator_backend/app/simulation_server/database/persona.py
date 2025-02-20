from .db import db
from .entity import MetaEntityBaseModel, MetaEntityService, InstanceEntityBaseModel, InstanceEntityService, Position
from pydantic import BaseModel, Field
from typing import List, Optional , Dict, Any
class PersonaMeta(MetaEntityBaseModel):
    age: int
    description : Optional[str] = None
    
class PersonaInstance(InstanceEntityBaseModel, PersonaMeta):
    spawn_position: Position
    current_position: Position
class PersonaService:
    COLLECTION_ID = "personas"
    def __init__(self):
        self.meta = MetaEntityService(PersonaService.COLLECTION_ID+"_meta", PersonaMeta)
        self.instance = InstanceEntityService(PersonaService.COLLECTION_ID+"_instance", PersonaInstance)
