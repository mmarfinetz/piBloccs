from flask import Flask, request, jsonify
import io
import base64
import matplotlib
matplotlib.use('Agg')  # Use the 'Agg' backend for generating images without a display
import numpy as np
from simulation import BlockCollisionSimulation
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/simulate', methods=['POST'])
def simulate():
    """Run the simulation with the provided parameters and return results"""
    try:
        # Get parameters from JSON request
        data = request.get_json()
        m1 = float(data.get('m1', 100))
        m2 = float(data.get('m2', 1))
        v1 = float(data.get('v1', -1))
        v2 = float(data.get('v2', 0))
        
        # Create and run simulation
        sim = BlockCollisionSimulation(
            m1=m1, 
            m2=m2, 
            v1_initial=v1,
            v2_initial=v2,
            total_time=10
        )
        collision_count = sim.run_simulation()
        
        # Generate animation frames as base64 image
        img_data = sim.create_animation_frames()
        
        # Return the results
        return jsonify({
            'status': 'success',
            'collision_count': collision_count,
            'animation_data': img_data,
            'pi_approximation': collision_count / (10 ** (int(np.log10(m1/m2)) // 2)) if m1 > m2 else None
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/pi_experiment', methods=['GET'])
def pi_experiment():
    """Run the pi experiment with multiple mass ratios"""
    mass_ratios = [1, 100, 10000, 1000000]
    results = []
    
    for ratio in mass_ratios:
        sim = BlockCollisionSimulation(
            m1=ratio, 
            m2=1, 
            v1_initial=-1,
            total_time=50 if ratio <= 10000 else 500
        )
        collisions = sim.run_simulation()
        
        if ratio == 1:
            pi_relation = "N/A"
        else:
            power = int(np.log10(ratio)) // 2
            pi_digits = collisions / 10**power
            pi_relation = f"{pi_digits:.6f} × 10^{power}"
            
        results.append({
            'ratio': ratio,
            'collisions': collisions,
            'pi_relation': pi_relation
        })
    
    return jsonify({'status': 'success', 'results': results})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True) 