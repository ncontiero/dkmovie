_fields = {}


def register_field(field):
    _fields[field.id] = field


def get_field(field_id):
    return _fields.get(field_id)
