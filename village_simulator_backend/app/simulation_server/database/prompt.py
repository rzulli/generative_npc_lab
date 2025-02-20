from datetime import datetime
from typing import List, Dict, Any, Optional
from .db import db
from pydantic import BaseModel
from app.simulation_server.utils import global_id
from bson import ObjectId
from pydantic import BaseModel, Field
from typing import List, Optional , Dict, Any
from .entity import MetaEntityService, InstanceEntityService, MetaEntityBaseModel, InstanceEntityBaseModel,BaseDatabaseService

class PromptSection(BaseModel):
    structure: List[Dict[str, Any]]
    text: str
    variables: Dict[str, Any] = Field(default_factory=dict)

class PromptMeta(MetaEntityBaseModel):
    content: PromptSection
    output:  PromptSection
    preamble:  PromptSection

class PromptInstance(PromptMeta, InstanceEntityBaseModel):
    pass

class PromptService(BaseDatabaseService):
    COLLECTION_ID = "prompt"
    def __init__(self):
        
        self.meta = MetaEntityService(PromptService.COLLECTION_ID+"_meta", PromptMeta)
        self.instance = InstanceEntityService(PromptService.COLLECTION_ID+"_instance",PromptInstance)

    