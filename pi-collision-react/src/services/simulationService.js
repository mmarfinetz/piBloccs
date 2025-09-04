import { supabase } from '../supabaseClient'

export const simulationService = {
  async saveSimulationResult(data) {
    const { m1, m2, v1, v2, collision_count, pi_approximation, animation_data } = data
    
    const { data: result, error } = await supabase
      .from('simulation_results')
      .insert([{
        m1,
        m2,
        v1_initial: v1,
        v2_initial: v2,
        collision_count,
        pi_approximation,
        animation_data
      }])
      .select()

    if (error) throw error
    return result
  },

  async getSimulationResults() {
    const { data, error } = await supabase
      .from('simulation_results')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error
    return data
  },

  async getSimulationById(id) {
    const { data, error } = await supabase
      .from('simulation_results')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }
} 