from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timedelta
import os
import shutil
import uuid

from database import engine, get_db, Base
import models
import schemas
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, get_admin_user, ACCESS_TOKEN_EXPIRE_MINUTES
)

# Criar tabelas
Base.metadata.create_all(bind=engine)

# Criar diretórios necessários
os.makedirs("data", exist_ok=True)
os.makedirs("uploads", exist_ok=True)
os.makedirs("uploads/photos", exist_ok=True)
os.makedirs("uploads/videos", exist_ok=True)

app = FastAPI(
    title="🐕 PetWalker - Gestão de Passeios e Adestramento",
    description="MVP para gerenciamento de passeios e adestramento de cães",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir arquivos estáticos
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/static", StaticFiles(directory="static"), name="static")

# ============ ROTAS DE AUTENTICAÇÃO ============

@app.post("/api/auth/register", response_model=schemas.UserResponse, tags=["Autenticação"])
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Registrar novo usuário"""
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        name=user.name,
        phone=user.phone,
        is_admin=user.is_admin
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login", response_model=schemas.Token, tags=["Autenticação"])
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """Login de usuário"""
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos"
        )
    
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=schemas.UserResponse, tags=["Autenticação"])
def get_me(current_user: models.User = Depends(get_current_user)):
    """Obter dados do usuário logado"""
    return current_user

# ============ ROTAS DE USUÁRIOS (DONOS) ============

@app.get("/api/users", response_model=List[schemas.UserResponse], tags=["Usuários"])
def list_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Listar todos os usuários (apenas admin)"""
    return db.query(models.User).filter(models.User.is_admin == False).all()

@app.post("/api/users", response_model=schemas.UserResponse, tags=["Usuários"])
def create_owner(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Criar novo dono de pet (apenas admin)"""
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        name=user.name,
        phone=user.phone,
        is_admin=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ============ ROTAS DE CÃES ============

@app.get("/api/dogs", response_model=List[schemas.DogResponse], tags=["Cães"])
def list_dogs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Listar todos os cães (apenas admin)"""
    return db.query(models.Dog).all()

@app.post("/api/dogs", response_model=schemas.DogResponse, tags=["Cães"])
def create_dog(
    dog: schemas.DogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Criar novo perfil de cão (apenas admin)"""
    # Verificar se o dono existe
    owner = db.query(models.User).filter(models.User.id == dog.owner_id).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Dono não encontrado")
    
    db_dog = models.Dog(**dog.model_dump())
    db.add(db_dog)
    db.commit()
    db.refresh(db_dog)
    return db_dog

@app.get("/api/dogs/{dog_id}", response_model=schemas.DogFullProfile, tags=["Cães"])
def get_dog(
    dog_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Obter perfil completo do cão (apenas admin)"""
    dog = db.query(models.Dog).filter(models.Dog.id == dog_id).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Cão não encontrado")
    return dog

@app.put("/api/dogs/{dog_id}", response_model=schemas.DogResponse, tags=["Cães"])
def update_dog(
    dog_id: int,
    dog_update: schemas.DogUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Atualizar dados do cão (apenas admin)"""
    dog = db.query(models.Dog).filter(models.Dog.id == dog_id).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Cão não encontrado")
    
    update_data = dog_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(dog, key, value)
    
    db.commit()
    db.refresh(dog)
    return dog

@app.delete("/api/dogs/{dog_id}", tags=["Cães"])
def delete_dog(
    dog_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Deletar cão (apenas admin)"""
    dog = db.query(models.Dog).filter(models.Dog.id == dog_id).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Cão não encontrado")
    
    db.delete(dog)
    db.commit()
    return {"message": "Cão removido com sucesso"}

# ============ ROTA PÚBLICA - PERFIL DO CÃO ============

@app.get("/api/public/dog/{access_code}", response_model=schemas.DogFullProfile, tags=["Público"])
def get_public_dog_profile(access_code: str, db: Session = Depends(get_db)):
    """Visualizar perfil público do cão pelo código de acesso"""
    dog = db.query(models.Dog).filter(models.Dog.access_code == access_code).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    return dog

# ============ ROTAS DE PASSEIOS ============

@app.get("/api/walks", response_model=List[schemas.WalkResponse], tags=["Passeios"])
def list_walks(
    dog_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Listar passeios (apenas admin)"""
    query = db.query(models.Walk)
    if dog_id:
        query = query.filter(models.Walk.dog_id == dog_id)
    return query.order_by(models.Walk.scheduled_date.desc()).all()

@app.post("/api/walks", response_model=schemas.WalkResponse, tags=["Passeios"])
def create_walk(
    walk: schemas.WalkCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Agendar novo passeio (apenas admin)"""
    dog = db.query(models.Dog).filter(models.Dog.id == walk.dog_id).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Cão não encontrado")
    
    db_walk = models.Walk(**walk.model_dump())
    db.add(db_walk)
    db.commit()
    db.refresh(db_walk)
    return db_walk

@app.put("/api/walks/{walk_id}", response_model=schemas.WalkResponse, tags=["Passeios"])
def update_walk(
    walk_id: int,
    walk_update: schemas.WalkUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Atualizar passeio (apenas admin)"""
    walk = db.query(models.Walk).filter(models.Walk.id == walk_id).first()
    if not walk:
        raise HTTPException(status_code=404, detail="Passeio não encontrado")
    
    update_data = walk_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(walk, key, value)
    
    db.commit()
    db.refresh(walk)
    return walk

@app.delete("/api/walks/{walk_id}", tags=["Passeios"])
def delete_walk(
    walk_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Deletar passeio (apenas admin)"""
    walk = db.query(models.Walk).filter(models.Walk.id == walk_id).first()
    if not walk:
        raise HTTPException(status_code=404, detail="Passeio não encontrado")
    
    db.delete(walk)
    db.commit()
    return {"message": "Passeio removido com sucesso"}

# ============ ROTAS DE ADESTRAMENTO ============

@app.get("/api/trainings", response_model=List[schemas.TrainingResponse], tags=["Adestramento"])
def list_trainings(
    dog_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Listar sessões de adestramento (apenas admin)"""
    query = db.query(models.Training)
    if dog_id:
        query = query.filter(models.Training.dog_id == dog_id)
    return query.order_by(models.Training.scheduled_date.desc()).all()

@app.post("/api/trainings", response_model=schemas.TrainingResponse, tags=["Adestramento"])
def create_training(
    training: schemas.TrainingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Agendar nova sessão de adestramento (apenas admin)"""
    dog = db.query(models.Dog).filter(models.Dog.id == training.dog_id).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Cão não encontrado")
    
    db_training = models.Training(**training.model_dump())
    db.add(db_training)
    db.commit()
    db.refresh(db_training)
    return db_training

@app.put("/api/trainings/{training_id}", response_model=schemas.TrainingResponse, tags=["Adestramento"])
def update_training(
    training_id: int,
    training_update: schemas.TrainingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Atualizar sessão de adestramento (apenas admin)"""
    training = db.query(models.Training).filter(models.Training.id == training_id).first()
    if not training:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    update_data = training_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(training, key, value)
    
    db.commit()
    db.refresh(training)
    return training

@app.delete("/api/trainings/{training_id}", tags=["Adestramento"])
def delete_training(
    training_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Deletar sessão de adestramento (apenas admin)"""
    training = db.query(models.Training).filter(models.Training.id == training_id).first()
    if not training:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    db.delete(training)
    db.commit()
    return {"message": "Sessão removida com sucesso"}

# ============ ROTAS DE MÍDIA (FOTOS/VÍDEOS) ============

@app.post("/api/dogs/{dog_id}/media", response_model=schemas.MediaResponse, tags=["Mídia"])
async def upload_media(
    dog_id: int,
    file: UploadFile = File(...),
    caption: str = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Upload de foto ou vídeo (apenas admin)"""
    dog = db.query(models.Dog).filter(models.Dog.id == dog_id).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Cão não encontrado")
    
    # Determinar tipo de arquivo
    content_type = file.content_type
    if content_type.startswith("image/"):
        file_type = "image"
        folder = "photos"
    elif content_type.startswith("video/"):
        file_type = "video"
        folder = "videos"
    else:
        raise HTTPException(status_code=400, detail="Tipo de arquivo não suportado")
    
    # Gerar nome único
    extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{extension}"
    file_path = f"uploads/{folder}/{filename}"
    
    # Salvar arquivo
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Salvar no banco
    db_media = models.Media(
        dog_id=dog_id,
        file_path=f"/{file_path}",
        file_type=file_type,
        caption=caption
    )
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    
    return db_media

@app.get("/api/dogs/{dog_id}/media", response_model=List[schemas.MediaResponse], tags=["Mídia"])
def list_media(
    dog_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Listar mídias de um cão (apenas admin)"""
    return db.query(models.Media).filter(models.Media.dog_id == dog_id).all()

@app.delete("/api/media/{media_id}", tags=["Mídia"])
def delete_media(
    media_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Deletar mídia (apenas admin)"""
    media = db.query(models.Media).filter(models.Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Mídia não encontrada")
    
    # Deletar arquivo físico
    try:
        file_path = media.file_path.lstrip("/")
        if os.path.exists(file_path):
            os.remove(file_path)
    except:
        pass
    
    db.delete(media)
    db.commit()
    return {"message": "Mídia removida com sucesso"}

# ============ DASHBOARD STATS ============

@app.get("/api/stats", tags=["Dashboard"])
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Obter estatísticas do dashboard (apenas admin)"""
    total_dogs = db.query(models.Dog).count()
    total_owners = db.query(models.User).filter(models.User.is_admin == False).count()
    total_walks = db.query(models.Walk).count()
    pending_walks = db.query(models.Walk).filter(models.Walk.status == "agendado").count()
    total_trainings = db.query(models.Training).count()
    pending_trainings = db.query(models.Training).filter(models.Training.status == "agendado").count()
    
    return {
        "total_dogs": total_dogs,
        "total_owners": total_owners,
        "total_walks": total_walks,
        "pending_walks": pending_walks,
        "total_trainings": total_trainings,
        "pending_trainings": pending_trainings
    }

# ============ FRONTEND ============

@app.get("/", include_in_schema=False)
def serve_frontend():
    """Servir frontend"""
    return FileResponse("static/index.html")

@app.get("/pet/{access_code}", include_in_schema=False)
def serve_pet_profile(access_code: str):
    """Servir página de perfil do pet"""
    return FileResponse("static/index.html")

# ============ STARTUP ============

@app.on_event("startup")
def startup_event():
    """Criar admin padrão se não existir"""
    db = next(get_db())
    admin = db.query(models.User).filter(models.User.email == "admin@petwalker.com").first()
    if not admin:
        admin = models.User(
            email="admin@petwalker.com",
            hashed_password=get_password_hash("admin123"),
            name="Administrador",
            is_admin=True
        )
        db.add(admin)
        db.commit()
        print("[OK] Admin padrao criado: admin@petwalker.com / admin123")
    db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

