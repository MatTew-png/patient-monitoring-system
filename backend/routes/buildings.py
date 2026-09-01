from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from models import buildings as models
from schemas import buildings as schemas
from models.base import SessionLocal
from models.base import engine, Base, get_db
import crud.buildings as crud
from models import buildings as models_building 
from models import floors as models_floor 
from schemas import buildings as schemas_building 
from schemas import floors as schemas_floor 
from models.base import get_db
import crud.buildings as crud
from fastapi.responses import JSONResponse

router = APIRouter(
    prefix="/buildings",
    tags=["buildings"],
    responses={404: {"description": "Not found"}},
)

# Dependency: Get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get all buildings
@router.get("/")
def get_buildings(db: Session = Depends(get_db)):
    return crud.get_buildings(db=db)

# Get building by ID
@router.get("/{building_id}", response_model=schemas.BuildingResponse)
def get_building(building_id: int, db: Session = Depends(get_db)):
    building = db.query(models.Building).filter(models.Building.building_id == building_id,models.Building.deleted_at.is_(None)).first()
    if not building:
        raise HTTPException(status_code=404, detail="Building not found")
    return building

# Create a new building
@router.post("/", response_model=schemas.BuildingResponse)
def create_building(building_input: schemas.BuildingCreate, db: Session = Depends(get_db)):
    return crud.create_building(building_create_data=building_input, db=db)

# Update building
@router.patch("/{building_id}", response_model=schemas_building.BuildingResponse)
def edit_building_and_floors(
    building_id: int,
    payload: schemas_building.BuildingUpdateWithFloorCount,
    db: Session = Depends(get_db)
):
    try:
        return crud.update_building_and_floors(
            db=db,
            building_id=building_id,
            building_name=payload.building_name,
            floor_count=payload.floor_count,
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error updating building: {e}")
        raise HTTPException(status_code=500, detail="Failed to update building")

# Delete building
@router.delete("/{building_id}")
def delete_building(building_id: int, db: Session = Depends(get_db)):
    return crud.softdelete_building(building_id, db)


@router.post("/create_with_floors", response_model=schemas_building.BuildingResponse)
def create_building_with_floors_route(
    building_data: schemas_building.BuildingCreateWithFloors,
    db: Session = Depends(get_db)
):
    try:
        created_building = crud.create_building_and_floors(
            db=db,
            building_data=schemas_building.BuildingCreate(building_name=building_data.building_name),
            floor_count=building_data.floor_count  # ✅ ส่งจำนวนชั้นแทน floors[]
        )
        return created_building

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create building and floors")

@router.post("/import_location", response_class=JSONResponse)
async def import_location(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    contents = await file.read()
    result = crud.import_location_from_csv(contents, db)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to import locations")
    return result