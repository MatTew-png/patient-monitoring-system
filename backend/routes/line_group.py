from fastapi import APIRouter, Depends, HTTPException,Request
from sqlalchemy.orm import Session
from typing import List

from models.base import get_db
from crud import line_group as crud_line_group
from schemas import line_group as schemas_line_group

router = APIRouter(
    prefix="/line_group",
    tags=["line_group"]
)


@router.get("/", response_model=List[schemas_line_group.LineGroup])
def read_line_groups(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_line_group.get_line_groups(db, skip=skip, limit=limit)

@router.get("/{line_group_id}", response_model=schemas_line_group.LineGroup)
def read_line_group(line_group_id: str, db: Session = Depends(get_db)):

    db_line_group = crud_line_group.get_line_group(db, line_group_id=line_group_id)
    return db_line_group

@router.put("/{line_group_id}")
def update_line_group(line_group_id: str, line_group: schemas_line_group.LineGroupUpdate, db: Session = Depends(get_db)):
    db_line_group = crud_line_group.get_line_group(db, line_group_id=line_group_id)
    return crud_line_group.update_line_group(db=db, db_obj=db_line_group, obj_in=line_group)

@router.delete("/{line_group_id}", response_model=schemas_line_group.LineGroup)
def delete_line_group(line_group_id: str, db: Session = Depends(get_db)):
    return crud_line_group.delete_line_group(db, line_group_id=line_group_id)

@router.post("/webhook")
async def line_group_webhook(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    events = body.get("events", [])

    results = []
    for event in events:
        event_type = event.get("type")
        source = event.get("source", {})

        if event_type == "join" and source.get("type") == "group":
            group_id = source.get("groupId")
            crud_line_group.create_line_group_byId(group_id,db)

    return {"ok": True, "results": results}