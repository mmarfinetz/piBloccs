import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.patches import Rectangle
# Try to import IPython if available, otherwise provide alternative
try:
    from IPython.display import HTML
    IPYTHON_AVAILABLE = True
except ImportError:
    IPYTHON_AVAILABLE = False
import io
import base64

class BlockCollisionSimulation:
    def __init__(self, m1, m2, v1_initial, v2_initial=0, wall_position=0, block_width=0.1, total_time=10, fps=30):
        """
        Initialize the block collision simulation.
        
        Parameters:
        m1: Mass of block 1 (the initially moving block)
        m2: Mass of block 2 (the initially stationary block)
        v1_initial: Initial velocity of block 1
        v2_initial: Initial velocity of block 2 (default 0)
        wall_position: Position of the wall (default 0)
        block_width: Width of blocks for visualization (default 0.1)
        total_time: Total simulation time (default 10)
        fps: Frames per second for animation (default 30)
        """
        self.m1 = m1
        self.m2 = m2
        self.v1 = v1_initial
        self.v2 = v2_initial
        self.wall_position = wall_position
        self.block_width = block_width
        
        # Initial positions - place blocks initially separated
        self.x1 = 0.5  # Big block starts here
        self.x2 = 0.2  # Small block near the wall
        
        # For recording the simulation
        self.total_time = total_time
        self.dt = 1/fps  # Time step
        self.num_frames = int(total_time * fps)
        
        # For storing the simulation data
        self.positions_1 = []
        self.positions_2 = []
        self.velocities_1 = []
        self.velocities_2 = []
        self.times = []
        self.collision_times = []
        self.collision_count = 0
        self.collision_events = []  # To store what type of collision occurred
        
        # Colors for visualization
        self.block1_color = 'blue'
        self.block2_color = 'red'
    
    def calculate_collision_velocities(self, m1, m2, v1, v2):
        """Calculate velocities after a collision between two blocks"""
        new_v1 = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2)
        new_v2 = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2)
        return new_v1, new_v2
    
    def time_to_next_collision(self):
        """Calculate time to next collision (block-block or block-wall)"""
        # Time to collision between blocks
        if self.v1 > self.v2:  # Blocks moving apart
            t_blocks = float('inf')
        else:
            # Distance between blocks divided by relative velocity
            rel_velocity = self.v2 - self.v1
            if abs(rel_velocity) < 1e-10:  # Blocks moving at same velocity (practically)
                t_blocks = float('inf')
            else:
                t_blocks = (self.x1 - self.x2 - self.block_width) / rel_velocity
                if t_blocks < 0:  # Already overlapping (shouldn't happen)
                    t_blocks = float('inf')
        
        # Time to collision with wall
        if self.v2 > 0:  # Moving away from wall
            t_wall = float('inf')
        elif abs(self.v2) < 1e-10:  # Not moving (velocity is practically zero)
            t_wall = float('inf')
        else:
            t_wall = (self.wall_position - self.x2) / self.v2
            if t_wall < 0:  # Already past wall (shouldn't happen)
                t_wall = float('inf')
        
        # Return the earlier collision time and type
        if t_blocks < t_wall:
            return t_blocks, "blocks"
        else:
            return t_wall, "wall"
    
    def run_simulation(self):
        """Run the full simulation"""
        time = 0
        
        # Append initial state
        self.positions_1.append(self.x1)
        self.positions_2.append(self.x2)
        self.velocities_1.append(self.v1)
        self.velocities_2.append(self.v2)
        self.times.append(time)
        
        # Maximum number of events to prevent infinite loops
        max_events = 100000
        event_count = 0
        
        # Simulation precision for small time steps
        precision_factor = 0.0000001
        
        while time < self.total_time and event_count < max_events:
            # Calculate time to next collision
            dt_collision, collision_type = self.time_to_next_collision()
            
            if dt_collision == float('inf'):
                # No more collisions will occur, move to end of simulation
                next_time = self.total_time
                self.x1 += self.v1 * (next_time - time)
                self.x2 += self.v2 * (next_time - time)
                time = next_time
                
                self.positions_1.append(self.x1)
                self.positions_2.append(self.x2)
                self.velocities_1.append(self.v1)
                self.velocities_2.append(self.v2)
                self.times.append(time)
                break
            
            # Move blocks to collision time
            next_time = time + dt_collision
            self.x1 += self.v1 * dt_collision
            self.x2 += self.v2 * dt_collision
            time = next_time
            
            # Handle the collision
            if collision_type == "blocks":
                self.v1, self.v2 = self.calculate_collision_velocities(self.m1, self.m2, self.v1, self.v2)
                self.collision_events.append(("blocks", time))
            else:  # Wall collision
                self.v2 = -self.v2  # Velocity of block 2 reverses
                self.collision_events.append(("wall", time))
            
            # Record collision
            self.collision_times.append(time)
            self.collision_count += 1
            
            # Store the state after collision
            self.positions_1.append(self.x1)
            self.positions_2.append(self.x2)
            self.velocities_1.append(self.v1)
            self.velocities_2.append(self.v2)
            self.times.append(time + precision_factor)  # Add a small increment to avoid duplicate times
            
            event_count += 1
            
            # Check for termination condition
            if self.v1 > 0 and self.v2 > 0 and self.v1 > self.v2:
                # Blocks moving right with big block faster than small block - experiment is done
                break
        
        print(f"Total collisions: {self.collision_count}")
        return self.collision_count
    
    def create_animation(self, filename=None):
        """Create animation of the simulation"""
        # Interpolate positions for smooth animation
        interp_times = np.linspace(min(self.times), max(self.times), self.num_frames)
        pos1 = np.interp(interp_times, self.times, self.positions_1)
        pos2 = np.interp(interp_times, self.times, self.positions_2)
        
        # Setup the figure
        fig, ax = plt.subplots(figsize=(10, 4))
        wall = Rectangle((self.wall_position, 0), 0.02, 1, color='black')
        block1 = Rectangle((pos1[0], 0.35), self.block_width, 0.3, color=self.block1_color)
        block2 = Rectangle((pos2[0], 0.35), self.block_width, 0.3, color=self.block2_color)
        
        collision_text = ax.text(0.05, 0.9, '', transform=ax.transAxes)
        time_text = ax.text(0.05, 0.85, '', transform=ax.transAxes)
        
        # Add elements to plot
        ax.add_patch(wall)
        ax.add_patch(block1)
        ax.add_patch(block2)
        
        # Set axis limits
        max_pos = max(max(self.positions_1), max(self.positions_2)) + 0.2
        ax.set_xlim(-0.1, max_pos)
        ax.set_ylim(0, 1)
        ax.set_aspect('equal', adjustable='box')
        
        # Add floor line
        ax.axhline(y=0.35, color='black', linestyle='-', alpha=0.3)
        
        # Display mass ratio
        ax.text(0.05, 0.95, f'Mass Ratio: {self.m1/self.m2:.0f}:1', transform=ax.transAxes)
        
        def init():
            """Initialize animation"""
            block1.set_xy((pos1[0], 0.35))
            block2.set_xy((pos2[0], 0.35))
            collision_text.set_text(f'Collisions: 0')
            time_text.set_text(f'Time: 0.00s')
            return wall, block1, block2, collision_text, time_text
            
        def animate(i):
            """Update animation for each frame"""
            block1.set_xy((pos1[i], 0.35))
            block2.set_xy((pos2[i], 0.35))
            
            # Count collisions up to current time
            num_collisions = sum(1 for t in self.collision_times if t <= interp_times[i])
            collision_text.set_text(f'Collisions: {num_collisions}')
            time_text.set_text(f'Time: {interp_times[i]:.2f}s')
            
            return wall, block1, block2, collision_text, time_text
            
        anim = animation.FuncAnimation(fig, animate, init_func=init, frames=self.num_frames, 
                                       interval=1000/30, blit=True)
        
        if filename:
            anim.save(filename, writer='pillow', fps=30)
            
        plt.close()
        
        # Return HTML only if IPython is available, otherwise return the animation object
        if IPYTHON_AVAILABLE:
            return HTML(anim.to_jshtml())
        else:
            return anim

    def create_animation_frames(self):
        """Create animation frames as base64 encoded images for web display"""
        # Reduce frame count to minimize memory usage
        reduced_frames = min(30, self.num_frames)
        
        # Interpolate positions for smooth animation
        interp_times = np.linspace(min(self.times), max(self.times), reduced_frames)
        pos1 = np.interp(interp_times, self.times, self.positions_1)
        pos2 = np.interp(interp_times, self.times, self.positions_2)
        
        frames = []
        
        # Setup the figure (smaller size to reduce memory usage)
        fig, ax = plt.subplots(figsize=(6, 3), dpi=80)
        plt.ioff()  # Turn interactive mode off to save memory
        
        # Set axis limits
        max_pos = max(max(self.positions_1), max(self.positions_2)) + 0.2
        
        # Generate frames
        for i in range(reduced_frames):
            ax.clear()
            
            # Set axis limits 
            ax.set_xlim(-0.1, max_pos)
            ax.set_ylim(0, 1)
            
            # Add wall
            wall = Rectangle((self.wall_position, 0), 0.02, 1, color='black')
            ax.add_patch(wall)
            
            # Add blocks
            block1 = Rectangle((pos1[i], 0.35), self.block_width, 0.3, color=self.block1_color)
            block2 = Rectangle((pos2[i], 0.35), self.block_width, 0.3, color=self.block2_color)
            ax.add_patch(block1)
            ax.add_patch(block2)
            
            # Add floor line
            ax.axhline(y=0.35, color='black', linestyle='-', alpha=0.3)
            
            # Count collisions up to current time
            num_collisions = sum(1 for t in self.collision_times if t <= interp_times[i])
            ax.text(0.05, 0.9, f'Collisions: {num_collisions}', transform=ax.transAxes)
            ax.text(0.05, 0.85, f'Time: {interp_times[i]:.2f}s', transform=ax.transAxes)
            ax.text(0.05, 0.95, f'Mass Ratio: {self.m1/self.m2:.0f}:1', transform=ax.transAxes)
            
            # Convert plot to base64 image
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=80, bbox_inches='tight')
            buffer.seek(0)
            img_str = base64.b64encode(buffer.read()).decode('utf-8')
            frames.append(img_str)
            buffer.close()
            
        plt.close(fig)
        return frames

