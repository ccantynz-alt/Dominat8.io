import uvicorn
import os
import sys

# Add the current directory to sys.path so it can find server.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    # Run server:app from the current directory
    uvicorn.run("server:app", host="0.0.0.0", port=port, log_level="info")
