from flask import Flask, request, jsonify, abort
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from functools import wraps
from flask import request, Response
from flasgger import Swagger
import smtplib
from email.mime.text import MIMEText
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
Swagger(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///incidents.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Incident(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(10), nullable=False)
    reported_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'severity': self.severity,
            'reported_at': self.reported_at.isoformat()
        }

def check_auth(username, password):
    return username == 'admin' and password == 'password123'

def authenticate():
    return Response(
        'Authentication required.', 401,
        {'WWW-Authenticate': 'Basic realm="Login Required"'}
    )

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated

# Apply @requires_auth to all endpoints:
@app.route('/incidents', methods=['GET'])
@requires_auth
def get_incidents():
    severity = request.args.get('severity')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    query = Incident.query
    if severity:
        query = query.filter_by(severity=severity)
    if start_date:
        try:
            start = datetime.fromisoformat(start_date)
            query = query.filter(Incident.reported_at >= start)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format, use YYYY-MM-DD'}), 400
    if end_date:
        try:
            end = datetime.fromisoformat(end_date)
            query = query.filter(Incident.reported_at <= end)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format, use YYYY-MM-DD'}), 400
    incidents = query.all()
    return jsonify([i.to_dict() for i in incidents]), 200

@app.route('/incidents', methods=['POST'])
@requires_auth
def create_incident():
    """
    Create a new AI safety incident
    ---
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - title
            - description
            - severity
          properties:
            title:
              type: string
            description:
              type: string
            severity:
              type: string
    responses:
      201:
        description: Incident created
      400:
        description: Invalid input
    """
    data = request.get_json()
    if not data or not all(k in data for k in ('title', 'description', 'severity')):
        return jsonify({'error': 'Missing required fields'}), 400
    if data['severity'] not in ['Low', 'Medium', 'High']:
        return jsonify({'error': 'Invalid severity value'}), 400
    incident = Incident(
        title=data['title'],
        description=data['description'],
        severity=data['severity']
    )
    db.session.add(incident)
    db.session.commit()
    # Send email if severity is High
    if data['severity'] == 'High':
        send_email(
            subject='High Severity Incident Reported',
            body=f"Title: {data['title']}\nDescription: {data['description']}",
            to_email='satyam2465@gmail.com'  # Your admin email
        )
    return jsonify(incident.to_dict()), 201

@app.route('/incidents/<int:incident_id>', methods=['GET'])
@requires_auth
def get_incident(incident_id):
    incident = Incident.query.get(incident_id)
    if not incident:
        return jsonify({'error': 'Incident not found'}), 404
    return jsonify(incident.to_dict()), 200

@app.route('/incidents/<int:incident_id>', methods=['PUT'])
@requires_auth
def update_incident(incident_id):
    incident = Incident.query.get(incident_id)
    if not incident:
        return jsonify({'error': 'Incident not found'}), 404
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    if 'title' in data:
        incident.title = data['title']
    if 'description' in data:
        incident.description = data['description']
    if 'severity' in data:
        if data['severity'] not in ['Low', 'Medium', 'High']:
            return jsonify({'error': 'Invalid severity value'}), 400
        incident.severity = data['severity']
    db.session.commit()
    return jsonify(incident.to_dict()), 200

@app.route('/incidents/<int:incident_id>', methods=['DELETE'])
@requires_auth
def delete_incident(incident_id):
    incident = Incident.query.get(incident_id)
    if not incident:
        return jsonify({'error': 'Incident not found'}), 404
    db.session.delete(incident)
    db.session.commit()
    return jsonify({'message': 'Incident deleted'}), 200

@app.route('/incidents/analytics', methods=['GET'])
@requires_auth
def incident_analytics():
    total = Incident.query.count()
    by_severity = db.session.query(Incident.severity, db.func.count(Incident.id)).group_by(Incident.severity).all()
    by_month = db.session.query(db.func.strftime('%Y-%m', Incident.reported_at), db.func.count(Incident.id)).group_by(db.func.strftime('%Y-%m', Incident.reported_at)).all()
    return jsonify({
        'total_incidents': total,
        'incidents_by_severity': {sev: count for sev, count in by_severity},
        'incidents_by_month': {month: count for month, count in by_month}
    })

def send_email(subject, body, to_email):
    from_email = 'satyam2465@gmail.com'
    password = 'hevqJhesdavqaxsk'
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = to_email
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(from_email, password)
            server.sendmail(from_email, [to_email], msg.as_string())
    except Exception as e:
        print(f'Email failed: {e}')

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 10000))
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=port)