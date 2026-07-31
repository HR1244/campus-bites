from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import bcrypt
import razorpay
import os

import models, schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

from sqlalchemy import text
def run_migrations():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR"))
            conn.commit()
        except Exception:
            pass
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMP"))
            conn.commit()
        except Exception:
            pass
            
        try:
            conn.execute(text("ALTER TABLE orders ADD COLUMN \"orderType\" VARCHAR"))
            conn.commit()
        except Exception:
            pass

        try:
            conn.execute(text("ALTER TABLE orders ADD COLUMN \"paymentMethod\" VARCHAR"))
            conn.commit()
        except Exception:
            pass
run_migrations()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

@app.get("/")
def read_root():
    return {"message": "Welcome to the Campus Bites API"}

# --- AUTH ---
@app.post("/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    role = "user"
    
    db_user = models.User(name=user.name, email=user.email, password=hashed_password, role=role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/auth/login", response_model=schemas.UserResponse)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    return db_user

@app.post("/auth/forgot-password")
def forgot_password(req: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == req.email).first()
    if not db_user:
        # Don't reveal if email exists or not for security, just return success
        return {"message": "If the email is registered, a reset link will be sent."}
    
    import random
    from datetime import datetime, timedelta
    
    otp = str(random.randint(100000, 999999))
    db_user.reset_token = otp
    db_user.reset_token_expiry = datetime.utcnow() + timedelta(minutes=15)
    db.commit()
    
    # Try sending email
    smtp_email = os.environ.get("SMTP_EMAIL")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    
    if smtp_email and smtp_password:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        msg = MIMEMultipart()
        msg['From'] = f"Campus Bites <{smtp_email}>"
        msg['To'] = db_user.email
        msg['Subject'] = "Password Reset OTP"
        
        body = f"""Hello {db_user.name},

You recently requested to reset your password for your Campus Bites account.

Your password reset OTP is: {otp}

If you did not request a password reset, please ignore this email. This OTP is only valid for the next 15 minutes.

Thanks,
Campus Bites Team"""
        msg.attach(MIMEText(body, 'plain'))
        
        try:
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
            server.quit()
        except Exception as e:
            print("Failed to send email:", str(e))
    else:
        # Fallback for development if SMTP is not configured
        print(f"\n--- PASSWORD RESET OTP (dev mode) ---\n{otp}\n--------------------------------------\n")
        
    return {"message": "If the email is registered, an OTP will be sent."}

@app.post("/auth/reset-password")
def reset_password(req: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    from datetime import datetime
    
    db_user = db.query(models.User).filter(
        models.User.reset_token == req.token,
        models.User.reset_token_expiry > datetime.utcnow()
    ).first()
    
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
    db_user.password = get_password_hash(req.new_password)
    db_user.reset_token = None
    db_user.reset_token_expiry = None
    db.commit()
    
    return {"message": "Password updated successfully"}

# --- MENU ITEMS ---
@app.get("/api/menu", response_model=List[schemas.MenuItemResponse])
def get_menu(db: Session = Depends(get_db)):
    return db.query(models.MenuItem).order_by(models.MenuItem.id.asc()).all()

@app.post("/api/menu", response_model=schemas.MenuItemResponse)
def create_menu_item(item: schemas.MenuItemCreate, db: Session = Depends(get_db)):
    db_item = models.MenuItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/api/menu/{item_id}", response_model=schemas.MenuItemResponse)
def update_menu_item(item_id: int, item: schemas.MenuItemCreate, db: Session = Depends(get_db)):
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    for key, value in item.model_dump().items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/api/menu/{item_id}")
def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Item deleted"}

# --- ORDERS ---
@app.get("/api/orders", response_model=List[schemas.OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    return db.query(models.Order).order_by(models.Order.date.desc()).all()

@app.post("/api/orders", response_model=schemas.OrderResponse)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    db_order = models.Order(**order.model_dump())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@app.put("/api/orders/{order_id}/status", response_model=schemas.OrderResponse)
def update_order_status(order_id: str, status: str, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db_order.status = status
    db.commit()
    db.refresh(db_order)
    return db_order

# --- REVIEWS ---
@app.get("/api/reviews", response_model=List[schemas.ReviewResponse])
def get_reviews(db: Session = Depends(get_db)):
    return db.query(models.Review).order_by(models.Review.date.desc()).all()

# --- RAZORPAY ---
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "rzp_test_TFl0tKSbKXpskR")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "2RZOShXQeVO7xOD0DGWGlh3k")
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

@app.post("/api/create-payment-order")
def create_payment_order(order_req: schemas.RazorpayOrderRequest):
    try:
        order_amount = int(order_req.amount * 100) # Razorpay works in paise
        order_currency = "INR"
        razorpay_order = razorpay_client.order.create(dict(amount=order_amount, currency=order_currency))
        return {"order_id": razorpay_order['id']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/verify-payment")
def verify_payment(verify_req: schemas.RazorpayVerifyRequest):
    try:
        params_dict = {
            'razorpay_order_id': verify_req.razorpay_order_id,
            'razorpay_payment_id': verify_req.razorpay_payment_id,
            'razorpay_signature': verify_req.razorpay_signature
        }
        razorpay_client.utility.verify_payment_signature(params_dict)
        return {"status": "success"}
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Signature verification failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/reviews", response_model=schemas.ReviewResponse)
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    db_review = models.Review(**review.model_dump())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

