import os
from flask import Flask, jsonify, render_template
from dotenv import load_dotenv
import requests
load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv('EXCHANGE_RATE_API_KEY')
BASE_URL = 'https://v6.exchangerate-api.com/v6'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/rates/<base>')
def get_rates(base):
    try:
        response = requests.get(f'{BASE_URL}/{API_KEY}/latest/{base.upper()}')
        response.raise_for_status()
        data = response.json()
        return jsonify({
            'base': data['base_code'],
            'rates': data['conversion_rates'],
            'last_updated': data['time_last_update_utc']
        })
    except requests.exceptions.RequestException:
        return jsonify({'error': 'Failed to fetch rates'}), 500

@app.route('/api/codes')
def get_codes():
    try:
        response = requests.get(f'{BASE_URL}/{API_KEY}/codes')
        response.raise_for_status()
        data = response.json()
        return jsonify({
            'codes': data['supported_codes']
        })
    except requests.exceptions.RequestException:
        return jsonify({'error': 'Failed to fetch currency codes'}), 500

if __name__ == '__main__':
    app.run(debug=False)