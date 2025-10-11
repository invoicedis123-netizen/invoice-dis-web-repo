"""
MongoDB schemas for TEVANI application.

This file defines the MongoDB collection schemas for the application.
These schemas are used to validate the data stored in MongoDB collections.
"""

from pymongo import IndexModel, ASCENDING, DESCENDING, TEXT

# User collection schema
user_schema = {
    "validator": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["email", "name", "type", "hashed_password", "is_active", "created_at", "updated_at"],
            "properties": {
                "email": {
                    "bsonType": "string",
                    "description": "Email address of the user"
                },
                "name": {
                    "bsonType": "string",
                    "description": "Name of the user"
                },
                "phone": {
                    "bsonType": ["string", "null"],
                    "description": "Phone number of the user"
                },
                "type": {
                    "enum": ["business", "investor"],
                    "description": "Type of user (business or investor)"
                },
                "hashed_password": {
                    "bsonType": "string",
                    "description": "Hashed password of the user"
                },
                "is_active": {
                    "bsonType": "bool",
                    "description": "Whether the user is active"
                },
                "business_profile": {
                    "bsonType": ["object", "null"],
                    "description": "Business profile of the user",
                    "properties": {
                        "business_type": {
                            "enum": ["msme", "startup"],
                            "description": "Type of business"
                        },
                        "gst_status": {
                            "enum": ["gst-registered", "non-gst"],
                            "description": "GST registration status"
                        },
                        "company_name": {
                            "bsonType": "string",
                            "description": "Name of the company"
                        },
                        "gstin": {
                            "bsonType": ["string", "null"],
                            "description": "GSTIN of the company"
                        },
                        "pan": {
                            "bsonType": "string",
                            "description": "PAN of the company"
                        },
                        "udyam": {
                            "bsonType": ["string", "null"],
                            "description": "Udyam registration number"
                        },
                        "business_address": {
                            "bsonType": ["string", "null"],
                            "description": "Business address"
                        },
                        "city": {
                            "bsonType": ["string", "null"],
                            "description": "City"
                        },
                        "state": {
                            "bsonType": ["string", "null"],
                            "description": "State"
                        },
                        "annual_turnover": {
                            "bsonType": ["string", "null"],
                            "description": "Annual turnover"
                        }
                    }
                },
                "investor_profile": {
                    "bsonType": ["object", "null"],
                    "description": "Investor profile of the user",
                    "properties": {
                        "investor_type": {
                            "enum": ["individual", "hni", "corporate", "family-office"],
                            "description": "Type of investor"
                        },
                        "investment_capacity": {
                            "bsonType": "string",
                            "description": "Investment capacity"
                        },
                        "pan": {
                            "bsonType": "string",
                            "description": "PAN of the investor"
                        }
                    }
                },
                "created_at": {
                    "bsonType": "date",
                    "description": "Timestamp when the user was created"
                },
                "updated_at": {
                    "bsonType": "date",
                    "description": "Timestamp when the user was last updated"
                }
            }
        }
    }
}

# User collection indexes
user_indexes = [
    IndexModel([("email", ASCENDING)], unique=True),
    IndexModel([("name", TEXT)]),
    IndexModel([("type", ASCENDING)]),
]

