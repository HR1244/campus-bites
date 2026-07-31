from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: int
    role: str

    class Config:
        from_attributes = True

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ItemVariantBase(BaseModel):
    id: str
    brand: str
    name: str
    price: float
    mrp: float
    img: str

class ItemVariantCreate(ItemVariantBase):
    menu_item_id: int

class ItemVariantResponse(ItemVariantBase):
    class Config:
        from_attributes = True

class MenuItemBase(BaseModel):
    id: int
    name: str
    img: str
    category: str
    price: float
    desc: str
    veg: bool
    is_featured: bool = False

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemResponse(MenuItemBase):
    variants: List[ItemVariantResponse] = []

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    id: str
    user_name: str
    user_email: str
    phone: str
    hostel: str
    room: str
    orderType: Optional[str] = None
    paymentMethod: Optional[str] = None
    items: str # JSON string of cart items
    total: float
    status: str = "Pending"

class OrderCreate(OrderBase):
    user_id: Optional[int] = None

class OrderResponse(OrderBase):
    date: datetime

    class Config:
        from_attributes = True

class ReviewBase(BaseModel):
    item_id: int
    user_name: str
    rating: int
    comment: str

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    date: datetime

    class Config:
        from_attributes = True

class RazorpayOrderRequest(BaseModel):
    amount: float

class RazorpayVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
