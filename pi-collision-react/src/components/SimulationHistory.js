import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import { useSimulation } from '../contexts/SimulationContext';

const SimulationHistory = () => {
  const { state, loadSimulationResults } = useSimulation();

  useEffect(() => {
    loadSimulationResults();
  }, [loadSimulationResults]);

  if (state.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (state.error) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        Error loading results: {state.error}
      </Typography>
    );
  }

  return (
    <Paper elevation={3} sx={{ mt: 3, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Simulation History
      </Typography>
      
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Mass Ratio</TableCell>
              <TableCell>Collisions</TableCell>
              <TableCell>π Approximation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {state.savedResults.map((result) => (
              <TableRow key={result.id}>
                <TableCell>
                  {new Date(result.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {result.m1}:{result.m2}
                </TableCell>
                <TableCell>
                  {result.collision_count}
                </TableCell>
                <TableCell>
                  {result.pi_approximation?.toFixed(6) || 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {state.savedResults.length === 0 && (
        <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          No saved simulations yet. Run a simulation and save the results to see them here.
        </Typography>
      )}
    </Paper>
  );
};

export default SimulationHistory; 