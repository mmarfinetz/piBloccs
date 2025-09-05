const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON
app.use(express.json());

// Serve the schema file
app.get('/mcp-schema.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mcp-schema.json'));
});

// SSE endpoint for Cursor MCP
app.get('/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send initial connection message
  res.write('event: connected\ndata: {}\n\n');
  
  // Handle client disconnect
  req.on('close', () => {
    console.log('Client disconnected from SSE');
  });
});

// Handle tool invocations from Cursor
app.post('/tools/:tool_name', async (req, res) => {
  const { tool_name } = req.params;
  const params = req.body;
  
  try {
    let response;
    
    if (tool_name === 'run_simulation') {
      // Forward to our simulation API
      response = await fetch('http://localhost:5000/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          m1: params.m1 || 100,
          m2: params.m2 || 1,
          v1: params.v1 || -1,
          v2: params.v2 || 0
        })
      });
    } else if (tool_name === 'pi_experiment') {
      // Forward to our pi experiment API
      response = await fetch('http://localhost:3000/api/pi_experiment');
    } else {
      return res.status(404).json({ error: `Tool '${tool_name}' not found` });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Error invoking tool ${tool_name}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Vercel deployment support
app.get('/mcp-vercel/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send initial connection message
  res.write('event: connected\ndata: {}\n\n');
  
  // Handle client disconnect
  req.on('close', () => {
    console.log('Client disconnected from SSE');
  });
});

app.post('/mcp-vercel/tools/:tool_name', async (req, res) => {
  const { tool_name } = req.params;
  const params = req.body;
  
  try {
    let response;
    const apiBaseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/api` 
      : 'http://localhost:5000/api';
    
    if (tool_name === 'run_simulation') {
      response = await fetch(`${apiBaseUrl}/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          m1: params.m1 || 100,
          m2: params.m2 || 1,
          v1: params.v1 || -1,
          v2: params.v2 || 0
        })
      });
    } else if (tool_name === 'pi_experiment') {
      response = await fetch(`${apiBaseUrl}/pi_experiment`);
    } else {
      return res.status(404).json({ error: `Tool '${tool_name}' not found` });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(`Error invoking tool ${tool_name}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`MCP server running on port ${PORT}`);
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`Schema available at: http://localhost:${PORT}/mcp-schema.json`);
}); 