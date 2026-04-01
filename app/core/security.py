import hashlib
from datetime import UTC, datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"])

# --- Passwort-Hashing ---
def hash_password(password: str) -> str:
    # bcrypt truncates inputs above 72 bytes; pre-hash first so registration
    # and verification stay deterministic for long passwords as well.
    prehashed = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return pwd_context.hash(prehashed)

def verify_password(password: str, hashed: str) -> bool:
    prehashed = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return pwd_context.verify(prehashed, hashed)

# --- JWT Token erstellen ---
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
