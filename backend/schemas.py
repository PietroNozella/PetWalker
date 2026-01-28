from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# ============ User Schemas ============

class UserBase(BaseModel):
    email: str
    name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    is_admin: bool = False

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: int
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# ============ Dog Schemas ============

class DogBase(BaseModel):
    name: str
    breed: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    description: Optional[str] = None

class DogCreate(DogBase):
    owner_id: int

class DogUpdate(BaseModel):
    name: Optional[str] = None
    breed: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None

class DogResponse(DogBase):
    id: int
    access_code: str
    photo_url: Optional[str] = None
    owner_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============ Walk Schemas ============

class WalkBase(BaseModel):
    scheduled_date: datetime
    duration_minutes: int = 60
    location: Optional[str] = None
    notes: Optional[str] = None

class WalkCreate(WalkBase):
    dog_id: int

class WalkUpdate(BaseModel):
    scheduled_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    status: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None

class WalkResponse(WalkBase):
    id: int
    dog_id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============ Training Schemas ============

class TrainingBase(BaseModel):
    scheduled_date: datetime
    duration_minutes: int = 60
    training_type: str
    notes: Optional[str] = None

class TrainingCreate(TrainingBase):
    dog_id: int

class TrainingUpdate(BaseModel):
    scheduled_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    training_type: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    progress_report: Optional[str] = None

class TrainingResponse(TrainingBase):
    id: int
    dog_id: int
    status: str
    progress_report: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============ Media Schemas ============

class MediaResponse(BaseModel):
    id: int
    dog_id: int
    file_path: str
    file_type: str
    caption: Optional[str] = None
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

# ============ Full Dog Profile ============

class DogFullProfile(DogResponse):
    owner: Optional[UserResponse] = None
    walks: List[WalkResponse] = []
    trainings: List[TrainingResponse] = []
    media: List[MediaResponse] = []

