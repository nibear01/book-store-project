"""
MongoDB helper for UI tests to retrieve OTP codes during test execution.
Requires pymongo: pip install pymongo
"""
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure


def get_mongo_client():
    """Get MongoDB client using environment variable or default connection string."""
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/bookstore")
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        # Test connection
        client.server_info()
        return client
    except ConnectionFailure as e:
        raise ConnectionError(f"Failed to connect to MongoDB at {mongo_uri}: {e}")


def get_latest_otp(email):
    """
    Retrieve the latest OTP code for a given email from the emailotps collection.
    
    Args:
        email (str): Email address to look up
        
    Returns:
        str: The OTP code if found, None otherwise
    """
    try:
        client = get_mongo_client()
        db = client.get_default_database()
        
        # Query the emailotps collection for the most recent OTP for this email
        otp_doc = db.emailotps.find_one(
            {"email": email},
            sort=[("sentAt", -1)]
        )
        
        if otp_doc and "code" in otp_doc:
            return otp_doc["code"]
        return None
    except Exception as e:
        print(f"Error retrieving OTP from MongoDB: {e}")
        return None
    finally:
        if 'client' in locals():
            client.close()


def clear_otp_for_email(email):
    """
    Clear all OTP records for a given email (cleanup after test).
    
    Args:
        email (str): Email address to clear OTPs for
        
    Returns:
        int: Number of documents deleted
    """
    try:
        client = get_mongo_client()
        db = client.get_default_database()
        
        result = db.emailotps.delete_many({"email": email})
        return result.deleted_count
    except Exception as e:
        print(f"Error clearing OTP from MongoDB: {e}")
        return 0
    finally:
        if 'client' in locals():
            client.close()