# Invoice collection schema
invoice_schema = {
    "validator": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["invoice_number", "amount", "invoice_date", "due_date", "buyer_name", "seller_id", "status", "created_at", "updated_at"],
            "properties": {
                "invoice_number": {
                    "bsonType": "string",
                    "description": "Invoice number"
                },
                "amount": {
                    "bsonType": "double",
                    "description": "Invoice amount"
                },
                "invoice_date": {
                    "bsonType": "date",
                    "description": "Date of the invoice"
                },
                "due_date": {
                    "bsonType": "date",
                    "description": "Due date of the invoice"
                },
                "description": {
                    "bsonType": ["string", "null"],
                    "description": "Description of the invoice"
                },
                "buyer_name": {
                    "bsonType": "string",
                    "description": "Name of the buyer"
                },
                "buyer_gstin": {
                    "bsonType": ["string", "null"],
                    "description": "GSTIN of the buyer"
                },
                "buyer_email": {
                    "bsonType": ["string", "null"],
                    "description": "Email of the buyer for verification"
                },
                "buyer_phone": {
                    "bsonType": ["string", "null"],
                    "description": "Phone number of the buyer for verification"
                },
                "buyer_address": {
                    "bsonType": ["string", "null"],
                    "description": "Address of the buyer"
                },
                "line_items": {
                    "bsonType": ["array", "null"],
                    "description": "Line items in the invoice",
                    "items": {
                        "bsonType": "object",
                        "required": ["description", "quantity", "unit_price", "amount"],
                        "properties": {
                            "description": {
                                "bsonType": "string",
                                "description": "Description of the line item"
                            },
                            "quantity": {
                                "bsonType": "double",
                                "description": "Quantity of the line item"
                            },
                            "unit_price": {
                                "bsonType": "double",
                                "description": "Unit price of the line item"
                            },
                            "amount": {
                                "bsonType": "double",
                                "description": "Amount of the line item"
                            },
                            "tax": {
                                "bsonType": ["double", "null"],
                                "description": "Tax on the line item"
                            }
                        }
                    }
                },
                "purchase_order_number": {
                    "bsonType": ["string", "null"],
                    "description": "Purchase order number"
                },
                "terms": {
                    "bsonType": ["string", "null"],
                    "description": "Terms of the invoice"
                },
                "seller_id": {
                    "bsonType": "objectId",
                    "description": "ID of the seller"
                },
                "status": {
                    "enum": ["pending_validation", "pending_consent", "validated", "rejected", "funded", "paid", "defaulted"],
                    "description": "Status of the invoice"
                },
                "trust_score": {
                    "bsonType": ["int", "null"],
                    "description": "Trust score of the invoice"
                },
                "risk_tier": {
                    "enum": ["A", "B", "C", "D", None],
                    "description": "Risk tier of the invoice"
                },
                "validation_results": {
                    "bsonType": ["array", "null"],
                    "description": "Validation results for the invoice",
                    "items": {
                        "bsonType": "object",
                        "required": ["check_name", "result", "message"],
                        "properties": {
                            "check_name": {
                                "bsonType": "string",
                                "description": "Name of the validation check"
                            },
                            "result": {
                                "enum": ["pass", "warning", "fail"],
                                "description": "Result of the validation check"
                            },
                            "message": {
                                "bsonType": "string",
                                "description": "Message from the validation check"
                            },
                            "details": {
                                "bsonType": ["object", "null"],
                                "description": "Details of the validation check"
                            }
                        }
                    }
                },
                "supporting_documents": {
                    "bsonType": ["array", "null"],
                    "description": "Supporting documents for the invoice",
                    "items": {
                        "bsonType": "string"
                    }
                },
                "funded_amount": {
                    "bsonType": "double",
                    "description": "Amount funded"
                },
                "available_amount": {
                    "bsonType": "double",
                    "description": "Amount available for funding"
                },
                "created_at": {
                    "bsonType": "date",
                    "description": "Timestamp when the invoice was created"
                },
                "updated_at": {
                    "bsonType": "date",
                    "description": "Timestamp when the invoice was last updated"
                },
                "file_path": {
                    "bsonType": ["string", "null"],
                    "description": "Path to the uploaded invoice file"
                },
                "ocr_data": {
                    "bsonType": ["object", "null"],
                    "description": "Raw OCR extracted data"
                },
                "hash": {
                    "bsonType": ["string", "null"],
                    "description": "SHA-256 hash of the invoice file for tamper detection"
                }
            }
        }
    }
}

# Invoice collection indexes
invoice_indexes = [
    IndexModel([("invoice_number", ASCENDING)]),
    IndexModel([("seller_id", ASCENDING)]),
    IndexModel([("status", ASCENDING)]),
    IndexModel([("buyer_name", TEXT)]),
    IndexModel([("due_date", ASCENDING)]),
    IndexModel([("created_at", DESCENDING)]),
]

# Supporting document collection schema
supporting_document_schema = {
    "validator": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["invoice_id", "document_type", "file_path", "uploaded_at"],
            "properties": {
                "invoice_id": {
                    "bsonType": "objectId",
                    "description": "ID of the invoice"
                },
                "document_type": {
                    "bsonType": "string",
                    "description": "Type of the document"
                },
                "file_path": {
                    "bsonType": "string",
                    "description": "Path to the document file"
                },
                "uploaded_at": {
                    "bsonType": "date",
                    "description": "Timestamp when the document was uploaded"
                },
                "hash": {
                    "bsonType": ["string", "null"],
                    "description": "SHA-256 hash for tamper detection"
                }
            }
        }
    }
}

# Supporting document collection indexes
supporting_document_indexes = [
    IndexModel([("invoice_id", ASCENDING)]),
    IndexModel([("document_type", ASCENDING)]),
]

