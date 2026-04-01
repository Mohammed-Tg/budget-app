from app.core.security import create_access_token
from app.core.deps import get_current_user
from app.core.config import SECRET_KEY

print('SECRET_KEY:', repr(SECRET_KEY))
token = create_access_token({'sub': '1'})
print('Token created successfully')
try:
    user = get_current_user(token)
    print('User validation successful')
except Exception as e:
    print('Error:', str(e))