import React, { useState } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ExplanationSection = () => {
  const [expanded, setExpanded] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  
  return (
    <Box>
      <Typography variant="h5" component="h3" gutterBottom>
        About This Experiment
      </Typography>
      
      <Typography variant="body2" paragraph>
        This simulation demonstrates how colliding blocks can compute digits of π.
        When a large block collides with a smaller block near a wall, the total number
        of collisions approximates π × 10^n for mass ratios of 100^n:1.
      </Typography>
      
      <Button 
        variant="outlined" 
        onClick={() => setShowWalkthrough(!showWalkthrough)}
        sx={{ mb: 2 }}
        fullWidth
      >
        {showWalkthrough ? 'Hide' : 'Show'} Step-by-Step Walkthrough
      </Button>
      
      {showWalkthrough && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Step-by-Step Guide:
          </Typography>
          <ol>
            <li>Set the mass ratio (try 100:1 first)</li>
            <li>Press Play to start the simulation</li>
            <li>Watch as the blocks collide with each other and the wall</li>
            <li>Notice the counter tracking the number of collisions</li>
            <li>When the simulation ends, check the π Connection tab</li>
            <li>Try different mass ratios to see how they relate to π</li>
          </ol>
        </Box>
      )}
      
      <Accordion expanded={expanded === 'panel1'} onChange={handleAccordionChange('panel1')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>The Physics Explained</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">
            This system demonstrates conservation of energy and momentum. During elastic collisions, 
            both quantities are preserved. The mathematical properties of these conservation laws, 
            combined with the mass ratio between the blocks, create a pattern that converges to π.
          </Typography>
        </AccordionDetails>
      </Accordion>
      
      <Accordion expanded={expanded === 'panel2'} onChange={handleAccordionChange('panel2')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>The Mathematical Connection</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">
            For a mass ratio of 100^n:1, the number of collisions approximates π × 10^n. This connection
            arises from the fact that the blocks' trajectories form a circular pattern in phase space (momentum-position).
            The number of collisions corresponds to how many times this pattern wraps around the circle, which is related to π.
          </Typography>
        </AccordionDetails>
      </Accordion>
      
      <Accordion expanded={expanded === 'panel3'} onChange={handleAccordionChange('panel3')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Applications & Extensions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">
            Beyond being a mathematical curiosity, this system represents a simple physically-realizable algorithm for calculating π.
            It demonstrates how physical systems can perform computations, connecting to concepts in quantum computing and information theory.
            The system can also be extended to calculate other mathematical constants with different initial conditions.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ExplanationSection;
