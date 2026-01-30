from __future__ import annotations

import os
import secrets
from datetime import datetime, timezone
from pathlib import Path
import json
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

APP_NAME = "AI Website Builder — Builder Workspace API"
PRODUCT = "AI Website Builder"
WORKSPACE = "builder-workspace"
BUILD_STAMP = os.environ.get("BUILDER_BUILD_STAMP", "BUILDER_WORKSPACE_API_DXL_BW_01_2026-01-30")

# simple local storage
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

def _project_path(project_id: str) -> Path:
    return DATA_DIR / f"project_{project_id}.json"

def load_project(project_id: str) -> Optional[Dict[str, Any]]:
    p = _project_path(project_id)
    if not p.exists():
        return None
    return json.loads(p.read_text(encoding="utf-8"))

def save_project(project_id: str, data: Dict[str, Any]) -> None:
    p = _project_path(project_id)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def new_project_id() -> str:
    return "p_" + secrets.token_hex(6)

class SitePage(BaseModel):
    path: str = Field(..., examples=["/"])
    title: str = Field(..., examples=["Home"])
    sections: list[dict[str, Any]] = Field(default_factory=list)

class SiteSpec(BaseModel):
    version: str = "1"
    theme: dict[str, Any] = Field(default_factory=dict)
    pages: list[SitePage] = Field(default_factory=list)

class Project(BaseModel):
    projectId: str
    name: str
    createdAt: str
    spec: SiteSpec

class CreateProjectRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)

class SaveSpecRequest(BaseModel):
    spec: SiteSpec

app = FastAPI(title=APP_NAME, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {
        "ok": True,
        "product": PRODUCT,
        "workspace": WORKSPACE,
        "service": APP_NAME,
        "stamp": BUILD_STAMP,
        "now": now_iso(),
    }

@app.get("/api/builder/ping")
def builder_ping():
    return {"ok": True, "product": PRODUCT, "workspace": WORKSPACE, "stamp": BUILD_STAMP}

@app.post("/api/builder/projects")
def create_project(body: CreateProjectRequest):
    pid = new_project_id()
    proj = Project(projectId=pid, name=body.name, createdAt=now_iso(), spec=SiteSpec(pages=[]))
    save_project(pid, proj.model_dump())
    return {"ok": True, "project": proj.model_dump()}

@app.get("/api/builder/projects/{projectId}")
def get_project(projectId: str):
    data = load_project(projectId)
    if not data:
        raise HTTPException(status_code=404, detail="project_not_found")
    return {"ok": True, "project": data}

@app.get("/api/builder/projects/{projectId}/spec")
def get_spec(projectId: str):
    data = load_project(projectId)
    if not data:
        raise HTTPException(status_code=404, detail="project_not_found")
    return {"ok": True, "spec": data.get("spec")}

@app.put("/api/builder/projects/{projectId}/spec")
def save_spec(projectId: str, body: SaveSpecRequest):
    data = load_project(projectId)
    if not data:
        raise HTTPException(status_code=404, detail="project_not_found")
    data["spec"] = body.spec.model_dump()
    save_project(projectId, data)
    return {"ok": True, "projectId": projectId}