import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Slider,
  Typography,
  Stack,
  TextField,
  FormControlLabel,
  Switch,
  Tooltip,
  IconButton,
  Divider
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
  const { state, dispatch } = useSimulation();
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
  
  return (
    <Box sx={{ mt: 3, px: 2 }}>
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
