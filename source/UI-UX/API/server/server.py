#!/usr/bin/env python3
"""
Simple Flask server to save UserAccount.json automatically
Run this server to enable automatic file saving without user prompts
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get directories
# From API/server/ go up 2 levels to reach UI-UX/
BASE_DIR = Path(__file__).parent.parent.parent
UI_UX_DIR = BASE_DIR
STATIC_FOLDER = str(UI_UX_DIR)
USER_ACCOUNT_FILE = UI_UX_DIR / 'UserAccount.json'

# Set static folder to serve files from UI-UX directory
app.static_folder = STATIC_FOLDER
app.static_url_path = ''

# API routes must be defined BEFORE catch-all routes
@app.route('/api/save-accounts', methods=['POST'])
def save_accounts():
    """Save user accounts to UserAccount.json"""
    try:
        data = request.json
        
        if not isinstance(data, list):
            return jsonify({'error': 'Data must be an array'}), 400
        
        # Write to UserAccount.json in UI-UX directory
        with open(USER_ACCOUNT_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f'Saved {len(data)} accounts to UserAccount.json')
        return jsonify({
            'success': True,
            'message': f'Saved {len(data)} accounts',
            'count': len(data)
        })
    except Exception as e:
        print(f'Error saving accounts: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/load-accounts', methods=['GET'])
def load_accounts():
    """Load user accounts from UserAccount.json"""
    try:
        if USER_ACCOUNT_FILE.exists():
            with open(USER_ACCOUNT_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return jsonify(data)
        else:
            return jsonify([])
    except Exception as e:
        print(f'Error loading accounts: {e}')
        return jsonify({'error': str(e)}), 500

# Static file routes - must be defined AFTER API routes
@app.route('/')
def index():
    """Serve the main HTML file"""
    return send_from_directory(STATIC_FOLDER, 'index.html')

@app.route('/assets/<path:path>')
def serve_assets(path):
    """Serve assets files"""
    return send_from_directory(STATIC_FOLDER, f'assets/{path}')

@app.route('/<path:path>')
def serve_static(path):
    """Serve other static files"""
    # Don't handle API routes here (they're already handled above)
    if path.startswith('api/'):
        return None
    
    # Serve other files
    try:
        return send_from_directory(STATIC_FOLDER, path)
    except Exception as e:
        return None

if __name__ == '__main__':
    print('Starting Flask server...')
    print(f'Server location: {Path(__file__).parent.absolute()}')
    print(f'UserAccount.json location: {USER_ACCOUNT_FILE.absolute()}')
    print(f'Static files location: {STATIC_FOLDER}')
    print('Server running at http://localhost:5000')
    print('Open http://localhost:5000 in your browser')
    app.run(debug=True, port=5000, host='127.0.0.1')

