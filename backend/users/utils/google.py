import requests

def verify_google_access_token(access_token: str):
    response = requests.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=5,
    )

    if response.status_code != 200:
        return None

    return response.json()
