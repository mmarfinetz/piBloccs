import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Slider,
  Typography,
  Stack,
  TextField,
  Tooltip,
  IconButton,
  Grid
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SpeedIcon from '@mui/icons-material/Speed';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import InfoIcon from '@mui/icons-material/Info';
import BugReportIcon from '@mui/icons-material/BugReport';
import { useSimulation } from '../contexts/SimulationContext';
import ExportButton from './ExportButton';

const SimulationControls = ({ canvasRef }) => {
  const { state, dispatch, saveSimulationResult } = useSimulation();
  const [customRatio, setCustomRatio] = useState('');
  
  // Preset mass ratios
  const massRatios = [
    { label: '1:1', value: 1 },
    { label: '100:1', value: 100 },
    { label: '10000:1', value: 10000 },
    { label: '1000000:1', value: 1000000 }
  ];
  
  // Handle custom ratio input
  const handleCustomRatioChange = (e) => {
    setCustomRatio(e.target.value);
  };
  
  const handleCustomRatioSubmit = () => {
    const ratio = parseFloat(customRatio);
    if (!isNaN(ratio) && ratio > 0) {
      dispatch({
        type: 'SET_MASS_RATIO',
        payload: ratio,
        presetName: 'custom'
      });
    }
  };
  
  // Handle simulation speed change
  const handleSpeedChange = (event, newValue) => {
    dispatch({
      type: 'SET_SIMULATION_SPEED',
      payload: newValue
    });
  };

  const handleStart = () => {
    dispatch({ type: 'SET_RUNNING', payload: true });
  };

  const handleStop = () => {
    dispatch({ type: 'SET_RUNNING', payload: false });
  };

  const handleReset = () => {
    dispatch({ type: 'SET_RUNNING', payload: false });
    dispatch({ type: 'SET_COLLISION_COUNT', payload: 0 });
    // Reset other state as needed
  };

  const handleSave = async () => {
    if (canvasRef.current) {
      const animationData = canvasRef.current.toDataURL();
      await saveSimulationResult(animationData);
    }
  };

  const handleMassChange = (event, block) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value) && value > 0) {
      dispatch({
        type: 'SET_MASSES',
        payload: block === 1 ? { m1: value, m2: state.m2 } : { m1: state.m1, m2: value }
      });
    }
  };

  const handleVelocityChange = (event, block) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      dispatch({
        type: 'SET_VELOCITIES',
        payload: block === 1 ? { v1: value, v2: state.v2 } : { v1: state.v1, v2: value }
      });
    }
  };

  return (
    <Box sx={{ mt: 3, px: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1">Block 1</Typography>
          <TextField
            label="Mass"
            type="number"
            value={state.m1}
            onChange={(e) => handleMassChange(e, 1)}
            sx={{ mr: 1 }}
          />
          <TextField
            label="Initial Velocity"
            type="number"
            value={state.v1}
            onChange={(e) => handleVelocityChange(e, 1)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1">Block 2</Typography>
          <TextField
            label="Mass"
            type="number"
            value={state.m2}
            onChange={(e) => handleMassChange(e, 2)}
            sx={{ mr: 1 }}
          />
          <TextField
            label="Initial Velocity"
            type="number"
            value={state.v2}
            onChange={(e) => handleVelocityChange(e, 2)}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleStart}
          disabled={state.isRunning}
          sx={{ mr: 1 }}
        >
          Start
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleStop}
          disabled={!state.isRunning}
          sx={{ mr: 1 }}
        >
          Stop
        </Button>
        <Button
          variant="outlined"
          onClick={handleReset}
          sx={{ mr: 1 }}
        >
          Reset
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleSave}
          disabled={state.loading || state.collisionCount === 0}
        >
          Save Results
        </Button>
      </Box>
      
      {/* Mass ratio selector */}
      <Typography variant="subtitle1" gutterBottom>
        Mass Ratio
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 3 }}>
        <ButtonGroup variant="outlined" aria-label="mass ratio presets">
          {massRatios.map((ratio) => (
            <Button 
              key={ratio.label}
              onClick={() => dispatch({
                type: 'SET_MASS_RATIO',
                payload: ratio.value,
                presetName: ratio.label
              })}
              variant={state.preset === ratio.label ? 'contained' : 'outlined'}
            >
              {ratio.label}
            </Button>
          ))}
        </ButtonGroup>
        
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            label="Custom"
            variant="outlined"
            size="small"
            value={customRatio}
            onChange={handleCustomRatioChange}
            sx={{ width: 100 }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCustomRatioSubmit();
              }
            }}
          />
          <Button 
            variant="contained" 
            size="small"
            onClick={handleCustomRatioSubmit}
          >
            Set
          </Button>
        </Stack>
      </Box>
      
      {/* Playback controls */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
        <ButtonGroup variant="contained" aria-label="simulation controls">
          <Button 
            color={state.isRunning ? 'secondary' : 'primary'}
            startIcon={state.isRunning ? <PauseIcon /> : <PlayArrowIcon />}
            onClick={() => dispatch({ type: 'TOGGLE_RUNNING' })}
          >
            {state.isRunning ? 'Pause' : 'Play'}
          </Button>
          <Button 
            startIcon={<RestartAltIcon />}
            onClick={() => dispatch({ type: 'RESET_SIMULATION' })}
          >
            Reset
          </Button>
        </ButtonGroup>
        
        <ExportButton canvasRef={canvasRef} />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Toggle sound effects">
            <IconButton 
              onClick={() => dispatch({ type: 'TOGGLE_SOUND' })}
              color={state.soundEnabled ? 'primary' : 'default'}
            >
              {state.soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Toggle statistics">
            <IconButton 
              onClick={() => dispatch({ type: 'TOGGLE_STATISTICS' })}
              color={state.showStatistics ? 'primary' : 'default'}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Toggle debug info">
            <IconButton 
              onClick={() => dispatch({ type: 'TOGGLE_DEBUG' })}
              color={state.showDebugInfo ? 'primary' : 'default'}
            >
              <BugReportIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Simulation speed slider */}
      <Box sx={{ width: '100%', mb: 1 }}>
        <Typography id="speed-slider" gutterBottom>
          Simulation Speed
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <SpeedIcon fontSize="small" />
          <Slider
            aria-labelledby="speed-slider"
            value={state.simulationSpeed}
            onChange={handleSpeedChange}
            step={0.1}
            marks
            min={0.1}
            max={5}
            valueLabelDisplay="auto"
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default SimulationControls;
