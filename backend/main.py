from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import pytesseract
import io
import uuid

app = FastAPI(
    title="MetraGuard API",
    description="AI-powered Legal Metrology Compliance System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "MetraGuard API is running",
        "status": "online"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/analyze")
async def analyze_product(file: UploadFile = File(...)):
    image_bytes = await file.read()

    image = Image.open(io.BytesIO(image_bytes))

    extracted_text = pytesseract.image_to_string(
        image,
        config="--psm 6"
    )

    text = extracted_text.lower()

    detected_fields = {
        "manufacturer": any(
            word in text
            for word in [
                "manufacturer",
                "manufactured by",
                "packer",
                "importer"
            ]
        ),
        "net_quantity": any(
            word in text
            for word in [
                "net quantity",
                "net wt",
                "net weight"
            ]
        ),
        "mrp": any(
            word in text
            for word in [
                "mrp",
                "maximum retail price"
            ]
        ),
        "date_information": any(
            word in text
            for word in [
                "mfg",
                "manufactured",
                "packed",
                "date",
                "expiry"
            ]
        ),
        "consumer_care": any(
            word in text
            for word in [
                "consumer care",
                "customer care",
                "contact us"
            ]
        )
    }

    score = sum(detected_fields.values()) * 20

    if score >= 80:
        status = "Compliant"
    elif score >= 40:
        status = "Partially Compliant"
    else:
        status = "Non-Compliant"

    return {
        "inspection_id": str(uuid.uuid4()),
        "filename": file.filename,
        "status": "analysis_complete",
        "extracted_text": extracted_text,
        "compliance": {
            "compliance_status": status,
            "compliance_score": score,
            "detected_fields": detected_fields
        }
    }