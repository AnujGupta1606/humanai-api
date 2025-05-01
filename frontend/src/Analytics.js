import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Card, CardContent, Typography, CircularProgress, Alert, Box } from '@mui/material';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { Grid } from '@mui/material';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const API_BASE = 'http://localhost:10000';

export default function Analytics({ auth }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/incidents/analytics`, {
      headers: {
        'Authorization': 'Basic ' + btoa(auth.username + ':' + auth.password)
      }
    })
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch analytics');
        setLoading(false);
      });
  }, [auth]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const barData = {
    labels: Object.keys(data.incidents_by_month),
    datasets: [
      {
        label: 'Incidents per Month',
        data: Object.values(data.incidents_by_month),
        backgroundColor: '#1976d2',
      },
    ],
  };

  const pieData = {
    labels: Object.keys(data.incidents_by_severity),
    datasets: [
      {
        label: 'Incidents by Severity',
        data: Object.values(data.incidents_by_severity),
        backgroundColor: ['#2e7d32', '#ed6c02', '#d32f2f'],
      },
    ],
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Analytics Dashboard</Typography>
          <Typography variant="body1">Total Incidents: <b>{data.total_incidents}</b></Typography>
        </CardContent>
      </Card>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Incidents per Month</Typography>
              <Bar data={barData} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">Incidents by Severity</Typography>
              <Pie data={pieData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}