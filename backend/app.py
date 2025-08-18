#!/usr/bin/env python3
"""
Pension Management System - Python Backend API
Integrates with Vue.js Dashboard for real-time data processing
"""

from flask import Flask, jsonify, request, cors
from flask_cors import CORS
import json
import random
from datetime import datetime, timedelta
import sqlite3
import os
from typing import Dict, List, Any
import pandas as pd
import numpy as np
import bar_chart_race as bcr

app = Flask(__name__)
CORS(app)  # Enable CORS for Vue.js frontend

# Database setup
DB_PATH = 'pension_data.db'

def init_database():
    """Initialize SQLite database with sample data"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pensioners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pension_id TEXT UNIQUE,
            name TEXT,
            age INTEGER,
            district TEXT,
            state TEXT,
            status TEXT,
            amount REAL,
            last_verification DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS verifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pension_id TEXT,
            verification_type TEXT,
            status TEXT,
            verified_by TEXT,
            verification_date DATE,
            location TEXT,
            FOREIGN KEY (pension_id) REFERENCES pensioners (pension_id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            metric_name TEXT,
            metric_value REAL,
            date DATE,
            category TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

def generate_sample_data():
    """Generate sample pension data"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if data already exists
    cursor.execute("SELECT COUNT(*) FROM pensioners")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return
    
    # Indian states and districts
    states_districts = {
        'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Allahabad'],
        'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur'],
        'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia'],
        'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Malda'],
        'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Udaipur', 'Ajmer'],
        'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga'],
        'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar'],
        'Andhra Pradesh': ['Hyderabad', 'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool'],
        'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'],
        'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar']
    }
    
    names = [
        'राम कुमार शर्मा', 'सुनीता देवी', 'मोहन लाल गुप्ता', 'कमला देवी', 'राजेश कुमार',
        'गीता देवी', 'अशोक कुमार', 'सरस्वती देवी', 'विनोद कुमार', 'उषा देवी',
        'संजय कुमार', 'मीरा देवी', 'अनिल कुमार', 'सुधा देवी', 'प्रकाश चंद्र'
    ]
    
    statuses = ['Verified', 'Pending', 'Under Review', 'Rejected', 'Approved']
    
    # Generate 1000 sample pensioners
    for i in range(1000):
        state = random.choice(list(states_districts.keys()))
        district = random.choice(states_districts[state])
        
        pensioner_data = (
            f'UP2024{str(i+1).zfill(6)}',  # pension_id
            random.choice(names),           # name
            random.randint(60, 85),         # age
            district,                       # district
            state,                          # state
            random.choice(statuses),        # status
            round(random.uniform(5000, 25000), 2),  # amount
            (datetime.now() - timedelta(days=random.randint(1, 365))).date()  # last_verification
        )
        
        cursor.execute('''
            INSERT INTO pensioners (pension_id, name, age, district, state, status, amount, last_verification)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', pensioner_data)
    
    conn.commit()
    conn.close()

# API Routes

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Get main dashboard statistics"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Total registered pensioners
    cursor.execute("SELECT COUNT(*) FROM pensioners")
    total_pensioners = cursor.fetchone()[0]
    
    # Verified this month
    cursor.execute("""
        SELECT COUNT(*) FROM pensioners 
        WHERE status = 'Verified' AND last_verification >= date('now', '-30 days')
    """)
    verified_this_month = cursor.fetchone()[0]
    
    # Pending verifications
    cursor.execute("SELECT COUNT(*) FROM pensioners WHERE status = 'Pending'")
    pending_verifications = cursor.fetchone()[0]
    
    # Total amount disbursed
    cursor.execute("SELECT SUM(amount) FROM pensioners WHERE status = 'Verified'")
    total_amount = cursor.fetchone()[0] or 0
    
    conn.close()
    
    return jsonify({
        'totalPensioners': total_pensioners,
        'verifiedThisMonth': verified_this_month,
        'pendingVerifications': pending_verifications,
        'totalAmount': round(total_amount, 2),
        'lastUpdated': datetime.now().isoformat()
    })

@app.route('/api/dashboard/age-distribution', methods=['GET'])
def get_age_distribution():
    """Get age-wise distribution data"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            CASE 
                WHEN age BETWEEN 60 AND 65 THEN '60-65'
                WHEN age BETWEEN 66 AND 70 THEN '66-70'
                WHEN age BETWEEN 71 AND 75 THEN '71-75'
                WHEN age BETWEEN 76 AND 80 THEN '76-80'
                ELSE '80+'
            END as age_group,
            COUNT(*) as count
        FROM pensioners 
        GROUP BY age_group
        ORDER BY age_group
    """)
    
    results = cursor.fetchall()
    conn.close()
    
    return jsonify([{'ageGroup': row[0], 'count': row[1]} for row in results])

@app.route('/api/dashboard/state-wise-data', methods=['GET'])
def get_state_wise_data():
    """Get state-wise pension data"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            state,
            COUNT(*) as total_pensioners,
            SUM(CASE WHEN status = 'Verified' THEN 1 ELSE 0 END) as verified,
            SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
            ROUND(AVG(amount), 2) as avg_amount
        FROM pensioners 
        GROUP BY state
        ORDER BY total_pensioners DESC
    """)
    
    results = cursor.fetchall()
    conn.close()
    
    return jsonify([{
        'state': row[0],
        'totalPensioners': row[1],
        'verified': row[2],
        'pending': row[3],
        'avgAmount': row[4]
    } for row in results])

@app.route('/api/dashboard/verification-locations', methods=['GET'])
def get_verification_locations():
    """Get verification data for map display"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get district-wise verification data with coordinates (mock coordinates for demo)
    cursor.execute("""
        SELECT 
            district,
            state,
            COUNT(*) as total,
            SUM(CASE WHEN status = 'Verified' THEN 1 ELSE 0 END) as verified,
            SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending
        FROM pensioners 
        GROUP BY district, state
        HAVING total > 5
        ORDER BY total DESC
        LIMIT 50
    """)
    
    results = cursor.fetchall()
    conn.close()
    
    # Mock coordinates for Indian districts (in real app, use proper geocoding)
    mock_coordinates = {
        'Lucknow': [26.8467, 80.9462],
        'Mumbai': [19.0760, 72.8777],
        'Kolkata': [22.5726, 88.3639],
        'Chennai': [13.0827, 80.2707],
        'Bangalore': [12.9716, 77.5946],
        'Hyderabad': [17.3850, 78.4867],
        'Pune': [18.5204, 73.8567],
        'Ahmedabad': [23.0225, 72.5714],
        'Jaipur': [26.9124, 75.7873],
        'Surat': [21.1702, 72.8311]
    }
    
    locations = []
    for row in results:
        district, state, total, verified, pending = row
        coords = mock_coordinates.get(district, [
            20 + random.uniform(-8, 15),  # Random lat between 12-35
            77 + random.uniform(-10, 15)  # Random lng between 67-92
        ])
        
        locations.append({
            'district': district,
            'state': state,
            'coordinates': coords,
            'total': total,
            'verified': verified,
            'pending': pending,
            'status': 'active' if verified > pending else 'pending'
        })
    
    return jsonify(locations)

@app.route('/api/pensioners', methods=['GET'])
def get_pensioners():
    """Get paginated list of pensioners"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    status_filter = request.args.get('status', '')
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    query = "SELECT * FROM pensioners"
    params = []
    
    if status_filter:
        query += " WHERE status = ?"
        params.append(status_filter)
    
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([per_page, (page - 1) * per_page])
    
    cursor.execute(query, params)
    results = cursor.fetchall()
    
    # Get column names
    columns = [description[0] for description in cursor.description]
    
    # Convert to list of dictionaries
    pensioners = [dict(zip(columns, row)) for row in results]
    
    conn.close()
    
    return jsonify({
        'data': pensioners,
        'page': page,
        'per_page': per_page,
        'total': len(pensioners)
    })

@app.route('/api/analytics/trends', methods=['GET'])
def get_analytics_trends():
    """Get analytics trends data"""
    days = request.args.get('days', 30, type=int)

    # Generate mock trend data
    dates = [(datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(days, 0, -1)]

    trends = {
        'verifications': [random.randint(50, 200) for _ in dates],
        'registrations': [random.randint(20, 100) for _ in dates],
        'disbursements': [random.randint(100000, 500000) for _ in dates],
        'dates': dates
    }

    return jsonify(trends)

@app.route('/api/analytics/bar-chart-race-data', methods=['GET'])
def get_bar_chart_race_data():
    """Get data formatted for bar chart race visualization"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get state-wise data over time (simulated monthly data)
    cursor.execute("""
        SELECT
            state,
            COUNT(*) as total_pensioners,
            SUM(CASE WHEN status = 'Verified' THEN 1 ELSE 0 END) as verified
        FROM pensioners
        GROUP BY state
        ORDER BY total_pensioners DESC
        LIMIT 10
    """)

    results = cursor.fetchall()
    conn.close()

    # Create time series data for bar chart race
    # Simulate 12 months of data
    months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
              '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12']

    race_data = {}
    for month in months:
        race_data[month] = {}
        for state, total, verified in results:
            # Simulate growth over time
            growth_factor = 1 + (months.index(month) * 0.1)
            race_data[month][state] = int(verified * growth_factor * random.uniform(0.8, 1.2))

    return jsonify({
        'data': race_data,
        'title': 'State-wise Pension Verifications Over Time',
        'periods': months
    })

if __name__ == '__main__':
    # Initialize database and generate sample data
    init_database()
    generate_sample_data()
    
    print("🚀 Pension Management System Backend Started!")
    print("📊 Dashboard API: http://localhost:5000/api/dashboard/stats")
    print("🗺️  Map Data API: http://localhost:5000/api/dashboard/verification-locations")
    print("👥 Pensioners API: http://localhost:5000/api/pensioners")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
