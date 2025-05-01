import axios from 'axios';

const API_BASE = 'http://localhost:10000'; // Change if your Flask backend runs elsewhere

export function getIncidents(auth) {
  return axios.get(`${API_BASE}/incidents`, {
    headers: {
      'Authorization': 'Basic ' + btoa(auth.username + ':' + auth.password)
    }
  });
}

export function createIncident(auth, data) {
  return axios.post(`${API_BASE}/incidents`, data, {
    headers: {
      'Authorization': 'Basic ' + btoa(auth.username + ':' + auth.password)
    }
  });
}

export function deleteIncident(auth, id) {
  return axios.delete(`${API_BASE}/incidents/${id}`, {
    headers: {
      'Authorization': 'Basic ' + btoa(auth.username + ':' + auth.password)
    }
  });
}