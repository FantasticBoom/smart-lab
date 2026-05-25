from app.db.database import SessionLocal
from app.models.users import User, Role
from app.core.security import get_password_hash
import uuid

def seed_super_admin():
    db = SessionLocal()
    try: 
        print("[*] Memulai proses seeding data awal...")
        
        admin_role = db.query(Role).filter(Role.name_role == "Admin").first()
        if not admin_role:
            print("[*] Role 'Admin' belum ada. Membuat role baru...")
            admin_role = Role(name_role = "Admin")
            db.add(admin_role)
            db.commit()
            db.refresh(admin_role)
        
        admin_user = db.query(User).filter(User.username == "poetra").first()
        if not admin_user:
            print("[*] Membuat akun Super Admin pertama...")
            hashed_pw = get_password_hash("rahasia")
            admin_user = User(
                username="poetra",
                password_hash=hashed_pw,
                role_id=admin_role.id
            )
            db.add(admin_user)
            db.commit()
            
            print("\n[SUCCESS] Akun Super Admin berhasil dibuat!")
            print("=======================================")
            print("Username : username")
            print("Password : xxxxxxxxxxx")
            print("=======================================")
        else:
            print("[!] Akun 'admin_utama' sudah ada di basis data.")
            
    except Exception as e:
        print(f"[ERROR] Terjadi kesalahan saat seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_super_admin() 