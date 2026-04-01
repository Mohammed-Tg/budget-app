import json
import urllib.request
import urllib.error

def make_request(url, method='GET', data=None, headers=None):
    if headers is None:
        headers = {}

    if data:
        data = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'

    req = urllib.request.Request(url, data=data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return {'error': e.code, 'message': e.read().decode('utf-8')}

# Login
login_data = {'email': 'testuser@example.com', 'password': 'password123'}
login_response = make_request('http://localhost:8000/auth/login', 'POST', login_data)
token = login_response.get('access_token')
print('Login Response:', login_response)

if token:
    # Test transaction creation
    headers = {'Authorization': f'Bearer {token}'}
    tx_data = {'amount': 75.50, 'type': 'expense', 'category': 'groceries'}
    tx_response = make_request('http://localhost:8000/transactions/', 'POST', tx_data, headers)
    print('Transaction Response:', tx_response)

    # Test get transactions
    tx_list_response = make_request('http://localhost:8000/transactions/', 'GET', headers=headers)
    print('Get Transactions Response:', tx_list_response)
else:
    print('No token received')