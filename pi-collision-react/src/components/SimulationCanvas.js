import React, { useRef, useEffect, forwardRef } from 'react';
import { Box } from '@mui/material';
import { useSimulation } from '../contexts/SimulationContext';

const SimulationCanvas = forwardRef((props, ref) => {
  // Use provided ref or create internal one
  const internalCanvasRef = useRef(null);
  const canvasRef = ref || internalCanvasRef;
  
  const { state } = useSimulation();
  const { blocks, wallPosition, collisionEvents, timeElapsed, isRunning, showDebugInfo } = state;
  
  // Animation effect for rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size with high resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Set scale for visualization with more appropriate scaling
    const maxPosition = Math.max(blocks[0].position + blocks[0].width, blocks[1].position + blocks[1].width) + 0.2;
    const scaleFactor = (rect.width - 80) / maxPosition; // Leave reasonable margins
    const yCenter = rect.height / 2;
    const blockHeight = rect.height * 0.3;
    const floorY = yCenter + blockHeight / 2;
    
    // Draw floor
    ctx.beginPath();
    ctx.moveTo(20, floorY);
    ctx.lineTo(rect.width - 20, floorY);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw wall
    const wallX = 20 + (wallPosition * scaleFactor);
    ctx.fillStyle = '#333';
    ctx.fillRect(wallX - 5, floorY - blockHeight, 10, blockHeight);
    
    // Draw blocks
    blocks.forEach((block) => {
      const blockX = 20 + (block.position * scaleFactor);
      const blockWidth = block.width * scaleFactor;
      
      // Check for recent collision for highlight effect
      const isRecentCollision = collisionEvents.some(
        (event) => timeElapsed - event.time < 0.1 && 
                  ((event.type === 'blocks' && (block.id === 1 || block.id === 2)) ||
                   (event.type === 'wall' && block.id === 2))
      );
      
      // Draw block with glow effect if recent collision
      ctx.save();
      if (isRecentCollision) {
        ctx.shadowColor = '#FFF200';
        ctx.shadowBlur = 15;
      }
      
      ctx.fillStyle = block.color;
      ctx.fillRect(blockX, floorY - blockHeight, blockWidth, blockHeight);
      
      // Draw mass label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Only show labels if blocks are wide enough
      if (blockWidth > 30) {
        if (block.id === 1) {
          ctx.fillText(`m₁`, blockX + blockWidth/2, floorY - blockHeight/2);
        } else {
          ctx.fillText(`m₂`, blockX + blockWidth/2, floorY - blockHeight/2);
        }
      }
      
      ctx.restore();
    });
    
    // Draw time
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Time: ${timeElapsed.toFixed(2)}s`, 25, 20);
    
    // Show debug info if enabled
    if (showDebugInfo) {
      // Draw velocities for debugging
      ctx.fillText(`v₁: ${blocks[0].velocity.toFixed(3)}`, 25, 40);
      ctx.fillText(`v₂: ${blocks[1].velocity.toFixed(3)}`, 25, 60);
      
      // Position debug for easier understanding
      ctx.fillText(`Position₁: ${blocks[0].position.toFixed(3)}`, rect.width - 200, 20);
      ctx.fillText(`Position₂: ${blocks[1].position.toFixed(3)}`, rect.width - 200, 40);
      
      // Collision info
      ctx.fillText(`Collisions: ${collisionEvents.length}`, rect.width - 200, 60);
    }
  }, [blocks, wallPosition, collisionEvents, timeElapsed, isRunning, canvasRef, showDebugInfo]);
  
  return (
    <Box sx={{ width: '100%', height: 300, mt: 2 }}>
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%' }}
      />
    </Box>
  );
});

export default SimulationCanvas;