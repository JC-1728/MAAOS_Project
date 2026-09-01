from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from datetime import timedelta
from app.core.security import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()

# Temporary in-memory dictionary to simulate Ann Maria's database until she builds it
fake_users_db = {}

# Pydantic Schemas for incoming request validation
class UserRegister(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserRegister):
    # 1. Check if user already exists
    if user.email in fake_users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email already registered"
        )
    
    # 2. Hash the plain text password securely
    hashed_pwd = get_password_hash(user.password)
    
    # 3. Save the new user to our database (temporarily using our dictionary)
    fake_users_db[user.email] = {
        "email": user.email,
        "name": user.name,
        "hashed_password": hashed_pwd
    }
    
    return {"message": "User registered successfully", "email": user.email}

@router.post("/login")
async def login(user: UserLogin):
    # 1. Fetch user from database
    db_user = fake_users_db.get(user.email)
    
    # 2. Verify existence and password match
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid credentials"
        )
        
    if not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid credentials"
        )
        
    # 3. If valid, generate a real JWT Access Token for Akshay's frontend
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
