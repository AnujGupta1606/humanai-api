import './App.css';
import React, { useState, useEffect } from 'react';
import { createIncident, deleteIncident, getIncidents } from './api';
import { AppBar, Toolbar, Typography, Container, Card, CardContent, Grid, Chip, CircularProgress, Alert } from '@mui/material';
import Analytics from './Analytics';

function severityColor(severity) {
  if (severity === 'High') return 'error';
  if (severity === 'Medium') return 'warning';
  return 'success';
}

function App() {
  const [incidents, setIncidents] = useState([]);
  const [auth] = useState({ username: 'admin', password: 'password123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', severity: 'Low' });
  const [creating, setCreating] = useState(false);
  const [analyticsKey, setAnalyticsKey] = useState(0);

  const fetchIncidents = () => {
    setLoading(true);
    getIncidents(auth)
      .then(res => {
        setIncidents(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch incidents');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchIncidents();
    // eslint-disable-next-line
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = e => {
    e.preventDefault();
    setCreating(true);
    createIncident(auth, form)
      .then(() => {
        setForm({ title: '', description: '', severity: 'Low' });
        fetchIncidents();
        setAnalyticsKey(k => k + 1); // Add this line
        setCreating(false);
      })
      .catch(() => {
        setError('Failed to create incident');
        setCreating(false);
      });
  };

  const handleDelete = id => {
    deleteIncident(auth, id)
      .then(() => {
        fetchIncidents();
        setAnalyticsKey(k => k + 1); // Add this line
      })
      .catch(() => setError('Failed to delete incident'));
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            HumanChain AI Safety Incident Log
          </Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Analytics auth={auth} key={analyticsKey} />
        <form onSubmit={handleCreate} style={{ marginBottom: 24 }}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Create New Incident</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Title"
                    required
                    style={{ width: '100%', padding: 8, marginBottom: 8 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <input
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Description"
                    required
                    style={{ width: '100%', padding: 8, marginBottom: 8 }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <select
                    name="severity"
                    value={form.severity}
                    onChange={handleChange}
                    style={{ width: '100%', padding: 8, marginBottom: 8 }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </Grid>
                <Grid item xs={12} md={2}>
                  <button type="submit" disabled={creating} style={{ width: '100%', padding: 8 }}>
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </form>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {incidents.map(inc => (
            <Grid item xs={12} md={6} lg={4} key={inc.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>{inc.title}</Typography>
                  <Chip label={inc.severity} color={severityColor(inc.severity)} sx={{ mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {new Date(inc.reported_at).toLocaleString()}
                  </Typography>
                  <Typography variant="body1">{inc.description}</Typography>
                  <button onClick={() => handleDelete(inc.id)} style={{ marginTop: 8, color: 'red' }}>
                    Delete
                  </button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
}

export default App;