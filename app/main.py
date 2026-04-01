from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import BACKEND_CORS_ORIGINS
from app.routes import transactions, summary, auth


app = FastAPI(
    title="Budget API",
    description="Personal budget tracking API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router, prefix="/transactions")
app.include_router(summary.router, prefix="/summary")
app.include_router(auth.router, prefix="/auth")

@app.get("/")
def root():
    return {"message": "Budget API is running"}
