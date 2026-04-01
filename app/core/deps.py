import logging

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import ExpiredSignatureError, JWTError, jwt

from app.core.config import ALGORITHM, SECRET_KEY
from app.crud.user import get_user_by_id

logger = logging.getLogger(__name__)
security = HTTPBearer()


def get_current_user(token=Depends(security)):
    credentials = token.credentials if hasattr(token, "credentials") else token

    try:
        payload = jwt.decode(credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except ExpiredSignatureError as exc:
        logger.info("JWT expired during authentication")
        raise HTTPException(status_code=401, detail="Token expired") from exc
    except JWTError as exc:
        logger.info("JWT validation failed")
        raise HTTPException(status_code=401, detail="Invalid token") from exc

    subject = payload.get("sub")
    if subject is None:
        logger.warning("JWT missing subject claim")
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        user_id = int(subject)
    except (TypeError, ValueError) as exc:
        logger.warning("JWT subject claim is not a valid user id")
        raise HTTPException(status_code=401, detail="Invalid token") from exc

    user = get_user_by_id(user_id)
    if user is None:
        logger.info("Authenticated token references missing user id=%s", user_id)
        raise HTTPException(status_code=401, detail="Invalid token")

    return user
