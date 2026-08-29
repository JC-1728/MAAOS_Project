import base64
import hashlib
from cryptography.fernet import Fernet
from app.core.config import settings

def _get_fernet() -> Fernet:
    """
    Derives a valid 32-byte urlsafe base64 key for Fernet encryption 
    from settings.ENCRYPTION_KEY.
    """
    raw_key = settings.ENCRYPTION_KEY.encode('utf-8')
    # Hash raw_key with SHA-256 to ensure exact 32 bytes, then base64 encode
    key_32bytes = hashlib.sha256(raw_key).digest()
    fernet_key = base64.urlsafe_b64encode(key_32bytes)
    return Fernet(fernet_key)

def encrypt_token(plain_token: str | None) -> str | None:
    """
    Encrypts a plain-text OAuth token string using AES-256 Fernet encryption.
    Returns None if plain_token is None or empty.
    """
    if not plain_token:
        return None
    fernet = _get_fernet()
    encrypted_bytes = fernet.encrypt(plain_token.encode('utf-8'))
    return encrypted_bytes.decode('utf-8')

def decrypt_token(encrypted_token: str | None) -> str | None:
    """
    Decrypts an encrypted OAuth token string.
    Returns None if encrypted_token is None or empty.
    """
    if not encrypted_token:
        return None
    fernet = _get_fernet()
    try:
        decrypted_bytes = fernet.decrypt(encrypted_token.encode('utf-8'))
        return decrypted_bytes.decode('utf-8')
    except Exception as e:
        # Log or re-raise if decryption fails
        raise ValueError(f"Failed to decrypt OAuth token: {str(e)}")
