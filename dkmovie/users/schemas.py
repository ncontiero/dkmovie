from ninja import Schema


class UserSchemaOut(Schema):
    id: int
    name: str
    email: str


class UserSchemaIn(Schema):
    name: str
