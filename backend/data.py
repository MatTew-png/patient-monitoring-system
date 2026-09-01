import websocket
import json

def on_message(ws, message):
    print("Received:", message)

def on_open(ws):
    print("Connected!")
    ws.send(json.dumps({"cmd": "start_adc_reading"}))

ws = websocket.WebSocketApp("ws://192.168.17.7/ws",
                            on_open=on_open,
                            on_message=on_message)
ws.run_forever()
