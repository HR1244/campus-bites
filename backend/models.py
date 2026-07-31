from sqlalchemy import Column, Integer, String, Boolean, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="user") # 'admin' or 'user'
    reset_token = Column(String, index=True, nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True) # Let's use Integer since menuData.js uses 1, 2, 3
    name = Column(String, index=True)
    img = Column(String)
    category = Column(String, index=True)
    price = Column(Float)
    desc = Column(Text)
    veg = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)

    variants = relationship("ItemVariant", back_populates="menu_item")

class ItemVariant(Base):
    __tablename__ = "item_variants"

    id = Column(String, primary_key=True, index=True) # e.g., 'cd_coke_250'
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"))
    brand = Column(String)
    name = Column(String)
    price = Column(Float)
    mrp = Column(Float)
    img = Column(String)

    menu_item = relationship("MenuItem", back_populates="variants")

class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, index=True) # e.g., 'ORD-123456'
    user_id = Column(Integer, ForeignKey("users.id"))
    user_name = Column(String)
    user_email = Column(String)
    phone = Column(String)
    hostel = Column(String)
    room = Column(String)
    
    items = Column(Text) # JSON string of cart items
    total = Column(Float)
    status = Column(String, default="Pending") # Pending, Completed, Cancelled
    date = Column(DateTime, default=datetime.utcnow)
    orderType = Column(String)
    paymentMethod = Column(String)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("menu_items.id"))
    user_name = Column(String)
    rating = Column(Integer)
    comment = Column(Text)
    date = Column(DateTime, default=datetime.utcnow)
