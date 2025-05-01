import './App.css';
import React, { useState, useEffect } from 'react';
import { getIncidents } from './api';
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

  useEffect(() => {
    getIncidents(auth)
      .then(res => {
        setIncidents(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch incidents');
        setLoading(false);
      });
  }, [auth]);

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
        <Analytics auth={auth} />
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