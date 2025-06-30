from flask import Flask, render_template, request, redirect, url_for, jsonify
import os
from datetime import datetime, timedelta

app = Flask(__name__)

# Ensure data directory exists
os.makedirs('data', exist_ok=True)

# Data file path
DATA_FILE = 'data/expenses.txt'

# Available categories
CATEGORIES = ['health', 'gym', 'cycle', 'college', 'food', 'friend']


# Function to save data
def save_data(amount, category):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(DATA_FILE, 'a') as f:
        f.write(f"{timestamp},{amount},{category}\n")


# Function to retrieve data
def get_data():
    if not os.path.exists(DATA_FILE):
        return []

    with open(DATA_FILE, 'r') as f:
        lines = f.readlines()

    data = []
    for line in lines:
        try:
            timestamp, amount, category = line.strip().split(',')
            data.append({
                'timestamp': timestamp,
                'amount': float(amount),
                'category': category
            })
        except ValueError:
            continue
    return data


# Home page
@app.route('/')
def index():
    return render_template('index.html')


# Add expense page
@app.route('/add_expense', methods=['GET', 'POST'])
def add_expense():
    if request.method == 'POST':
        amount = request.form.get('amount')
        category = request.form.get('category')

        if amount and category:
            save_data(amount, category)
            return redirect(url_for('index'))
    return render_template('add_expense.html', categories=CATEGORIES)


# Analysis page
@app.route('/analyze')
def analyze():
    return render_template('analyze.html', categories=CATEGORIES)


# Summary page
@app.route('/summary')
def summary():
    data = get_data()
    category_totals = {category: 0 for category in CATEGORIES}

    for item in data:
        if item['category'] in category_totals:
            category_totals[item['category']] += item['amount']

    total_spent = sum(item['amount'] for item in data)

    return render_template('summary.html',
                           category_totals=category_totals,
                           total_spent=total_spent)


# API endpoint for charts
@app.route('/api/expenses')
def api_expenses():
    category = request.args.get('category', 'all')
    period = request.args.get('period', 'all')

    data = get_data()

    # Filter by category
    if category != 'all':
        data = [e for e in data if e['category'] == category]

    # Filter by time period
    if period != 'all':
        now = datetime.now()
        if period == 'today':
            today = now.strftime('%Y-%m-%d')
            data = [e for e in data if e['timestamp'].startswith(today)]
        elif period == 'week':
            start_of_week = (now - timedelta(days=now.weekday()))
            start_date = start_of_week.strftime('%Y-%m-%d')
            data = [e for e in data if e['timestamp'][:10] >= start_date]
        elif period == 'month':
            this_month = now.strftime('%Y-%m')
            data = [e for e in data if e['timestamp'].startswith(this_month)]
        elif period == 'year':
            this_year = now.strftime('%Y')
            data = [e for e in data if e['timestamp'].startswith(this_year)]

    # Prepare data for chart
    if category == 'all':
        categories = set(e['category'] for e in data)
        labels = sorted(categories)
        values = [sum(e['amount'] for e in data if e['category'] == cat) for cat in labels]
    else:
        labels = [category.capitalize()]
        values = [sum(e['amount'] for e in data)]

    return jsonify({
        'labels': labels,
        'values': values
    })


# Run the app
if __name__ == '__main__':
    app.run(debug=True)
