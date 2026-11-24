# JalRakshak 3D Interactive Village & Game World

## 1. Overview
The JalRakshak 3D world simulates an authentic Indian rural watershed environment. It serves as an interactive virtual laboratory where students explore the relationship between surface human activities (farming, domestic usage, rainwater harvesting) and subterranean groundwater dynamics.

---

## 2. Procedural Village Elements

### A. Dwellings & Architecture (`VillageHouses.tsx`)
1. **Rooftop Rainwater Harvesting Pucca House**:
   - Flat concrete roof equipped with parapet catchments, PVC downpipe, first-flush diverter, and sand-gravel filtration sump.
   - Teaches students how 120 m² roof area captures >70,000 L of monsoon deluge annually.
2. **Traditional Kutcha Hut**:
   - Earthen sun-dried clay bricks, timber frames, and thatched conical straw roofs with perimeter soak pits.
3. **Gram Panchayat & Jal Samiti Building**:
   - Plinth verandah, public meeting hall, and tricolor mast representing participatory water budgeting and community governance.

### B. Agricultural Plots (`AgriculturalFields.tsx`)
1. **Flood-Irrigated Sugarcane Plot**:
   - Demonstrates traditional furrow flood irrigation with high evaporative and conveyance water loss (22,000 m³/ha).
2. **Micro-Irrigated Millet Plot**:
   - Subsurface drip lateral tubes delivering targeted hydration directly to plant root zones, saving 55–65% water.

### C. Water Bodies (`WaterBodies.tsx`)
1. **Seasonal River / Monsoon Drainage Stream**:
   - Animated water plane representing watershed runoff channels.
2. **Village Community Pond (Talab)**:
   - Deep percolation basin with traditional stone steps (*ghats*), recharging agricultural wells within a 1.5 km radius.
3. **Elevated Overhead Reservoir (Tank)**:
   - Modern reinforced concrete structure distributing potable water under the Jal Jeevan Mission.

### D. Conservation Structures (`ConservationStructures.tsx`)
1. **Masonry Check Dam**:
   - Barrier built across the stream bed creating an upstream impoundment pool that promotes aquifer infiltration.
2. **Percolation Tank with Recharge Shaft**:
   - Dedicated porous basin that channels monsoon surface runoff directly into deep unconfined basalt fissures.

### E. Infrastructure (`VillageInfrastructure.tsx`)
1. **Traditional Masonry Dug Well**:
   - Shallow well tapping the weathered regolith zone. Allows students to visually observe water table drawdowns.
2. **Electric Motor Borewell Pump Shed**:
   - 150-meter deep tube well representing motorized extraction and the energy-water nexus.

---

## 3. The Subterranean Groundwater Layer (`GroundwaterLayer.tsx`)
When the user toggles the **Underground Aquifer** mode:
1. Surface terrain shifts to semi-transparent wireframe.
2. The sub-surface geological strata become illuminated:
   - **Topsoil & Alluvium** (0 to -4m)
   - **Weathered Regolith & Fractured Basalt** (-4m to -12m)
   - **Unconfined Aquifer Saturated Zone**: The water table mesh dynamically shifts along the vertical $Y$-axis based on the mathematical simulation's `storagePercentage`:
     $$Y = -18.0 + \left(\frac{\text{storagePercentage}}{100}\right) \times 14.0\text{ meters}$$
   - **Aquifer Condition Color Codes**:
     - *Critical* (< 30%): Red-orange alarm glow
     - *Semi-Critical* (30–55%): Warm amber
     - *Safe* (55–80%): Cobalt blue
     - *Optimal* (> 80%): Turquoise cyan
3. **Cone of Depression**: Visible conical funnel formed under active motorized borewells during pumping.
4. **Infiltration Particles**: Stream of downward-moving particles illustrating rainfall percolation through the soil profile.
