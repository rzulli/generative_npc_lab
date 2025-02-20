from datetime import datetime
from typing import List, Dict, Any, Optional
from .db import db,get_db
from pydantic import BaseModel, ValidationError
from app.simulation_server.utils import global_id
from bson import ObjectId

from pydantic import BaseModel, Field
from typing import List, Optional , Dict, Any
from datetime import datetime

class EntityBaseModel(BaseModel):
    record_uid: str
    object_uid: str
    version: int
    created_at: datetime
    updated_at: datetime
    deleted: bool = False
    deleted_at: Optional[datetime] = None
    
class MetaEntityBaseModel(EntityBaseModel):
    name: str

class InstanceEntityBaseModel(EntityBaseModel):
    name: str
    meta_object_uid : str
    meta_version : int
    simulation_instance_uid : Optional[str] = ""
        

class Position(BaseModel):
    x:int
    y:int
    
class BaseEntityService:
    """
    Base class for services that handle CRUD operations for entities.
    """

    def __init__(self, collection_name: str, entity_model: BaseModel):
        """
        Initializes the service with the collection name and entity model.

        Args:
            collection_name (str): The name of the MongoDB collection.
            entity_model (BaseModel): The Pydantic model for the entity.
        """
        
        self.entity_model = entity_model
        self.collection_name = collection_name

    @property
    def required_fields(self) :  
        return {k:v for k,v in self.entity_model.model_fields.items() if k not in EntityBaseModel.model_fields.keys() and v.is_required() } 
    
    @property
    def entity_fields(self) :  
        return {k:v for k,v in self.entity_model.model_fields.items() if k not in EntityBaseModel.model_fields.keys() }
    
    @property
    def all_fields(self) :
        return self.entity_model.model_fields
    
    @property
    def collection(self):
        try:
            return db[self.collection_name]
        except Exception as e:
            print(f"Error on getting collection {str(e)}")
    
    def list_entities(self, show_deleted=False) -> List[Dict[str, Any]]:
        """
        Lists all entities in the collection, sorted by version and created_at.

        Returns:
            List[Dict[str, Any]]: A list of entities.
        """
        match_stage = {}
        if not show_deleted:
            # If show_deleted is False, filter out deleted entities
            match_stage = {"deleted": False}

        pipeline = [
            {"$match": match_stage},  # Only include entities where deleted is False, if applicable
            {"$sort": {"version": -1, "created_at": -1}},
            {"$group": {
                "_id": "$object_uid",
                "latest": {"$first": "$$ROOT"}
            }},
            {"$replaceRoot": {"newRoot": "$latest"}}
        ]
        try:
            result = self.collection.aggregate(pipeline)
            return list(result)
        except Exception as e:
            return []


    def get_entity(self, entity_id: str,show_deleted=False) -> Optional[Dict[str, Any]]:
        """
        Gets an entity by its record UID.

        Args:
            entity_id (str): The record UID of the entity.

        Returns:
            Optional[Dict[str, Any]]: The entity, or None if not found.
        """
        filters = {"record_uid": entity_id} if show_deleted else {"record_uid": entity_id, "show_deleted":show_deleted}
        result = self.collection.find_one(filters)
        return result

    def get_entity_by_uid(self, uid: str, version: int,show_deleted=False) -> Optional[Dict[str, Any]]:
        """
        Gets an entity by its object UID and version.

        Args:
            uid (str): The object UID of the entity.
            version (int): The version of the entity.

        Returns:
            Optional[Dict[str, Any]]: The entity, or None if not found.
        """
        filters = {"object_uid": uid, "version":version} if show_deleted else {"object_uid": uid, "version":version,"deleted":False}
        result = self.collection.find_one(filters)
        return result

    def get_latest_entity(self, uid: str,show_deleted=False) -> Optional[Dict[str, Any]]:
        """
        Gets the latest version of an entity by its object UID.

        Args:
            uid (str): The object UID of the entity.

        Returns:
            Optional[Dict[str, Any]]: The latest version of the entity, or None if not found.
        """
        filters = {"object_uid": uid} if show_deleted else {"object_uid": uid,"deleted":False}
        try:
            result = self.collection.find_one(filters, sort=[("version", -1)])
            return result
        except Exception as e:
            print(f"An error occurred while getting the latest entity: {e}")
            return None

    def create_entity(self, **kwargs: Any) -> tuple[Any, str]:
        """
        Creates a new entity.

        Args:
            **kwargs (Any): The data for the new entity.

        Returns:
            tuple[Any, str]: The result of the insert operation and the object UID of the new entity.
        """
        object_uid = global_id(size=5)
        record_uid = global_id(size=5)
        

        entity_data = {
            **kwargs,
            "record_uid": record_uid,
            "object_uid": object_uid,
            "version": 0,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "deleted": False,
            "deleted_at": None,
        }

        entity = self.entity_model(**entity_data)

        self.collection.insert_one(entity.dict())
        return {"object_uid":object_uid,"record_uid":record_uid}

    def update_entity(self, entity_id: str, **kwargs: Any) -> Any:
        """
        Updates an entity by creating a new version.

        Args:
            entity_id (str): The object UID of the entity to update.
           
            **kwargs (Any): The updated data for the entity.

        Returns:
            Any: The result of the insert operation for the new version of the entity,
                 or None if the entity is not found,
                 or a message if no updates were made to the specified fields.
        """
        entity = self.get_latest_entity(entity_id)
        if not entity:
            raise Exception("Entity Object UID not found")

       
        # Check if any of the specified fields have been updated
        has_updates = False
        for field in self.required_fields:
            if field in kwargs and entity.get(field) != kwargs[field]:
                has_updates = True

        if not has_updates and not entity["deleted"]:
            raise Exception("No updates to specified fields, skipping update.")
        
        new_version = int(entity["version"]) + 1
        uid = entity["object_uid"]

        # Remove fields that should not be updated
        # for field in ["created_at", "updated_at", "deleted_at", "deleted", "unsavedChanges", "id", "record_uid"]:
        #     kwargs.pop(field, None)

        record_uid = global_id(size=5)
        entity_data = {
            **kwargs,
            "created_at": entity["created_at"],
            "record_uid": record_uid,
            "object_uid": uid,
            "version": new_version,
            "updated_at": datetime.now(),
            "deleted": False,
            "deleted_at": None,
        }

        entity = self.entity_model(**entity_data)

        self.collection.insert_one(entity.dict())
        return record_uid

    def delete_entity_record(self, entity_id: str) -> Any:
        """
        Deletes a specific version of an entity.

        Args:
            entity_id (str): The record UID of the entity to delete.

        Returns:
            Any: The result of the delete operation, or None if the entity is not found.
        """
        result = self.collection.update_one({"record_uid": entity_id , "deleted":False}, {"$set":{"deleted":True, "deleted_at":datetime.now()}})
        if result.matched_count == 0:
            return None
        return f"{result.modified_count} documents updated"

    def delete_entity(self, uid: str) -> Any:
        """
        Deletes all versions of an entity by its object UID.

        Args:
            uid (str): The object UID of the entity to delete.

        Returns:
            Any: The result of the delete operation.
        """
        result = self.collection.update_many({"object_uid": uid, "deleted":False}, {"$set":{"deleted":True, "deleted_at":datetime.now()}})
        if result.matched_count == 0:
            return None
        return f"{result.modified_count} documents updated"


