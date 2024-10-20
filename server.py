from flask import Flask, request, jsonify
import socket
from flask_cors import CORS
from concurrent.futures import ThreadPoolExecutor, as_completed

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# List of common ports to scan
common_ports = [
    20, 21, 22, 23, 25, 53, 67, 68, 69, 80, 110, 119, 123, 143, 161, 162,
    194, 443, 465, 514, 587, 631, 993, 995, 1433, 1521, 3306, 3389, 5060,
    5061, 5900, 8080
]

def scan_port(ip, port):
    """Scan a single port."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1)  # 1-second timeout
        result = s.connect_ex((ip, port))
        s.close()
        return port, result == 0
    except Exception as e:
        return port, None  # Return None for any error

@app.route('/scan', methods=['POST'])
def scan():
    data = request.json
    ip = data.get('ip')
    custom_ports = data.get('ports', [])

    if not ip:
        return jsonify({'error': 'IP address is required.'}), 400

    ports_to_scan = (
        [int(port) for port in custom_ports] if custom_ports else common_ports
    )

    results = {}
    # Using ThreadPoolExecutor to scan ports concurrently
    import os
    max_workers = os.cpu_count() * 100  # Adjust based on your needs
    print(os.cpu_count())

    with ThreadPoolExecutor(max_workers) as executor:
        futures = {executor.submit(scan_port, ip, port): port for port in ports_to_scan}

        for future in as_completed(futures):
            port, is_open = future.result()
            if is_open is None:
                results[port] = "Error"
            elif is_open:
                results[port] = "OPEN"
            else:
                results[port] = "CLOSED"

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
