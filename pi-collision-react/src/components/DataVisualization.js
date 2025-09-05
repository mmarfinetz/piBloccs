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
import { 
  calculatePiConnection, 
  calculateStateSpaceCoordinates, 
  calculate3DStateSpace,
  calculateGalperinAlpha,
  expectedCollisionsGalperin,
  formatPiFromCollisions
} from '../utils/physics';
// Bundle Plotly locally to avoid CDN/CSP issues
// eslint-disable-next-line import/no-extraneous-dependencies
import Plotly from 'plotly.js-dist-min';

// Create a wrapper component for Plotly with improved responsiveness
const PlotlyGraph = ({ data, layout, config, style }) => {
  const plotRef = useRef(null);
  const [plotlyLoaded, setPlotlyLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  
  // Check if Plotly is loaded
  useEffect(() => {
    try {
      // Ensure global Plotly is set for any consumers expecting window.Plotly
      if (!window.Plotly && Plotly) {
        window.Plotly = Plotly;
      }
      if (window.Plotly) {
        setPlotlyLoaded(true);
      } else {
        setLoadError('Plotly not available');
      }
    } catch (e) {
      setLoadError(e?.message || 'Failed to initialize Plotly');
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
          {loadError ? `3D view failed to load: ${loadError}` : 'Loading visualization...'}
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
  const [viewMode, setViewMode] = useState('3d'); // '3d', '2d', or 'projection'
  const [colorBy, setColorBy] = useState('momentum'); // 'momentum', 'energy', or 'time'
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [energyChartData, setEnergyChartData] = useState(null);
  const [momentumChartData, setMomentumChartData] = useState(null);
  
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
    const stateSpacePoints = state.positionHistory.map((point, idx) => {
      // Prefer velocities recorded in positionHistory to avoid tiny-dt spikes
      let v1 = point.v1;
      let v2 = point.v2;
      if (typeof v1 !== 'number' || typeof v2 !== 'number') {
        if (idx > 0) {
          const prev = state.positionHistory[idx - 1];
          const dt = Math.max(1e-6, point.time - prev.time);
          v1 = (point.block1 - prev.block1) / dt;
          v2 = (point.block2 - prev.block2) / dt;
        } else {
          v1 = state.blocks[0].velocity;
          v2 = state.blocks[1].velocity;
        }
      }
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
    const stateSpace3DPoints = state.positionHistory.map((point, idx) => {
      let v1 = point.v1;
      let v2 = point.v2;
      if (typeof v1 !== 'number' || typeof v2 !== 'number') {
        if (idx > 0) {
          const prev = state.positionHistory[idx - 1];
          const dt = Math.max(1e-6, point.time - prev.time);
          v1 = (point.block1 - prev.block1) / dt;
          v2 = (point.block2 - prev.block2) / dt;
        } else {
          v1 = state.blocks[0].velocity;
          v2 = state.blocks[1].velocity;
        }
      }
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
    
    // Build conservation charts (energy and momentum over time)
    const m1 = state.blocks[0].mass;
    const m2 = state.blocks[1].mass;
    const times = state.positionHistory.map(p => p.time.toFixed(3));
    // Prefer recorded velocities at each sample to avoid finite-difference spikes
    const velocities = state.positionHistory.map((p, i) => {
      const useRecorded = typeof p.v1 === 'number' && typeof p.v2 === 'number';
      if (useRecorded) {
        return { v1: p.v1, v2: p.v2 };
      }
      if (i > 0) {
        const dt = Math.max(1e-6, state.positionHistory[i].time - state.positionHistory[i-1].time);
        return {
          v1: (state.positionHistory[i].block1 - state.positionHistory[i-1].block1) / dt,
          v2: (state.positionHistory[i].block2 - state.positionHistory[i-1].block2) / dt
        };
      }
      // Fallback to current block velocities if no history
      return {
        v1: state.blocks[0].velocity,
        v2: state.blocks[1].velocity
      };
    });
    const ke1 = velocities.map(v => 0.5 * m1 * v.v1 * v.v1);
    const ke2 = velocities.map(v => 0.5 * m2 * v.v2 * v.v2);
    const keTot = ke1.map((e, i) => e + ke2[i]);
    const p1 = velocities.map(v => m1 * v.v1);
    const p2 = velocities.map(v => m2 * v.v2);
    const pTot = p1.map((pv, i) => pv + p2[i]);

    setEnergyChartData({
      labels: times,
      datasets: [
        { label: 'KE₁', data: ke1, borderColor: state.blocks[0].color, backgroundColor: state.blocks[0].color + '44', tension: 0.1 },
        { label: 'KE₂', data: ke2, borderColor: state.blocks[1].color, backgroundColor: state.blocks[1].color + '44', tension: 0.1 },
        { label: 'Total KE', data: keTot, borderColor: '#2e7d32', backgroundColor: '#2e7d3244', tension: 0.05 }
      ]
    });
    setMomentumChartData({
      labels: times,
      datasets: [
        { label: 'p₁', data: p1, borderColor: state.blocks[0].color, backgroundColor: state.blocks[0].color + '44', tension: 0.1 },
        { label: 'p₂', data: p2, borderColor: state.blocks[1].color, backgroundColor: state.blocks[1].color + '44', tension: 0.1 },
        { label: 'Total p', data: pTot, borderColor: '#6d4c41', backgroundColor: '#6d4c4144', tension: 0.05 }
      ]
    });
    
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
        <Tab label="Conservation" />
        <Tab label="Geometry" />
        <Tab label="3D Visualization" />
        <Tab label="π Connection" />
      </Tabs>
      
      {tabValue === 4 && (
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
      
      <Box sx={{ height: { xs: 380, sm: 420, md: 520 }, mt: 2, width: '100%', overflow: 'hidden', display: 'block' }}>
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
                    type: 'linear',
                    title: {
                      display: true,
                      text: 'p₂ (momentum of m₂)'
                    },
                    beginAtZero: false,
                    suggestedMin: -10,
                    suggestedMax: 10
                  },
                  x: {
                    type: 'linear',
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
          energyChartData && momentumChartData ? (
            <Box sx={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, overflow: 'hidden', minHeight: 0 }}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Kinetic Energy</Typography>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <Line 
                    data={energyChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'top' } },
                      scales: {
                        x: { title: { display: true, text: 'Time (s)' }, ticks: { maxTicksLimit: 6 } },
                        y: { title: { display: true, text: 'Energy' } }
                      }
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </Box>
              </Box>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Momentum</Typography>
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <Line 
                    data={momentumChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'top' } },
                      scales: {
                        x: { title: { display: true, text: 'Time (s)' }, ticks: { maxTicksLimit: 6 } },
                        y: { title: { display: true, text: 'Momentum' } }
                      }
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </Box>
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Run the simulation to see conservation charts
            </Typography>
          )
        )}

        {tabValue === 3 && (
          stateSpace3DData ? (
            (() => {
              const m1 = state.blocks[0].mass;
              const m2 = state.blocks[1].mass;
              const alpha = calculateGalperinAlpha(m1, m2);
              const radii = stateSpace3DData.x.map((x, i) => Math.hypot(x, stateSpace3DData.y[i]));
              const radius = Math.max(...radii, 1);
              const maxR = radius * 1.05;
              const kLimit = Math.min(1000, Math.floor(Math.PI / (alpha || 1)) + 1);
              const shapes = [];
              for (let k = 0; k <= kLimit; k++) {
                const theta = k * alpha;
                if (!isFinite(theta) || theta > Math.PI + 1e-9) break;
                const x1 = maxR * Math.cos(theta);
                const y1 = maxR * Math.sin(theta);
                shapes.push({ type: 'line', x0: 0, y0: 0, x1, y1, line: { color: '#bbb', width: 1 } });
                shapes.push({ type: 'line', x0: 0, y0: 0, x1, y1: -y1, line: { color: '#eee', width: 1 } });
              }
              const collisionPoints = (state.collisionEvents || []).map(ev => {
                let idx = 0; let best = Infinity;
                state.positionHistory.forEach((p, i) => {
                  const d = Math.abs(p.time - ev.time);
                  if (d < best) { best = d; idx = i; }
                });
                return { x: stateSpace3DData.x[idx], y: stateSpace3DData.y[idx], type: ev.type };
              }).filter(pt => pt.x != null && pt.y != null);

              return (
                <PlotlyGraph
                  data={[
                    {
                      x: stateSpace3DData.x,
                      y: stateSpace3DData.y,
                      type: 'scatter',
                      mode: 'lines',
                      line: { color: '#4caf50', width: 2 },
                      hoverinfo: 'skip',
                      name: 'Trajectory'
                    },
                    {
                      x: collisionPoints.map(p => p.x),
                      y: collisionPoints.map(p => p.y),
                      type: 'scatter',
                      mode: 'markers',
                      marker: { color: '#ff9800', size: 8 },
                      name: 'Collisions',
                      hovertext: collisionPoints.map(p => p.type),
                      hoverinfo: 'text'
                    }
                  ]}
                  layout={{
                    title: `Geometry: Rays at multiples of α (α = ${alpha ? alpha.toFixed(5) : 'N/A'})`,
                    xaxis: { title: 'p₁ (√m₁ v₁)', scaleanchor: 'y', scaleratio: 1, gridcolor: '#eee', zerolinecolor: '#888' },
                    yaxis: { title: 'p₂ (√m₂ v₂)', gridcolor: '#eee', zerolinecolor: '#888' },
                    shapes: [
                      { type: 'circle', xref: 'x', yref: 'y', x0: -maxR, y0: -maxR, x1: maxR, y1: maxR, line: { color: '#aaa' }, opacity: 0.15 },
                      ...shapes
                    ],
                    showlegend: true,
                  }}
                  config={{ responsive: true, displayModeBar: true, modeBarButtonsToRemove: ['lasso2d', 'select2d'] }}
                  style={{ width: '100%', height: '100%' }}
                />
              );
            })()
          ) : (
            <Typography variant="body1" color="text.secondary">
              Run the simulation to see geometric angle structure
            </Typography>
          )
        )}
        
        {tabValue === 4 && (
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
                      `p₁: ${p.x?.toFixed(3) || 'N/A'}<br>p₂: ${p.y?.toFixed(3) || 'N/A'}<br>E: ${p.z?.toFixed(3) || 'N/A'}<br>t: ${p.time?.toFixed(2) || 'N/A'}s`
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
                    modeBarButtonsToAdd: ['toImage', 'downloadHtml'],
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
                      `p₁: ${p.x?.toFixed(3) || 'N/A'}<br>p₂: ${p.y?.toFixed(3) || 'N/A'}<br>E: ${p.z?.toFixed(3) || 'N/A'}<br>t: ${p.time?.toFixed(2) || 'N/A'}s`
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
                    modeBarButtonsToAdd: ['toImage', 'downloadHtml'],
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
                      `p₁: ${p.x?.toFixed(3) || 'N/A'}<br>E: ${p.z?.toFixed(3) || 'N/A'}<br>t: ${p.time?.toFixed(2) || 'N/A'}s`
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
                    modeBarButtonsToAdd: ['toImage', 'downloadHtml'],
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
        
        {tabValue === 5 && (
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

                {(() => {
                  const m1 = state.blocks[0].mass; const m2 = state.blocks[1].mass;
                  const alpha = calculateGalperinAlpha(m1, m2);
                  const expected = expectedCollisionsGalperin(m1, m2);
                  const approxStr = formatPiFromCollisions(state.collisionCount, m1, m2);
                  const n = Math.max(0, Math.round(0.5 * Math.log10(m1 / m2)));
                  const norm = n > 0 ? state.collisionCount / Math.pow(10, n) : state.collisionCount;
                  const err = n > 0 ? norm - Math.PI : null;
                  return (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        α = arctan(√(m₂/m₁)) ≈ {alpha ? alpha.toFixed(6) : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Expected collisions (⌊π/α⌋): {expected ?? 'N/A'}
                      </Typography>
                      {n > 0 && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Digits from collisions (100^n:1 with n={n}): {approxStr}
                        </Typography>
                      )}
                      {err != null && (
                        <Typography variant="caption" color={Math.abs(err) < 1e-12 ? 'text.secondary' : 'error.main'}>
                          Normalized difference vs π: {err.toExponential(2)}
                        </Typography>
                      )}
                    </Box>
                  );
                })()}

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
