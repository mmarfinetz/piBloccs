import React, { useRef } from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { useSimulation } from '../contexts/SimulationContext';
import SimulationCanvas from './SimulationCanvas';
import SimulationControls from './SimulationControls';
import DataVisualization from './DataVisualization';
import ExplanationSection from './ExplanationSection';
import useCollisionSound from '../hooks/useCollisionSound';

const SimulationContainer = () => {
  const { state } = useSimulation();
  const canvasRef = useRef(null);
  
  // Initialize collision sound effect
  useCollisionSound();
  
  return (
    <Box sx={{ width: '100%', textAlign: 'center', py: 2 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        π Block Collision Simulator
      </Typography>
      
      <Typography variant="h6" component="h2" gutterBottom sx={{ color: 'text.secondary' }}>
        Exploring the relationship between collisions and π
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <SimulationCanvas ref={canvasRef} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
              <Typography variant="h4" component="div">
                Collisions: {state.collisionCount}
              </Typography>
            </Box>
            <SimulationControls canvasRef={canvasRef} />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Typography variant="h5" component="h3" gutterBottom>
              Data Visualization
            </Typography>
            <DataVisualization />
          </Paper>
          
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <ExplanationSection />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SimulationContainer;
