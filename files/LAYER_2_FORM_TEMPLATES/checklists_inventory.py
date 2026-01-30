
# AUTO-GENERATED CHECKLIST INVENTORY
# Source: CRM/LAYER_2_FORM_TEMPLATES/Checklists
# This file is intentionally verbose and lossless.

checklist_inventory = [
    {
        "form_name": "STANDARD CHECKLIST TEMPLATE",
        "table_name": "standard_checklist_template",
        "fields": [
            {"field_name": "document_title", "label": "Document Title", "type": "varchar(200)", "nullable": False, "source": "header"},
            {"field_name": "document_number", "label": "Document No", "type": "varchar(50)", "nullable": True, "source": "header"},
            {"field_name": "revision", "label": "Revision", "type": "varchar(20)", "nullable": True, "source": "header"},
            {"field_name": "effective_date", "label": "Effective Date", "type": "date", "nullable": True, "source": "header"},
            {"field_name": "prepared_by", "label": "Prepared By", "type": "varchar(100)", "nullable": True, "source": "header"},

            {"field_name": "checklist_item", "label": "Checklist Item", "type": "text", "nullable": False, "source": "table", "repeatable": True},
            {"field_name": "response", "label": "Yes / No / NA", "type": "varchar(10)", "nullable": False, "source": "table", "repeatable": True},
            {"field_name": "remarks", "label": "Remarks", "type": "text", "nullable": True, "source": "table", "repeatable": True},

            {"field_name": "verified_by", "label": "Verified By", "type": "varchar(100)", "nullable": True, "source": "footer"},
            {"field_name": "verification_date", "label": "Date", "type": "date", "nullable": True, "source": "footer"},
            {"field_name": "signature", "label": "Signature", "type": "varchar(255)", "nullable": True, "source": "footer"}
        ]
    }
]
