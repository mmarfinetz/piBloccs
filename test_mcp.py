from simulation import BlockCollisionSimulation, test_multiple_ratios

def test_run_simulation(m1=100, m2=1, v1=-1, v2=0):
    """Test the run_simulation function directly"""
    print(f"Running simulation with m1={m1}, m2={m2}, v1={v1}, v2={v2}")
    sim = BlockCollisionSimulation(
        m1=m1, 
        m2=m2, 
        v1_initial=v1,
        v2_initial=v2,
        total_time=10
    )
    collision_count = sim.run_simulation()
    print(f"Collision count: {collision_count}")
    
    # Calculate pi approximation if applicable
    if m1 > m2:
        power = int(np.log10(m1/m2)) // 2
        pi_approx = collision_count / (10 ** power)
        print(f"Pi approximation: {pi_approx} × 10^{power}")
    
    return collision_count

def test_pi_experiment():
    """Test the pi experiment function directly"""
    print("Running Pi experiment with multiple mass ratios")
    test_multiple_ratios()

if __name__ == "__main__":
    import sys
    import numpy as np
    
    # Check if arguments were provided
    if len(sys.argv) > 1:
        if sys.argv[1] == "run_simulation":
            # Parse parameters if provided
            m1 = 100
            m2 = 1
            v1 = -1
            v2 = 0
            
            if len(sys.argv) > 2:
                m1 = float(sys.argv[2])
            if len(sys.argv) > 3:
                m2 = float(sys.argv[3])
            if len(sys.argv) > 4:
                v1 = float(sys.argv[4])
            if len(sys.argv) > 5:
                v2 = float(sys.argv[5])
                
            test_run_simulation(m1, m2, v1, v2)
        elif sys.argv[1] == "pi_experiment":
            test_pi_experiment()
        else:
            print(f"Unknown command: {sys.argv[1]}")
            print("Available commands: run_simulation, pi_experiment")
    else:
        print("Usage: python test_mcp.py [command] [parameters]")
        print("Commands:")
        print("  run_simulation [m1=100] [m2=1] [v1=-1] [v2=0]")
        print("  pi_experiment") 