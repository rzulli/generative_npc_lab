from flask import current_app, g
from werkzeug.local import LocalProxy
from flask_pymongo import MongoClient

from pymongo.errors import DuplicateKeyError, OperationFailure



def get_db():
    """
    Configuration method to return db instance
    """
    db = getattr(g, "_database", None)
    
    if db is None:

        db = g._database = MongoClient(current_app.config["MONGO_URI"]).village
        
    return db


# Use LocalProxy to read the global db instance with just `db`
db = LocalProxy(get_db)