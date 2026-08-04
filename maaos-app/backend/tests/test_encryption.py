import pytest
from app.utils.encryption import encrypt_token, decrypt_token

def test_encrypt_decrypt_token_success():
    raw_token = "ya29.a0ARW5m76_mock_google_oauth_access_token_123456789"
    encrypted = encrypt_token(raw_token)
    
    assert encrypted is not None
    assert encrypted != raw_token
    
    decrypted = decrypt_token(encrypted)
    assert decrypted == raw_token

def test_encrypt_decrypt_token_none_or_empty():
    assert encrypt_token(None) is None
    assert encrypt_token("") is None
    assert decrypt_token(None) is None
    assert decrypt_token("") is None

def test_decrypt_invalid_token_raises():
    with pytest.raises(ValueError):
        decrypt_token("invalid_encrypted_data_string_abc123")
