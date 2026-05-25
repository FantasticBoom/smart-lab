import asyncio
import websockets
import json
import ctypes
import uuid
import sys


#Config server proxmox
SERVER_IP = "localhost" 
SERVER_PORT = "8000"

def get_mac_address() -> str:
    """Mendapatkan MAC Address fisik asli dari komputer Windows."""
    mac_num = uuid.getnode()
    mac_hex = f"{mac_num:012x}"
    return ":".join(mac_hex[i:i+2] for i in range(0, 12, 2)).upper()

CLIENT_ID = get_mac_address()
SERVER_URI = f"ws://{SERVER_IP}:{SERVER_PORT}/api/v1/ws/agent/{CLIENT_ID}"

#logic lock screen
def lock_windows_screen():
    """Mengunci workstation Windows secara paksa melalui user32.dll."""
    try:
        ctypes.windll.user32.LockWorkStation() #type: ignore
    except Exception as e:
        pass # Mencegah crash jika terjadi interupsi OS

def unlock_windows_screen():
    """Membangunkan layar monitor Windows via instruksi low-level."""
    try:
        # Mengirim sinyal SC_MONITORPOWER (Power ON) ke subsistem GUI Windows
        ctypes.windll.user32.SendMessageW(0xFFFF, 0x0112, 0xF170, -1) #type: ignore
    except Exception as e:
        pass

# logic menjalankan agent
async def start_agent_service():
    while True:
        try:
            async with websockets.connect(SERVER_URI) as websocket:
                while True:
                    message = await websocket.recv()
                    payload = json.loads(message)
                    action = payload.get("action")
                    
                    if action == "LOCK":
                        lock_windows_screen()
                        await websocket.send(json.dumps({"status": "LOCKED", "mac": CLIENT_ID}))
                        
                    elif action == "UNLOCK":
                        unlock_windows_screen()
                        await websocket.send(json.dumps({"status": "UNLOCKED", "mac": CLIENT_ID}))
                        
        except (websockets.exceptions.ConnectionClosed, Exception):
            await asyncio.sleep(5)

if __name__ == "__main__":
    if sys.platform != "win32":
        sys.exit(1)
        
    asyncio.run(start_agent_service())