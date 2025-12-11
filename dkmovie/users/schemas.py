from ninja import Schema


class UserSchemaOut(Schema):
    id: int
    name: str
    email: str
    is_superuser: bool


class UserSchemaIn(Schema):
    name: str


class LanguageSchema(Schema):
    language: str
