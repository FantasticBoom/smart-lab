from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.api.v1 import auth, users, inventory, logs, websocket


limiter = Limiter(key_func=get_remote_address)


app = FastAPI(
    title="System Management Smart Laboratory UIGM",
    description="API Management smart Laboratory UIGM System",
    version="1.0.0"
)

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler) #type: ignore

# router
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(inventory.router)
app.include_router(logs.router)

# router ws
app.include_router(websocket.router, prefix="/api/v1")



@app.get("/")
def root():
    return {"message": "Selamat datang di API System Management Lab Computer UIGM"}