import subprocess
import sys
import os

def install_requirements():
    """Install all required packages"""
    print("🔧 Installing required packages...")
    
    # Get the backend directory path
    # backend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend")
    # requirements_file = os.path.join(backend_dir, "requirements.txt")
    requirements_file = "requirements.txt"
    
    
    if not os.path.exists(requirements_file):
        print("❌ requirements.txt not found!")
        return False
    
    try:
        # Install requirements
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", requirements_file
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ All packages installed successfully!")
            print("📦 Installed packages:")
            print("  - fastapi")
            print("  - uvicorn") 
            print("  - sqlalchemy")
            print("  - pydantic")
            print("  - requests")
            return True
        else:
            print(f"❌ Installation failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error installing packages: {e}")
        return False

if __name__ == "__main__":
    install_requirements()
