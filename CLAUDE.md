# CLAUDE.md - Guidelines for this repository

## Commands
- Run simulation: `python simulation.py`
- Run specific experiment: `python -c "from simulation import run_pi_experiment; sim, collisions = run_pi_experiment(mass_ratio=100)"`
- Test multiple ratios: `python -c "from simulation import test_multiple_ratios; test_multiple_ratios()"`
- Create animation: `python -c "from simulation import run_pi_experiment; sim, _ = run_pi_experiment(mass_ratio=100); sim.create_animation(filename='my_animation.gif')"`

## Code Style Guidelines
- **Imports**: Standard libraries first, then third-party packages, then local modules
- **Formatting**: 4-space indentation, 80-character line limit
- **Naming**: Classes use CamelCase, functions/variables use snake_case
- **Documentation**: Docstrings for all classes and functions using NumPy style
- **Error Handling**: Use appropriate checks for edge cases, especially in physics calculations
- **Types**: Type hints are not currently used but may be introduced in the future
- **Comments**: Include comments for complex physics/math operations

## Repository Structure
- `simulation.py`: Main simulation code with `BlockCollisionSimulation` class
- `*.gif`: Animation outputs from the simulation