class MetaEntityService(BaseEntityService):
    """
    Service for handling meta entities, which represent templates or definitions.
    """

    def __init__(self, collection_id:str, entity_model: BaseModel):
        super().__init__(collection_id, entity_model)


class InstanceEntityService(BaseEntityService):
    """
    Service for handling instance entities, which represent specific instances of meta entities
    within a simulation.
    """

    def __init__(self, collection_id, entity_model: type[BaseModel]):
        super().__init__(collection_id, entity_model)

    def create_entity(self, **kwargs: Any) -> tuple[Any, str]:
        """
        Creates a new instance entity linked to a specific version of a meta-entity and a simulation instance.

        Args:
            **kwargs (Any): The data for the new instance entity.

        Returns:
            tuple[Any, str]: The result of the insert operation and the object UID of the new instance entity.
        """
        object_uid = global_id(size=5)
        record_uid = global_id(size=5)
        
        entity_data = {
            **kwargs,
            "record_uid": record_uid,
            "object_uid": object_uid,
            "version": 0,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "deleted": False,
            "deleted_at": None,
        }

        entity = self.entity_model(**entity_data)

        self.collection.insert_one(entity.dict())
        return {"object_uid":object_uid,"record_uid":record_uid}

    def update_entity(self, entity_id: str, **kwargs: Any) -> Any:
        """
        Updates an instance entity by creating a new version.

        Args:
            entity_id (str): The object UID of the entity to update.
            fields_to_check (List[str]): A list of fields to check for updates.
            **kwargs (Any): The updated data for the entity.

        Returns:
            Any: The result of the insert operation for the new version of the entity,
                    or None if the entity is not found,
                    or a message if no updates were made to the specified fields.
        """
        entity = self.get_latest_entity(entity_id)
        if not entity:
            return None

        # Check if any of the specified fields have been updated
        
        has_updates = False
        for field in  self.required_fields:
            if field in kwargs and entity.get(field) != kwargs[field]:
                has_updates = True

        if not has_updates:
            return "No updates to specified fields, skipping update."

        new_version = int(entity["version"]) + 1
        uid = entity["object_uid"]
        meta_entity_uid = entity["meta_entity_uid"]
        meta_entity_version = entity["meta_entity_version"]
        simulation_instance = entity["simulation_instance"]

        # Remove fields that should not be updated
        for field in ["created_at", "updated_at", "deleted_at", "deleted", "unsavedChanges", "id", "record_uid"]:
            kwargs.pop(field, None)
        record_uid = global_id(size=5)
        entity_data = {
            **kwargs,
            "created_at": entity["created_at"],
            "record_uid": record_uid,
            "object_uid": uid,
            "meta_entity_uid": meta_entity_uid,
            "meta_entity_version": meta_entity_version,
            "simulation_instance": simulation_instance,
            "version": new_version,
            "updated_at": datetime.now(),
            "deleted": False,
            "deleted_at": None,
        }

        entity = self.entity_model(**entity_data)

        self.collection.insert_one(entity.dict())
        return record_uid


class BaseDatabaseService:
    def __init__(self):
        self.meta:MetaEntityService = None
        self.instance:InstanceEntityService = None
        