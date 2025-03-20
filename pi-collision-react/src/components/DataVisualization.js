import React, { useEffect, useState } from 'react';
import { Box, Typography, Tab, Tabs, CircularProgress } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useSimulation } from '../contexts/SimulationContext';
import { calculatePiConnection, calculateStateSpaceCoordinates } from '../utils/physics';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DataVisualization = () => {
  const { state } = useSimulation();
  const [tabValue, setTabValue] = useState(0);
  const [positionChartData, setPositionChartData] = useState(null);
  const [stateSpaceData, setStateSpaceData] = useState(null);
  const [piConnection, setPiConnection] = useState(null);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Update position chart data
  useEffect(() => {
    if (state.positionHistory.length === 0) return;
    
    // Downsample data for better performance if there are too many points
    let downsampledHistory = state.positionHistory;
    if (state.positionHistory.length > 100) {
      const factor = Math.ceil(state.positionHistory.length / 100);
      downsampledHistory = state.positionHistory.filter((_, i) => i % factor === 0);
    }
    
    setPositionChartData({
      labels: downsampledHistory.map(point => point.time.toFixed(2)),
      datasets: [
        {
          label: 'Block 1 (m₁)',
          data: downsampledHistory.map(point => point.block1),
          borderColor: state.blocks[0].color,
          backgroundColor: state.blocks[0].color + '33',
          tension: 0.1
        },
        {
          label: 'Block 2 (m₂)',
          data: downsampledHistory.map(point => point.block2),
          borderColor: state.blocks[1].color,
          backgroundColor: state.blocks[1].color + '33',
          tension: 0.1
        }
      ]
    });
    
    // Update state space data (for circular trajectory visualization)
    const stateSpacePoints = state.positionHistory.map(point => {
      // Find corresponding velocities at this time
      const index = state.positionHistory.findIndex(p => p.time === point.time);
      const v1 = index > 0 ? 
        (state.positionHistory[index].block1 - state.positionHistory[index-1].block1) / 
        (state.positionHistory[index].time - state.positionHistory[index-1].time) :
        state.blocks[0].velocity;
      
      const v2 = index > 0 ? 
        (state.positionHistory[index].block2 - state.positionHistory[index-1].block2) / 
        (state.positionHistory[index].time - state.positionHistory[index-1].time) :
        state.blocks[1].velocity;
      
      return calculateStateSpaceCoordinates(
        state.blocks[0].mass, 
        state.blocks[1].mass, 
        v1, 
        v2
      );
    });
    
    // Downsample state space data too
    if (stateSpacePoints.length > 100) {
      const factor = Math.ceil(stateSpacePoints.length / 100);
      setStateSpaceData({
        labels: Array(Math.ceil(stateSpacePoints.length / factor)).fill(''),
        datasets: [{
          label: 'State Space Trajectory',
          data: stateSpacePoints.filter((_, i) => i % factor === 0).map(point => ({
            x: point.x,
            y: point.y
          })),
          borderColor: '#4caf50',
          backgroundColor: 'rgba(0, 0, 0, 0)',
          pointRadius: 3,
          pointBackgroundColor: '#4caf50',
          showLine: true
        }]
      });
    } else {
      setStateSpaceData({
        labels: Array(stateSpacePoints.length).fill(''),
        datasets: [{
          label: 'State Space Trajectory',
          data: stateSpacePoints.map(point => ({
            x: point.x,
            y: point.y
          })),
          borderColor: '#4caf50',
          backgroundColor: 'rgba(0, 0, 0, 0)',
          pointRadius: 3,
          pointBackgroundColor: '#4caf50',
          showLine: true
        }]
      });
    }
    
    // Calculate pi connection
    setPiConnection(calculatePiConnection(
      state.collisionCount, 
      state.blocks[0].mass / state.blocks[1].mass
    ));
  }, [state.positionHistory, state.blocks, state.collisionCount]);
  
  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab label="Positions" />
        <Tab label="State Space" />
        <Tab label="π Connection" />
      </Tabs>
      
      <Box sx={{ height: 250, mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {tabValue === 0 && (
          positionChartData ? (
            <Line 
              data={positionChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    title: {
                      display: true,
                      text: 'Position'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Time (s)'
                    },
                    ticks: {
                      maxTicksLimit: 10
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y.toFixed(3)}`;
                      }
                    }
                  }
                }
              }}
            />
          ) : (
            <Typography variant="body1" color="text.secondary">
              Run the simulation to see position data
            </Typography>
          )
        )}
        
        {tabValue === 1 && (
          stateSpaceData ? (
            <Line 
              data={stateSpaceData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    title: {
                      display: true,
                      text: 'p₂ (momentum of m₂)'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'p₁ (momentum of m₁)'
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `p₁: ${context.parsed.x.toFixed(3)}, p₂: ${context.parsed.y.toFixed(3)}`;
                      }
                    }
                  }
                }
              }}
            />
          ) : (
            <Typography variant="body1" color="text.secondary">
              Run the simulation to see state space trajectory
            </Typography>
          )
        )}
        
        {tabValue === 2 && (
          <Box sx={{ textAlign: 'center' }}>
            {piConnection ? (
              <>
                <Typography variant="h4" component="div" gutterBottom>
                  {state.collisionCount} Collisions
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {piConnection.description}
                </Typography>
                
                {piConnection.piDigits && (
                  <Typography variant="h5" component="div" color="primary.main">
                    π ≈ {piConnection.piDigits.toFixed(6)}
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Run the simulation to see the π connection
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DataVisualization;
