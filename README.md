# Refrigeration Case Controller - Live Monitoring Dashboard

A real-time monitoring dashboard for refrigeration case controllers, built with React and Radix UI. This single-page application simulates live streaming data from a commercial refrigeration system, displaying both analog and digital sensor readings.

## Features

### Real-Time Data Visualization
- **5-second update interval** for all sensor readings
- **60-point time series history** (5 minutes of data retention)
- **Smooth animations** and transitions for realistic data simulation

### Analog Signals (Time Series Chart)
- **Case Temperature** - Interior temperature of the refrigerated case
- **Suction Temperature** - Compressor suction line temperature
- **Discharge Temperature** - Compressor discharge line temperature
- **Evaporator Temperature** - Evaporator coil temperature
- **TX Valve Position** - Thermostatic expansion valve position (%)
- **TX Valve Superheat** - Superheat measurement at the expansion valve

### Digital/Binary Signals (Status Indicators)
- **Defrost Mode** - Active defrost cycle indicator
- **Compressor Running** - Compressor operational status
- **Evaporator Fan** - Fan operational status
- **Case Light** - Interior lighting status
- **Door Switch** - Door open/closed state
- **Alarm Status** - System alarm indicator

## Technology Stack

- **React 18** - UI framework
- **Radix UI** - Accessible component primitives
- **Recharts** - Time series data visualization
- **Vite** - Build tool and dev server
- **Modern CSS** - Custom styling with CSS variables

## Development

### Prerequisites
- Node.js 16+ and npm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for Production
```bash
npm run build
```

### Deploy to GitHub Pages
```bash
./deploy.sh
```

This script will:
1. Build the production bundle
2. Copy built files to the root directory
3. Create `.nojekyll` file to disable Jekyll processing
4. Prepare files for GitHub Pages deployment

After running the deploy script:
```bash
git add .
git commit -m "Deploy refrigeration monitoring dashboard"
git push
```

## Simulation Details

### Realistic Behavior
- **Temperature variations** follow realistic refrigeration patterns
- **Defrost cycles** trigger randomly (5% chance every update)
- **Component states** respond to system conditions (e.g., compressor stops during defrost)
- **Alarm activation** when case temperature exceeds threshold

### Data Generation
- Smooth interpolation between values for realistic trending
- Configurable baseline values and variance ranges
- Different behavior during defrost vs. normal operation
- Automatic door open/close simulation

## UI Features

- **Pause/Resume** - Control data updates with a toggle switch
- **Responsive Design** - Adapts to mobile, tablet, and desktop screens
- **Dark Theme** - Optimized for extended monitoring sessions
- **Visual Indicators** - Glowing effects for active digital signals
- **Metric Cards** - Quick-view current values with color-coded borders

## Project Structure

```
├── src/
│   ├── components/
│   │   └── RefrigerationDashboard.jsx  # Main dashboard component
│   ├── App.jsx                          # Root application component
│   ├── main.jsx                         # Application entry point
│   └── styles.css                       # Global styles
├── dist/                                # Production build output
├── index.html                           # HTML entry point
├── vite.config.js                       # Vite configuration
├── package.json                         # Dependencies and scripts
└── deploy.sh                            # Deployment script
```

## Customization

### Adjust Update Interval
In `RefrigerationDashboard.jsx`, modify the interval duration:
```javascript
setInterval(() => {
  // Update logic
}, 5000)  // Change this value (in milliseconds)
```

### Modify Simulation Parameters
Edit the `SIMULATION_CONFIG` object in `RefrigerationDashboard.jsx`:
```javascript
const SIMULATION_CONFIG = {
  caseTemp: { baseline: 35, variance: 2, min: 32, max: 40 },
  // Add or modify parameters
}
```

### Theme Customization
Update CSS variables in `src/styles.css`:
```css
:root {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --accent-blue: #3b82f6;
  /* Modify colors */
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT

## Author

Built with Claude Code
