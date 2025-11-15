class ApiProcessError(Exception):
    def __init__(self, status_code: int, message: str, full_message: str | None = None):
        self.message = message
        self.full_message = full_message
        self.status_code = status_code
        super().__init__(message, status_code, full_message)


def api_error(status_code: int, message: str, full_message: str | None = None):
    error_dict = {
        "status": status_code,
        "message": message,
        "full_message": str(full_message),
    }
    return status_code, error_dict
