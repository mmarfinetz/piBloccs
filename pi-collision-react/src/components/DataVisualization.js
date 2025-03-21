import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Tab, Tabs, FormControlLabel, Switch, ButtonGroup, Button } from '@mui/material';
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
import { calculatePiConnection, calculateStateSpaceCoordinates, calculate3DStateSpace } from '../utils/physics';

// Create a wrapper component for Plotly with improved responsiveness
const PlotlyGraph = ({ data, layout, config, style }) => {
  const plotRef = useRef(null);
  const [plotlyLoaded, setPlotlyLoaded] = useState(false);
  
  // Check if Plotly is loaded
  useEffect(() => {
    // Function to check if Plotly is available
    const checkPlotly = () => {
      if (window.Plotly) {
        setPlotlyLoaded(true);
        return true;
      }
      return false;
    };
    
    // If Plotly is not immediately available, try to load it
    if (!checkPlotly()) {
      // Try to load Plotly if it's not available
      const script = document.createElement('script');
      script.src = 'https://cdn.plot.ly/plotly-2.29.0.min.js';
      script.async = true;
      script.onload = () => setPlotlyLoaded(true);
      document.body.appendChild(script);
      
      // Check again every 100ms for 3 seconds
      let attempts = 0;
      const interval = setInterval(() => {
        if (checkPlotly() || attempts >= 30) {
          clearInterval(interval);
        }
        attempts++;
      }, 100);
      
      return () => {
        clearInterval(interval);
        document.body.removeChild(script);
      };
    }
  }, []);
  
  // Create plot when Plotly is loaded and data changes
  useEffect(() => {
    if (plotRef.current && window.Plotly && plotlyLoaded) {
      try {
        window.Plotly.newPlot(
          plotRef.current, 
          Array.isArray(data) ? data : [data], 
          layout,
          config
        );
        
        // Add responsive behavior
        const resizeHandler = () => {
          if (plotRef.current) {
            window.Plotly.Plots.resize(plotRef.current);
          }
        };
        
        window.addEventListener('resize', resizeHandler);
        
        return () => {
          window.removeEventListener('resize', resizeHandler);
        };
      } catch (err) {
        console.error('Error rendering Plotly chart:', err);
      }
    }
  }, [data, layout, config, plotlyLoaded]);
  
  if (!plotlyLoaded) {
    return (
      <div ref={plotRef} style={style} className="plotly-loading">
        <Typography variant="body2" color="text.secondary">
          Loading visualization...
        </Typography>
      </div>
    );
  }
  
  return <div ref={plotRef} style={style} />;
};

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
  const [stateSpace3DData, setStateSpace3DData] = useState(null);
  const [piConnection, setPiConnection] = useState(null);
  const [showHigherDimensions, setShowHigherDimensions] = useState(true);
  const [viewMode, setViewMode] = useState('3d'); // '3d', '2d', or 'projection'
  const [colorBy, setColorBy] = useState('momentum'); // 'momentum', 'energy', or 'time'
  const [showTrajectory, setShowTrajectory] = useState(true);
  
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
      
      return {
        ...calculateStateSpaceCoordinates(
          state.blocks[0].mass, 
          state.blocks[1].mass, 
          v1, 
          v2
        ),
        time: point.time
      };
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
    
    // Create 3D state space data
    const stateSpace3DPoints = stateSpacePoints.map(point => {
      const index = state.positionHistory.findIndex(p => p.time === point.time);
      const v1 = index > 0 ? 
        (state.positionHistory[index].block1 - state.positionHistory[index-1].block1) / 
        (state.positionHistory[index].time - state.positionHistory[index-1].time) :
        state.blocks[0].velocity;
      
      const v2 = index > 0 ? 
        (state.positionHistory[index].block2 - state.positionHistory[index-1].block2) / 
        (state.positionHistory[index].time - state.positionHistory[index-1].time) :
        state.blocks[1].velocity;
      
      return calculate3DStateSpace(
        state.blocks[0].mass, 
        state.blocks[1].mass, 
        v1, 
        v2,
        point.time
      );
    });
    
    // Downsample 3D state space data
    if (stateSpace3DPoints.length > 0) {
      const downsamplingFactor = Math.ceil(stateSpace3DPoints.length / 200);
      const downsampledPoints = stateSpace3DPoints.filter((_, i) => i % downsamplingFactor === 0);
      
      setStateSpace3DData({
        points: downsampledPoints,
        x: downsampledPoints.map(p => p.x),
        y: downsampledPoints.map(p => p.y),
        z: downsampledPoints.map(p => p.z),
        time: downsampledPoints.map(p => p.time),
        energy: downsampledPoints.map(p => p.z), // Energy is represented as z in our model
        angularMomentum: downsampledPoints.map(p => p.color)
      });
    }
    
    // Calculate pi connection
    setPiConnection(calculatePiConnection(
      state.collisionCount, 
      state.blocks[0].mass / state.blocks[1].mass
    ));
  }, [state.positionHistory, state.blocks, state.collisionCount]);

  // Get the appropriate color data based on selected option
  const getColorData = () => {
    if (!stateSpace3DData) return [];
    
    switch(colorBy) {
      case 'energy':
        return stateSpace3DData.energy;
      case 'time':
        return stateSpace3DData.time;
      case 'momentum':
      default:
        return stateSpace3DData.angularMomentum;
    }
  };
  
  // Get the colorbar title based on selected option
  const getColorbarTitle = () => {
    switch(colorBy) {
      case 'energy':
        return 'Kinetic Energy';
      case 'time':
        return 'Time (s)';
      case 'momentum':
      default:
        return 'Angular Momentum';
    }
  };
  
  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange} centered variant="fullWidth">
        <Tab label="Positions" />
        <Tab label="State Space" />
        <Tab label="3D Visualization" />
        <Tab label="π Connection" />
      </Tabs>
      
      {tabValue === 2 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ButtonGroup size="small" variant="outlined">
              <Button 
                onClick={() => setViewMode('3d')} 
                variant={viewMode === '3d' ? 'contained' : 'outlined'}
              >
                3D View
              </Button>
              <Button 
                onClick={() => setViewMode('2d')} 
                variant={viewMode === '2d' ? 'contained' : 'outlined'}
              >
                2D View
              </Button>
              <Button 
                onClick={() => setViewMode('projection')} 
                variant={viewMode === 'projection' ? 'contained' : 'outlined'}
              >
                Projection
              </Button>
            </ButtonGroup>
            
            <ButtonGroup size="small" variant="outlined">
              <Button 
                onClick={() => setColorBy('momentum')} 
                variant={colorBy === 'momentum' ? 'contained' : 'outlined'}
              >
                Momentum
              </Button>
              <Button 
                onClick={() => setColorBy('energy')} 
                variant={colorBy === 'energy' ? 'contained' : 'outlined'}
              >
                Energy
              </Button>
              <Button 
                onClick={() => setColorBy('time')} 
                variant={colorBy === 'time' ? 'contained' : 'outlined'}
              >
                Time
              </Button>
            </ButtonGroup>
            
            <FormControlLabel
              control={
                <Switch
                  checked={showTrajectory}
                  onChange={(e) => setShowTrajectory(e.target.checked)}
                  size="small"
                />
              }
              label="Show Trajectory"
            />
          </Box>
        </Box>
      )}
      
      <Box sx={{ height: 350, mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                    },
                    beginAtZero: false,
                    suggestedMin: -10,
                    suggestedMax: 10
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'p₁ (momentum of m₁)'
                    },
                    beginAtZero: false,
                    suggestedMin: -10,
                    suggestedMax: 10
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
          stateSpace3DData ? (
            <Box sx={{ height: '100%', width: '100%' }}>
              {viewMode === '3d' ? (
                <PlotlyGraph
                  data={[{
                    x: stateSpace3DData.x,
                    y: stateSpace3DData.y,
                    z: stateSpace3DData.z,
                    type: 'scatter3d',
                    mode: showTrajectory ? 'lines+markers' : 'markers',
                    marker: {
                      color: getColorData(),
                      colorscale: 'Viridis',
                      size: 6,
                      showscale: true,
                      colorbar: {
                        title: getColorbarTitle(),
                        thickness: 15,
                        len: 0.7,
                        x: 1.05
                      }
                    },
                    line: {
                      width: showTrajectory ? 3 : 0,
                      color: colorBy === 'time' ? null : '#4caf50'
                    },
                    hoverinfo: 'text',
                    hovertext: stateSpace3DData.points.map(p => 
                      `p₁: ${p.x.toFixed(3)}<br>p₂: ${p.y.toFixed(3)}<br>E: ${p.z.toFixed(3)}<br>t: ${p.time.toFixed(2)}s`
                    )
                  }]}
                  layout={{
                    title: '3D State Space',
                    autosize: true,
                    margin: { l: 0, r: 0, b: 0, t: 40 },
                    scene: {
                      xaxis: { title: 'p₁ (momentum)' },
                      yaxis: { title: 'p₂ (momentum)' },
                      zaxis: { title: 'Energy' },
                      camera: {
                        eye: { x: 1.5, y: 1.5, z: 1.5 }
                      }
                    }
                  }}
                  config={{ 
                    responsive: true,
                    displayModeBar: true,
                    modeBarButtonsToAdd: ['toImage'],
                    modeBarButtonsToRemove: ['lasso2d', 'select2d']
                  }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : viewMode === '2d' ? (
                <PlotlyGraph
                  data={[{
                    x: stateSpace3DData.x,
                    y: stateSpace3DData.y,
                    type: 'scatter',
                    mode: showTrajectory ? 'lines+markers' : 'markers',
                    marker: {
                      color: getColorData(),
                      colorscale: 'Viridis',
                      size: 8,
                      showscale: true,
                      colorbar: {
                        title: getColorbarTitle(),
                        thickness: 15
                      }
                    },
                    line: { 
                      width: 2,
                      color: colorBy === 'time' ? null : '#4caf50'
                    },
                    hoverinfo: 'text',
                    hovertext: stateSpace3DData.points.map(p => 
                      `p₁: ${p.x.toFixed(3)}<br>p₂: ${p.y.toFixed(3)}<br>E: ${p.z.toFixed(3)}<br>t: ${p.time.toFixed(2)}s`
                    )
                  }]}
                  layout={{
                    title: 'State Space Trajectory (2D View)',
                    xaxis: { 
                      title: 'p₁ (momentum)',
                      zeroline: true,
                      zerolinecolor: '#888',
                      gridcolor: '#eee' 
                    },
                    yaxis: { 
                      title: 'p₂ (momentum)',
                      zeroline: true,
                      zerolinecolor: '#888',
                      gridcolor: '#eee',
                      scaleanchor: 'x',
                      scaleratio: 1
                    },
                    shapes: [{
                      type: 'circle',
                      xref: 'x',
                      yref: 'y',
                      x0: -Math.max(...stateSpace3DData.x.map(Math.abs)),
                      y0: -Math.max(...stateSpace3DData.y.map(Math.abs)),
                      x1: Math.max(...stateSpace3DData.x.map(Math.abs)),
                      y1: Math.max(...stateSpace3DData.y.map(Math.abs)),
                      opacity: 0.2,
                      fillcolor: '#ddd',
                      line: { color: '#888' }
                    }]
                  }}
                  config={{ 
                    responsive: true,
                    displayModeBar: true,
                    modeBarButtonsToAdd: ['toImage'],
                    modeBarButtonsToRemove: ['lasso2d', 'select2d'] 
                  }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <PlotlyGraph
                  data={[{
                    x: stateSpace3DData.x,
                    y: stateSpace3DData.z,
                    type: 'scatter',
                    mode: showTrajectory ? 'lines+markers' : 'markers',
                    marker: {
                      color: getColorData(),
                      colorscale: 'Viridis',
                      size: 8,
                      showscale: true,
                      colorbar: {
                        title: getColorbarTitle(),
                        thickness: 15
                      }
                    },
                    line: { 
                      width: 2,
                      color: colorBy === 'time' ? null : '#4caf50'
                    },
                    hoverinfo: 'text',
                    hovertext: stateSpace3DData.points.map(p => 
                      `p₁: ${p.x.toFixed(3)}<br>E: ${p.z.toFixed(3)}<br>t: ${p.time.toFixed(2)}s`
                    )
                  }]}
                  layout={{
                    title: 'Energy vs. Momentum (Projection)',
                    xaxis: { 
                      title: 'p₁ (momentum)',
                      zeroline: true,
                      zerolinecolor: '#888',
                      gridcolor: '#eee' 
                    },
                    yaxis: { 
                      title: 'Energy',
                      zeroline: true,
                      zerolinecolor: '#888',
                      gridcolor: '#eee' 
                    }
                  }}
                  config={{ 
                    responsive: true,
                    displayModeBar: true,
                    modeBarButtonsToAdd: ['toImage'],
                    modeBarButtonsToRemove: ['lasso2d', 'select2d']
                  }}
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Run the simulation to see higher-dimensional visualization
            </Typography>
          )
        )}
        
        {tabValue === 3 && (
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            {piConnection ? (
              <>
                <Typography variant="h3" component="div" gutterBottom>
                  {state.collisionCount} Collisions
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {piConnection.description}
                </Typography>
                
                {piConnection.piDigits && (
                  <Typography variant="h4" component="div" color="primary.main" gutterBottom>
                    π ≈ {piConnection.piDigits.toFixed(6)}
                  </Typography>
                )}
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  When the mass ratio is 100ⁿ:1, the collision count approximates π × 10ⁿ
                </Typography>
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
