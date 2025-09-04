-- Create a table for storing simulation results
create table simulation_results (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  m1 double precision not null,
  m2 double precision not null,
  v1_initial double precision not null,
  v2_initial double precision not null,
  collision_count integer not null,
  pi_approximation double precision,
  animation_data text
); 