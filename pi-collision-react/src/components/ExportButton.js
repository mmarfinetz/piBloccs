import React, { useRef, useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import DataObjectIcon from '@mui/icons-material/DataObject';
import { createGIF, exportSimulationData, downloadBlob } from '../utils/exportHelpers';
import { useSimulation } from '../contexts/SimulationContext';

const ExportButton = ({ canvasRef }) => {
  const { state } = useSimulation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [exporting, setExporting] = useState(false);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleExportGIF = async () => {
    setExporting(true);
    try {
      const blob = await createGIF(canvasRef);
      if (blob) {
        downloadBlob(blob, `pi-collision-${state.blocks[0].mass}-${state.collisionCount}.png`);
      }
    } catch (error) {
      console.error('Error exporting GIF:', error);
    } finally {
      setExporting(false);
      handleClose();
    }
  };
  
  const handleExportData = () => {
    setExporting(true);
    try {
      const blob = exportSimulationData(state);
      downloadBlob(blob, `pi-collision-data-${state.blocks[0].mass}-${state.collisionCount}.json`);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setExporting(false);
      handleClose();
    }
  };
  
  return (
    <>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={handleClick}
        disabled={state.collisionCount === 0 || exporting}
      >
        {exporting ? <CircularProgress size={24} /> : 'Export'}
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleExportGIF}>
          <ListItemIcon>
            <ImageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as Image</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleExportData}>
          <ListItemIcon>
            <DataObjectIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export Data (JSON)</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ExportButton;