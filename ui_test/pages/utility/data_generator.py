from datetime import datetime, timezone
from uuid import uuid4
import random
import string

def unique_email():
    """Return a unique test email. (0 params)"""
    ts = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S%f")
    return f"test_{ts}_{uuid4().hex[:6]}@example.com"

def unique_phone(prefix="+88017", limit=8):
    """Return a unique BD-style mobile number (0 params)."""
    # Basic 11-digit local format starting with '017'
    tail = "".join(str(random.randint(0, 9)) for _ in range(limit))
    return prefix + tail

def unique_password(length=10):
    """Return a unique password with at least 1 uppercase, 1 lowercase, 1 digit, and 1 symbol."""
    if length < 4:
        raise ValueError("Password length must be at least 4.")

    symbols = "@$!%*?&"
    password = [
        random.choice(string.ascii_uppercase),
        random.choice(string.ascii_lowercase),
        random.choice(string.digits),
        random.choice(symbols)
    ]

    all_chars = string.ascii_letters + string.digits + symbols
    password += [random.choice(all_chars) for _ in range(length - 4)]

    random.shuffle(password)
    return ''.join(password)

def unique_name():
    """Return a random 'name' for test automation (not from a list)."""
    first_len = random.randint(4, 7)
    last_len = random.randint(4, 7)
    first = ''.join(random.choices(string.ascii_letters, k=first_len))
    last = ''.join(random.choices(string.ascii_letters, k=last_len))
    return f"{first} {last}"

def unique_address():
    """Return a random Bangladesh-style address for test automation."""
    cities = ["Dhaka", "Chattogram", "Khulna", "Rajshahi", "Sylhet", "Barisal", "Rangpur", "Mymensingh"]
    area = ''.join(random.choices(string.ascii_letters, k=random.randint(5, 8))).capitalize()
    house = f"House-{random.randint(1, 200)}"
    road = f"Road-{random.randint(1, 50)}"
    city = random.choice(cities)
    postcode = f"{random.randint(1000, 9999)}"
    return f"{house}, {road}, {area}, {city} {postcode}, Bangladesh"