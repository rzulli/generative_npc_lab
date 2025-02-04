from pydantic import BaseModel, Field
from typing import List, Optional , Dict, Any
from datetime import datetime

class MapMeta(BaseModel):
    record_uid: str
    object_uid: str
    version: int
    name: str
    data: Dict[str, Any] = None
    update_stack: List[Dict[str, Any]] = None
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted: bool = False
    deleted_at: Optional[datetime] = None
    
class PersonaMeta(BaseModel):
    record_uid: str
    object_uid: str
    version: int
    name: str
    age: int
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted: bool = False
    deleted_at: Optional[datetime] = None

class SimulationMeta(BaseModel):
    record_uid: str
    object_uid: str
    version: int
    name: str
    description: Optional[str] = None
    map_uid: str
    map_name: str
    map_version: int
    persona: List[str]  # List of PersonaMeta.object_uid
    created_at: datetime
    updated_at: datetime
    deleted: bool = False
    deleted_at: Optional[datetime] = None
    
class SimulationInstance(BaseModel):
    record_uid: str
    object_uid: str
    current_step: int
    name: str
    description: Optional[str] = None
    map_uid: str
    map_name: str
    map_version: int
    persona: List[str]  # List of PersonaMeta.object_uid
    created_at: datetime
    updated_at: datetime
    deleted: bool = False
    deleted_at: Optional[datetime] = None