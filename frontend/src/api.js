import axios from 'axios';

const API_BASE = 'http://localhost:10000'; // Change if your Flask backend runs elsewhere

export function getIncidents(auth) {
  return axios.get(`${API_BASE}/incidents`, {
    headers: {
      'Authorization': 'Basic ' + btoa(auth.username + ':' + auth.password)
    }
  });
}