# Physics Simulation MCP for Cursor

This is a Model Context Protocol (MCP) implementation for the Physics Simulation project that integrates with Cursor and Vercel.

## What is MCP?

Model Context Protocol (MCP) is an open protocol that allows you to provide custom tools to agentic LLMs (Large Language Models) in Cursor's Composer feature. In this project, we've implemented an MCP server that provides tools for running physics simulations that approximate Pi.

## Setup Instructions

### Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the MCP server locally:
   ```
   npm run start-mcp
   ```

3. In Cursor, set up the MCP:
   - Open Cursor Settings > Features > MCP
   - Click "+ Add New MCP Server"
   - Name: "Physics Simulation MCP"
   - Type: "SSE"
   - URL: `http://localhost:3001/sse`

4. Start your main application server:
   ```
   npm start
   ```

### Deploying to Vercel

1. Deploy the application to Vercel:
   ```
   vercel
   ```

2. Get your Vercel deployment URL.

3. Update your MCP URL in Cursor:
   - Open Cursor Settings > Features > MCP
   - Edit the server configuration
   - URL: `https://your-vercel-deployment-url.vercel.app/mcp-vercel/sse`

## Available Tools

The MCP server provides the following tools to the LLM in Cursor:

1. **run_simulation** - Run a physics simulation with two colliding blocks to approximate Pi
   - Parameters:
     - `m1`: Mass of the first block (larger block)
     - `m2`: Mass of the second block (smaller block)
     - `v1`: Initial velocity of the first block
     - `v2`: Initial velocity of the second block

2. **pi_experiment** - Run the pre-configured pi approximation experiment with multiple mass ratios

## Example Usage

In Cursor's Composer, you can ask the AI to run simulations like:

- "Run a physics simulation with mass ratio 100:1 and initial velocities -1 and 0"
- "Calculate Pi using block collisions with a mass ratio of 10000:1"
- "Run the pi experiment and show me the results for different mass ratios"

## Technical Details

The MCP server:
- Uses Server-Sent Events (SSE) for communication with Cursor
- Forwards requests to your Vercel-deployed API endpoints
- Provides an OpenAPI schema at `/mcp-schema.json` 