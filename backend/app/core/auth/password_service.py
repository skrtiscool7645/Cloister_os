import secrets
import bcrypt


class PasswordService:
    def hash_password(self, password: str) -> str:
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    def verify_password(self, password: str, hash_value: str) -> bool:
        try:
            return bcrypt.checkpw(password.encode(), hash_value.encode())
        except Exception:
            return False

    def generate_reset_token(self) -> str:
        return secrets.token_urlsafe(32)
