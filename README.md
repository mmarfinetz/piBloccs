# Block Collision Simulation - π Approximation

This web application demonstrates the fascinating connection between physics and mathematics through a block collision simulation that approximates π.

## The Physics Behind It

The simulation consists of two blocks on a frictionless surface, with one block against a wall. When the masses of the blocks are set to a ratio of 100ⁿ:1, the number of collisions that occur approximates π × 10ⁿ.

For example:
- Mass ratio 1:1 → 3 collisions
- Mass ratio 100:1 → 31 collisions (≈ π × 10)
- Mass ratio 10,000:1 → 314 collisions (≈ π × 100)
- Mass ratio 1,000,000:1 → 3141 collisions (≈ π × 1000)

This relationship was discovered by mathematician Gregory Galperin in the 1990s.

## Features

- Interactive web interface to run simulations with custom parameters
- Visual animation of the block collisions
- "Quick Pi Experiment" that demonstrates the relationship with different mass ratios
- Real-time calculation of collision count and π approximation

## Technologies Used

- Python with Flask for the backend
- Matplotlib for simulation and visualization
- Bootstrap for the frontend UI
- JavaScript for interactive controls

## Setup Instructions

### Local Development

1. Clone the repository:
```
git clone https://github.com/yourusername/block-collision-simulation.git
cd block-collision-simulation
```

2. Create a virtual environment and install dependencies:
```
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Run the application:
```
python app.py
```

4. Open your browser and navigate to `http://localhost:8080`

### Deployment on Replit

1. Create a new Replit project
2. Import from GitHub repository
3. The application should automatically install dependencies and run

## License

MIT

## Acknowledgements

- Based on the mathematics of Gregory Galperin
- Inspired by various physics simulations exploring the connection between physical phenomena and mathematical constants 