def run_pi_experiment(mass_ratio=100, v1_initial=-1):
    """
    Run the pi experiment with a specific mass ratio
    
    Parameters:
    mass_ratio: The ratio of m1/m2 (default 100)
    v1_initial: Initial velocity of big block (default -1)
    
    Returns:
    The simulation object and number of collisions
    """
    sim = BlockCollisionSimulation(
        m1=mass_ratio, 
        m2=1, 
        v1_initial=v1_initial,
        total_time=50 if mass_ratio <= 10000 else 500  # Longer simulation for larger mass ratios
    )
    collisions = sim.run_simulation()
    return sim, collisions

# Function to test multiple mass ratios and show the pi connection
def test_multiple_ratios():
    """Test the simulation with multiple mass ratios to show the pi connection"""
    mass_ratios = [1, 100, 10000, 1000000]
    results = []
    
    for ratio in mass_ratios:
        sim, collisions = run_pi_experiment(mass_ratio=ratio)
        results.append((ratio, collisions))
        print(f"Mass ratio {ratio}:1 resulted in {collisions} collisions")
    
    # Display the results in relation to pi
    print("\nConnection to pi:")
    for ratio, collisions in results:
        if ratio == 1:
            print(f"Mass ratio 1:1 → 3 collisions")
        else:
            power = int(np.log10(ratio)) // 2
            pi_digits = collisions / 10**power
            print(f"Mass ratio {ratio}:1 → {collisions} collisions ≈ π × 10^{power} = {pi_digits:.6f} × 10^{power}")

# Example usage:
if __name__ == "__main__":
    # Run a single experiment with a mass ratio of 100:1
    sim, collisions = run_pi_experiment(mass_ratio=100)
    
    # Create animation
    animation = sim.create_animation(filename="block_collision_100.gif")
    
    # Uncomment to test multiple ratios
    test_multiple_ratios()