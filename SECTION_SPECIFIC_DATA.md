# Section-Specific Process Parameters and Equipment

## Overview
The Process Parameters page now displays section-specific parameters and equipment based on the selected section. Each section has its own unique set of critical process parameters and equipment.

## Section Mappings

### CIL (Carbon-in-Leach)
**Process Parameters:**
- Cyanide Level - CIL Tank 1 (ppm)
- Dissolved Oxygen - CIL Tank 1 (mg/L)
- Density (g/cm³)
- Percentage solids (%)
- pH Level

**Critical Equipment:**
- Cyanide Dosing Pump
- Oxygen Generation Plant
- Recovery Pump
- Carbon Screening System
- CIL Tank 3 Agitator

### Elution
**Process Parameters:**
- Temperature (°C)
- Pressure (bar)

**Critical Equipment:**
- Thermomat
- Recovery Screen
- Strip Solution Pump
- Kiln
- Reagent Water Pump

### Milling
**Process Parameters:**
- Throughput (t/h)
- Cyclone Pressure (kPa)
- Mill Discharge Density (g/cm³)
- Mill Weight (t)
- Mill Power (kW)

**Critical Equipment:**
- Discharge Pump PP12
- Discharge Pump PP14
- Discharge Screen 6
- Gravity Screen 33
- Gravity Screen 34
- SAG Mill
- CV-015
- CV-022
- CV-023
- Raw Water Pump

### Gravity Circuit
**Process Parameters:**
- Amps (A)

**Critical Equipment:**
- Knelson 1
- Knelson 2

### Crusher
**Process Parameters:**
- Throughput (t/h)

**Critical Equipment:**
- Crusher
- Feeder 06
- CV-010
- CV-501
- Oxide Apron Feeder

### Flotation
**Process Parameters:**
- Density (g/cm³)
- Reagent Concentration (g/L)

**Critical Equipment:**
- Flotation Cell Motor 1
- Flotation Cell Motor 2
- Flotation Cell Motor 3
- Flotation Cell Motor 4
- Flotation Cell Motor 5
- Flotation Cell Motor 6
- Flotation Cell Motor 7
- Flotation Tailings Motor

## Tag Naming Convention

### Analog Parameters (Process Parameters)
Format: `SECTION.PARAMETER.F_CV`

Examples:
- `FIX.CN_LEVEL_.F_CV` (CIL section - existing tag)
- `ELUTION.TEMPERATURE.F_CV` (Elution section)
- `MILLING.THROUGHPUT.F_CV` (Milling section)
- `FLOTATION.DENSITY.F_CV` (Flotation section)
- `GRAVITY.AMPS.F_CV` (Gravity section)
- `CRUSHER.THROUGHPUT.F_CV` (Crusher section)

### Digital Equipment (Equipment Status)
Format: `SECTION.EQUIPMENT_NAME.F_CV`

Examples:
- `FIX.CN_DOSING_PUMP.F_CV` (CIL section - existing tag)
- `ELUTION.THERMOMAT.F_CV` (Elution section)
- `MILLING.SAG_MILL.F_CV` (Milling section)
- `FLOTATION.CELL_1.F_CV` (Flotation section)
- `GRAVITY.KNELSON_1.F_CV` (Gravity section)
- `CRUSHER.MAIN.F_CV` (Crusher section)

## Implementation Details

### Data Structure
```typescript
const SECTION_PARAMETERS: Record<string, Parameter[]> = {
  'cil': [...],
  'elution': [...],
  'milling': [...],
  'gravity-circuit': [...],
  'crusher': [...],
  'flotation': [...]
};

const SECTION_EQUIPMENT: Record<string, Equipment[]> = {
  'cil': [...],
  'elution': [...],
  'milling': [...],
  'gravity-circuit': [...],
  'crusher': [...],
  'flotation': [...]
};
```

### Section Selection
- When user clicks a section from the dashboard, the `section` prop is passed to `ProcessParametersPanel`
- Component uses section key to look up appropriate parameters and equipment
- Defaults to 'cil' if no section specified

### Dynamic Updates
- Parameters and equipment update when section changes
- Historian data fetching adapts to current section's tags
- Each section fetches only its relevant data

## User Experience

### Navigation Flow
```
Dashboard
  ↓
Click Section (e.g., "Milling")
  ↓
Process Parameters Page
  ↓
Shows Milling-specific parameters and equipment
  ↓
Live data updates every 30 seconds
```

### Visual Indicators
- Page title shows: "Milling - Process Parameters"
- Parameter cards show section-specific measurements
- Equipment cards show section-specific equipment
- All data updates in real-time

## Backend Requirements

### Historian Tags
Backend must have historian tags configured for each section:

**CIL Tags (Existing):**
- FIX.CN_LEVEL_.F_CV
- FIX.D0.F_CV
- FIX.DENSITY.F_CV
- FIX.PERCENTAGE_SOLIDS.F_CV
- FIX.PH_LEVEL.F_CV
- FIX.CN_DOSING_PUMP.F_CV
- FIX.PSA3.F_CV
- FIX.RECOVERY_PUMP.F_CV
- FIX.RECOVERY_SCREEN.F_CV
- FIX.TANK1_AGITATOR.F_CV

**New Tags Required:**
- All ELUTION.* tags
- All MILLING.* tags
- All FLOTATION.* tags
- All GRAVITY.* tags
- All CRUSHER.* tags

### API Endpoints
Same endpoints, different tags:
- `GET /api/historian/data` - Analog data (parameters)
- `GET /api/historian/digital` - Digital data (equipment)

## Testing

### Test Each Section
1. Navigate to each section from dashboard
2. Verify correct parameters appear
3. Verify correct equipment appears
4. Check that data updates properly
5. Verify charts show correct data

### Test Section Switching
1. Click one section (e.g., Milling)
2. Verify Milling data appears
3. Click back to dashboard
4. Click different section (e.g., Elution)
5. Verify Elution data appears (not Milling)

### Test Default Behavior
1. Navigate directly to Process Parameters (no section)
2. Should show CIL data by default
3. Verify CIL parameters and equipment display

## Future Enhancements

1. **Section Comparison**: Compare parameters across sections
2. **Section Dashboard**: Overview of all sections on one page
3. **Cross-Section Alerts**: Alerts that span multiple sections
4. **Section Performance**: KPIs specific to each section
5. **Historical Section Data**: View past performance by section
6. **Section Reports**: Generate section-specific reports

## Troubleshooting

### Wrong Data Showing
- Check that section prop is being passed correctly
- Verify section key matches mapping keys exactly
- Check browser console for errors

### No Data for Section
- Verify historian tags exist for that section
- Check backend logs for missing tags
- Ensure tag naming matches exactly

### Data Not Updating on Section Change
- Check that useEffect dependencies include `sectionKey`
- Verify state is being reset properly
- Check that intervals are being cleared and restarted

## Related Files

- `src/components/mining/ProcessParametersPanel.tsx` - Main component
- `src/services/apiService.ts` - API functions
- `src/App.tsx` - Section navigation
- `LIVE_HISTORIAN_DATA_IMPLEMENTATION.md` - Historian integration docs
