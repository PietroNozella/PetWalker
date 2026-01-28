# 🐕 PetWalker - MVP de Gestão de Passeios e Adestramento

<div align="center">

![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.109-green.svg)
![SQLite](https://img.shields.io/badge/sqlite-3-lightgrey.svg)

**Um sistema simples e completo para adestradores gerenciarem passeios e adestramento de cães, com perfis compartilháveis para os donos dos pets.**

</div>

---

## 📋 Funcionalidades

### 👩‍🏫 Para a Adestradora (Admin)
- ✅ **Gerenciar Donos** - Cadastrar e editar clientes
- ✅ **Gerenciar Cães** - Criar perfis completos para cada pet
- ✅ **Agendar Passeios** - Data, hora, duração e local
- ✅ **Agendar Adestramento** - Diferentes tipos de sessões
- ✅ **Upload de Mídia** - Fotos e vídeos dos passeios
- ✅ **Dashboard** - Visão geral dos agendamentos

### 🐕 Para o Dono do Pet
- ✅ **Perfil Compartilhável** - Link único para cada cão
- ✅ **Ver Agendamentos** - Próximos passeios e sessões
- ✅ **Galeria de Mídia** - Fotos e vídeos do pet
- ✅ **Acesso sem Login** - Apenas com o link do perfil

---

## 🚀 Instalação e Execução

### Pré-requisitos
- Python 3.10 ou superior
- pip (gerenciador de pacotes Python)

### Passo a Passo

```bash
# 1. Acesse a pasta do projeto
cd petwalker/backend

# 2. Crie um ambiente virtual (recomendado)
python -m venv venv

# 3. Ative o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 4. Instale as dependências
pip install -r requirements.txt

# 5. Execute o servidor
python main.py
```

### Acessando o Sistema

- **Aplicação:** http://localhost:8000
- **Documentação da API:** http://localhost:8000/docs

### Login Padrão
- **Email:** admin@petwalker.com
- **Senha:** admin123

---

## 📱 Como Usar

### 1. Cadastrar um Dono
1. Faça login como admin
2. Vá em "Donos" → "Novo Dono"
3. Preencha nome, email e telefone

### 2. Cadastrar um Cão
1. Vá em "Cães" → "Novo Cão"
2. Selecione o dono
3. Preencha os dados do pet

### 3. Agendar Passeio
1. Vá em "Passeios" → "Novo Passeio"
2. Selecione o cão
3. Defina data, hora, duração e local

### 4. Agendar Adestramento
1. Vá em "Adestramento" → "Nova Sessão"
2. Selecione o cão e tipo de treinamento
3. Defina data e hora

### 5. Adicionar Fotos/Vídeos
1. Vá em "Cães" → clique no ícone de olho 👁️
2. Na seção "Fotos e Vídeos", clique em "Adicionar"
3. Selecione a mídia e adicione uma legenda

### 6. Compartilhar Perfil com o Dono
1. Na lista de cães, copie o link do perfil
2. Envie o link para o dono do pet
3. O dono pode acessar sem precisar de login!

---

## 🏗️ Estrutura do Projeto

```
petwalker/
├── backend/
│   ├── main.py              # API FastAPI principal
│   ├── models.py            # Modelos SQLAlchemy
│   ├── schemas.py           # Schemas Pydantic
│   ├── database.py          # Configuração do banco
│   ├── auth.py              # Autenticação JWT
│   ├── requirements.txt     # Dependências
│   ├── data/                # Banco de dados SQLite
│   ├── uploads/             # Fotos e vídeos
│   │   ├── photos/
│   │   └── videos/
│   └── static/
│       └── index.html       # Interface frontend
└── README.md
```

---

## 🔌 API Endpoints

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Registrar usuário |
| GET | `/api/auth/me` | Dados do usuário logado |

### Cães
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dogs` | Listar todos os cães |
| POST | `/api/dogs` | Criar novo cão |
| GET | `/api/dogs/{id}` | Detalhes do cão |
| PUT | `/api/dogs/{id}` | Atualizar cão |
| DELETE | `/api/dogs/{id}` | Remover cão |

### Passeios
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/walks` | Listar passeios |
| POST | `/api/walks` | Agendar passeio |
| PUT | `/api/walks/{id}` | Atualizar passeio |
| DELETE | `/api/walks/{id}` | Cancelar passeio |

### Adestramento
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/trainings` | Listar sessões |
| POST | `/api/trainings` | Agendar sessão |
| PUT | `/api/trainings/{id}` | Atualizar sessão |
| DELETE | `/api/trainings/{id}` | Cancelar sessão |

### Mídia
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/dogs/{id}/media` | Upload de foto/vídeo |
| GET | `/api/dogs/{id}/media` | Listar mídias |
| DELETE | `/api/media/{id}` | Remover mídia |

### Público (sem autenticação)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/public/dog/{code}` | Perfil público do cão |

---

## 🎨 Screenshots

### Dashboard Admin
- Visão geral com estatísticas
- Navegação lateral intuitiva
- Design moderno e responsivo

### Perfil do Pet
- Informações completas do cão
- Próximos agendamentos
- Galeria de fotos e vídeos

---

## 🛠️ Tecnologias Utilizadas

- **Backend:** Python + FastAPI
- **Banco de Dados:** SQLite + SQLAlchemy
- **Autenticação:** JWT (JSON Web Tokens)
- **Frontend:** HTML5 + CSS3 + JavaScript (Vanilla)
- **Upload de Arquivos:** python-multipart + aiofiles

---

## 📝 Notas

- Este é um MVP para demonstração
- Para produção, considere:
  - Trocar SQLite por PostgreSQL
  - Usar storage em nuvem para mídias (S3, etc)
  - Implementar HTTPS
  - Adicionar validações extras
  - Implementar backup automático

---

## 📄 Licença

Este projeto é livre para uso educacional e pessoal.

---

<div align="center">

**Feito com ❤️ para adestradores e seus amigos de 4 patas**

🐕 PetWalker © 2026

</div>

