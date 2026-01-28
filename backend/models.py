from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    name = Column(String(255))
    phone = Column(String(50))
    is_admin = Column(Boolean, default=False)  # True para adestradora
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    dogs = relationship("Dog", back_populates="owner")

class Dog(Base):
    __tablename__ = "dogs"
    
    id = Column(Integer, primary_key=True, index=True)
    access_code = Column(String(50), unique=True, index=True, default=generate_uuid)
    name = Column(String(255))
    breed = Column(String(255))
    age = Column(Integer)  # em meses
    weight = Column(Float)  # em kg
    description = Column(Text)
    photo_url = Column(String(500))  # foto principal
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    owner = relationship("User", back_populates="dogs")
    walks = relationship("Walk", back_populates="dog", cascade="all, delete-orphan")
    trainings = relationship("Training", back_populates="dog", cascade="all, delete-orphan")
    media = relationship("Media", back_populates="dog", cascade="all, delete-orphan")

class Walk(Base):
    __tablename__ = "walks"
    
    id = Column(Integer, primary_key=True, index=True)
    dog_id = Column(Integer, ForeignKey("dogs.id"))
    scheduled_date = Column(DateTime)
    duration_minutes = Column(Integer, default=60)
    status = Column(String(50), default="agendado")  # agendado, em_andamento, concluido, cancelado
    notes = Column(Text)
    location = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    dog = relationship("Dog", back_populates="walks")

class Training(Base):
    __tablename__ = "trainings"
    
    id = Column(Integer, primary_key=True, index=True)
    dog_id = Column(Integer, ForeignKey("dogs.id"))
    scheduled_date = Column(DateTime)
    duration_minutes = Column(Integer, default=60)
    training_type = Column(String(100))  # obediência, socialização, etc
    status = Column(String(50), default="agendado")
    notes = Column(Text)
    progress_report = Column(Text)  # relatório de progresso
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    dog = relationship("Dog", back_populates="trainings")

class Media(Base):
    __tablename__ = "media"
    
    id = Column(Integer, primary_key=True, index=True)
    dog_id = Column(Integer, ForeignKey("dogs.id"))
    file_path = Column(String(500))
    file_type = Column(String(50))  # image, video
    caption = Column(Text)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    dog = relationship("Dog", back_populates="media")