# Consent record collection schema
consent_record_schema = {
    "validator": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["invoice_id", "buyer_email", "status", "created_at", "updated_at", "consent_window_start", "consent_window_end"],
            "properties": {
                "invoice_id": {
                    "bsonType": "objectId",
                    "description": "ID of the invoice"
                },
                "buyer_email": {
                    "bsonType": "string",
                    "description": "Email address of the buyer"
                },
                "buyer_phone": {
                    "bsonType": ["string", "null"],
                    "description": "Phone number of the buyer"
                },
                "status": {
                    "enum": ["pending", "acknowledged", "disputed", "expired"],
                    "description": "Status of the consent"
                },
                "created_at": {
                    "bsonType": "date",
                    "description": "Timestamp when the consent was created"
                },
                "updated_at": {
                    "bsonType": "date",
                    "description": "Timestamp when the consent was last updated"
                },
                "consent_window_start": {
                    "bsonType": "date",
                    "description": "Start of the consent window"
                },
                "consent_window_end": {
                    "bsonType": "date",
                    "description": "End of the consent window"
                },
                "notifications": {
                    "bsonType": "array",
                    "description": "References to Notification objects",
                    "items": {
                        "bsonType": "objectId"
                    }
                },
                "logs": {
                    "bsonType": "array",
                    "description": "References to ConsentLog objects",
                    "items": {
                        "bsonType": "objectId"
                    }
                },
                "dispute_reason": {
                    "bsonType": ["string", "null"],
                    "description": "Reason for dispute"
                },
                "dispute_details": {
                    "bsonType": ["object", "null"],
                    "description": "Details of the dispute"
                },
                "ledger_entry": {
                    "bsonType": ["string", "null"],
                    "description": "Final ledger entry for record keeping"
                }
            }
        }
    }
}

# Consent record collection indexes
consent_record_indexes = [
    IndexModel([("invoice_id", ASCENDING)]),
    IndexModel([("buyer_email", ASCENDING)]),
    IndexModel([("status", ASCENDING)]),
    IndexModel([("consent_window_end", ASCENDING)]),
]

# Notification collection schema
notification_schema = {
    "validator": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["invoice_id", "type", "recipient", "status", "content"],
            "properties": {
                "invoice_id": {
                    "bsonType": "objectId",
                    "description": "ID of the invoice"
                },
                "type": {
                    "enum": ["email", "whatsapp", "sms", "registered_post"],
                    "description": "Type of notification"
                },
                "recipient": {
                    "bsonType": "string",
                    "description": "Recipient of the notification"
                },
                "status": {
                    "enum": ["queued", "sent", "delivered", "read", "failed"],
                    "description": "Status of the notification"
                },
                "sent_at": {
                    "bsonType": ["date", "null"],
                    "description": "Timestamp when the notification was sent"
                },
                "delivered_at": {
                    "bsonType": ["date", "null"],
                    "description": "Timestamp when the notification was delivered"
                },
                "read_at": {
                    "bsonType": ["date", "null"],
                    "description": "Timestamp when the notification was read"
                },
                "message_id": {
                    "bsonType": ["string", "null"],
                    "description": "External ID from notification provider"
                },
                "content": {
                    "bsonType": "string",
                    "description": "Content of the notification"
                },
                "metadata": {
                    "bsonType": ["object", "null"],
                    "description": "Metadata of the notification"
                }
            }
        }
    }
}

# Notification collection indexes
notification_indexes = [
    IndexModel([("invoice_id", ASCENDING)]),
    IndexModel([("type", ASCENDING)]),
    IndexModel([("recipient", ASCENDING)]),
    IndexModel([("status", ASCENDING)]),
]

# Consent log collection schema
consent_log_schema = {
    "validator": {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["invoice_id", "event", "timestamp"],
            "properties": {
                "invoice_id": {
                    "bsonType": "objectId",
                    "description": "ID of the invoice"
                },
                "event": {
                    "enum": [
                        "notification_sent", 
                        "notification_delivered", 
                        "notification_read", 
                        "explicit_consent", 
                        "dispute_raised", 
                        "passive_consent", 
                        "consent_window_expired"
                    ],
                    "description": "Type of event"
                },
                "timestamp": {
                    "bsonType": "date",
                    "description": "Timestamp of the event"
                },
                "details": {
                    "bsonType": ["object", "null"],
                    "description": "Details of the event"
                },
                "ip_address": {
                    "bsonType": ["string", "null"],
                    "description": "IP address of the user"
                },
                "user_agent": {
                    "bsonType": ["string", "null"],
                    "description": "User agent of the user"
                }
            }
        }
    }
}

# Consent log collection indexes
consent_log_indexes = [
    IndexModel([("invoice_id", ASCENDING)]),
    IndexModel([("event", ASCENDING)]),
    IndexModel([("timestamp", DESCENDING)]),
]

# Collection schemas and indexes
collection_schemas = {
    "users": (user_schema, user_indexes),
    "invoices": (invoice_schema, invoice_indexes),
    "supporting_documents": (supporting_document_schema, supporting_document_indexes),
    "consent_records": (consent_record_schema, consent_record_indexes),
    "notifications": (notification_schema, notification_indexes),
    "consent_logs": (consent_log_schema, consent_log_indexes),
}

# Made with Bob
