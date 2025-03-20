import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { calculateNextCollision, calculateCollisionVelocities } from '../utils/physics';

const SimulationContext = createContext();

// Initial state for the simulation
const initialState = {
  blocks: [
    // Big block (initially moving left)
    { 
      id: 1, 
      mass: 100, 
      position: 0.6, // Start further to the right
      velocity: -0.5, // Move left with this velocity
      width: 0.1, 
      color: '#3f51b5' // Blue
    },
    // Small block (initially stationary near wall)
    { 
      id: 2, 
      mass: 1, 
      position: 0.2, // Small block between wall and big block
      velocity: 0, // Initially stationary
      width: 0.1, 
      color: '#f50057' // Pink
    }
  ],
  wallPosition: 0.02, // Slight offset from zero for visibility
  collisionCount: 0,
  collisionEvents: [],
  isRunning: false,
  timeElapsed: 0,
  simulationSpeed: 1,
  soundEnabled: false,
  showStatistics: false,
  showDebugInfo: true, // Show debug info by default for troubleshooting
  timeStep: 1/60, // 60 fps default
  positionHistory: [], // For plotting
  maxTime: 50, // Maximum simulation time
  preset: '100:1', // Current mass ratio preset
};

// Reducer function to handle state updates
function simulationReducer(state, action) {
  switch (action.type) {
    case 'SET_MASS_RATIO':
      const ratio = action.payload;
      const newBlocks = [...state.blocks];
      newBlocks[0] = { ...newBlocks[0], mass: ratio };
      return { 
        ...state, 
        blocks: newBlocks, 
        preset: action.presetName || 'custom',
        collisionCount: 0,
        collisionEvents: [],
        timeElapsed: 0,
        positionHistory: [],
        isRunning: false
      };
      
    case 'TOGGLE_RUNNING':
      return { ...state, isRunning: !state.isRunning };
      
    case 'SET_RUNNING':
      return { ...state, isRunning: action.payload };
      
    case 'RESET_SIMULATION':
      return { 
        ...initialState, 
        blocks: [
          {...initialState.blocks[0], mass: state.blocks[0].mass },
          {...initialState.blocks[1]}
        ],
        preset: state.preset,
        soundEnabled: state.soundEnabled,
        showStatistics: state.showStatistics,
        simulationSpeed: state.simulationSpeed
      };
      
    case 'UPDATE_SIMULATION':
      return { ...state, ...action.payload };
      
    case 'SET_SIMULATION_SPEED':
      return { ...state, simulationSpeed: action.payload };
      
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };
      
    case 'TOGGLE_STATISTICS':
      return { ...state, showStatistics: !state.showStatistics };
      
    case 'TOGGLE_DEBUG':
      return { ...state, showDebugInfo: !state.showDebugInfo };
      
    default:
      return state;
  }
}

// Update API endpoints to use relative URLs that will work on Replit
const API_BASE_URL = '/api';
const SIMULATE_ENDPOINT = `${API_BASE_URL}/simulate`;
const PI_EXPERIMENT_ENDPOINT = `${API_BASE_URL}/pi_experiment`;

export function SimulationProvider({ children }) {
  const [state, dispatch] = useReducer(simulationReducer, initialState);
  
  // Main simulation loop
  useEffect(() => {
    if (!state.isRunning) return;
    
    let animationFrameId;
    let lastTime = performance.now();
    let accumulatedTime = 0;
    
    const stepSimulation = (currentTime) => {
      // Calculate deltaTime and accumulate
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;
      
      // Adjust for simulation speed
      accumulatedTime += deltaTime * state.simulationSpeed;
      
      // Process multiple time steps if needed
      while (accumulatedTime >= state.timeStep && state.isRunning && state.timeElapsed < state.maxTime) {
        // Calculate next collision
        const { blocks } = state;
        const { time: collisionTime, type: collisionType } = calculateNextCollision(blocks, state.wallPosition);
        
        if (collisionTime === Infinity) {
          // No more collisions, just update positions based on velocities
          const newBlocks = blocks.map(block => ({
            ...block,
            position: block.position + block.velocity * state.timeStep
          }));
          
          dispatch({
            type: 'UPDATE_SIMULATION',
            payload: {
              blocks: newBlocks,
              timeElapsed: state.timeElapsed + state.timeStep,
              positionHistory: [...state.positionHistory, 
                { time: state.timeElapsed, block1: newBlocks[0].position, block2: newBlocks[1].position }
              ]
            }
          });
        } else if (collisionTime <= state.timeStep) {
          // Collision occurs within this time step
          let newBlocks = blocks.map(block => ({
            ...block,
            position: block.position + block.velocity * collisionTime
          }));
          
          // Handle collision based on type
          if (collisionType === 'blocks') {
            // Ensure blocks are exactly at the collision point (for numerical stability)
            // Large block (m1) is to the right of small block (m2)
            const correctDistance = newBlocks[1].position + newBlocks[1].width;
            newBlocks[0].position = correctDistance;
            
            // Update velocities based on elastic collision
            const [v1, v2] = calculateCollisionVelocities(
              newBlocks[0].mass, 
              newBlocks[1].mass, 
              newBlocks[0].velocity, 
              newBlocks[1].velocity
            );
            
            newBlocks[0].velocity = v1;
            newBlocks[1].velocity = v2;
          } else if (collisionType === 'wall') {
            // Ensure block doesn't go through wall (for numerical stability)
            newBlocks[1].position = Math.max(state.wallPosition + 0.00001, newBlocks[1].position);
            
            // Wall collision - block 2 reverses direction
            newBlocks[1].velocity = -newBlocks[1].velocity;
          }
          
          dispatch({
            type: 'UPDATE_SIMULATION',
            payload: {
              blocks: newBlocks,
              timeElapsed: state.timeElapsed + collisionTime,
              collisionCount: state.collisionCount + 1,
              collisionEvents: [...state.collisionEvents, { type: collisionType, time: state.timeElapsed + collisionTime }],
              positionHistory: [...state.positionHistory, 
                { time: state.timeElapsed + collisionTime, block1: newBlocks[0].position, block2: newBlocks[1].position }
              ]
            }
          });
          
          // Termination condition: blocks moving right with big block faster than small block
          if (newBlocks[0].velocity > 0 && newBlocks[1].velocity > 0 && newBlocks[0].velocity > newBlocks[1].velocity) {
            dispatch({ type: 'SET_RUNNING', payload: false });
          }
        } else {
          // No collision in this time step, just update positions
          const newBlocks = blocks.map(block => ({
            ...block,
            position: block.position + block.velocity * state.timeStep
          }));
          
          dispatch({
            type: 'UPDATE_SIMULATION',
            payload: {
              blocks: newBlocks,
              timeElapsed: state.timeElapsed + state.timeStep,
              positionHistory: [...state.positionHistory, 
                { time: state.timeElapsed + state.timeStep, block1: newBlocks[0].position, block2: newBlocks[1].position }
              ]
            }
          });
        }
        
        accumulatedTime -= state.timeStep;
      }
      
      if (state.isRunning && state.timeElapsed < state.maxTime) {
        animationFrameId = requestAnimationFrame(stepSimulation);
      } else if (state.timeElapsed >= state.maxTime) {
        dispatch({ type: 'SET_RUNNING', payload: false });
      }
    };
    
    animationFrameId = requestAnimationFrame(stepSimulation);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state.isRunning, state.blocks, state.timeStep, state.simulationSpeed, state.timeElapsed, state.maxTime, state.wallPosition, state.collisionCount, state.collisionEvents, state.positionHistory]);
  
  return (
    <SimulationContext.Provider value={{ state, dispatch }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
