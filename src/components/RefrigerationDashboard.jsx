import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import * as Switch from '@radix-ui/react-switch'
import * as Separator from '@radix-ui/react-separator'

// Simulation parameters for realistic refrigeration data
const SIMULATION_CONFIG = {
  caseTemp: { baseline: 35, variance: 2, min: 32, max: 40 },
  suctionTemp: { baseline: 20, variance: 3, min: 15, max: 25 },
  dischargeTemp: { baseline: 140, variance: 5, min: 130, max: 155 },
  evaporatorTemp: { baseline: 28, variance: 2, min: 25, max: 35 },
  txValvePosition: { baseline: 45, variance: 10, min: 20, max: 70 },
  txValveSuperheat: { baseline: 8, variance: 2, min: 4, max: 15 },
}

// Generate realistic value with smooth transitions
const generateValue = (config, previousValue, inDefrost) => {
  if (inDefrost) {
    // During defrost, temperatures rise
    const defrostMultiplier = config.baseline < 50 ? 1.5 : 1.1
    return Math.min(
      config.max,
      previousValue + (Math.random() - 0.3) * config.variance * defrostMultiplier
    )
  }

  const target = config.baseline + (Math.random() - 0.5) * config.variance
  const change = (target - previousValue) * 0.3 + (Math.random() - 0.5) * config.variance * 0.5
  return Math.max(config.min, Math.min(config.max, previousValue + change))
}

const RefrigerationDashboard = () => {
  const [data, setData] = useState([])
  const [binaryStates, setBinaryStates] = useState({
    defrostMode: false,
    compressorRunning: true,
    evaporatorFan: true,
    caseLight: true,
    doorSwitch: false,
    alarmStatus: false,
  })
  const [currentValues, setCurrentValues] = useState({
    caseTemp: 35,
    suctionTemp: 20,
    dischargeTemp: 140,
    evaporatorTemp: 28,
    txValvePosition: 45,
    txValveSuperheat: 8,
  })
  const [isPaused, setIsPaused] = useState(false)

  // Initialize data with some history
  useEffect(() => {
    const initialData = []
    const now = Date.now()
    for (let i = 60; i > 0; i--) {
      const timestamp = new Date(now - i * 5000)
      initialData.push({
        time: timestamp.toLocaleTimeString(),
        timestamp: timestamp,
        caseTemp: 35 + (Math.random() - 0.5) * 2,
        suctionTemp: 20 + (Math.random() - 0.5) * 2,
        dischargeTemp: 140 + (Math.random() - 0.5) * 5,
        evaporatorTemp: 28 + (Math.random() - 0.5) * 2,
        txValvePosition: 45 + (Math.random() - 0.5) * 10,
        txValveSuperheat: 8 + (Math.random() - 0.5) * 2,
      })
    }
    setData(initialData)
  }, [])

  // Simulate data updates every 5 seconds
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      const now = new Date()

      // Randomly trigger defrost cycle (5% chance each update)
      const shouldStartDefrost = !binaryStates.defrostMode && Math.random() < 0.05
      const shouldEndDefrost = binaryStates.defrostMode && Math.random() < 0.3

      const newBinaryStates = {
        ...binaryStates,
        defrostMode: shouldStartDefrost ? true : (shouldEndDefrost ? false : binaryStates.defrostMode),
        compressorRunning: shouldStartDefrost ? false : (!binaryStates.defrostMode || shouldEndDefrost ? true : false),
        evaporatorFan: binaryStates.defrostMode ? false : true,
        doorSwitch: Math.random() < 0.1, // 10% chance door opens
        alarmStatus: currentValues.caseTemp > 38 || binaryStates.defrostMode,
      }

      // Generate new values
      const newValues = {
        caseTemp: generateValue(SIMULATION_CONFIG.caseTemp, currentValues.caseTemp, newBinaryStates.defrostMode),
        suctionTemp: generateValue(SIMULATION_CONFIG.suctionTemp, currentValues.suctionTemp, newBinaryStates.defrostMode),
        dischargeTemp: generateValue(SIMULATION_CONFIG.dischargeTemp, currentValues.dischargeTemp, newBinaryStates.defrostMode),
        evaporatorTemp: generateValue(SIMULATION_CONFIG.evaporatorTemp, currentValues.evaporatorTemp, newBinaryStates.defrostMode),
        txValvePosition: generateValue(SIMULATION_CONFIG.txValvePosition, currentValues.txValvePosition, newBinaryStates.defrostMode),
        txValveSuperheat: generateValue(SIMULATION_CONFIG.txValveSuperheat, currentValues.txValveSuperheat, newBinaryStates.defrostMode),
      }

      const newDataPoint = {
        time: now.toLocaleTimeString(),
        timestamp: now,
        ...newValues,
      }

      setData(prevData => {
        const updated = [...prevData, newDataPoint]
        // Keep last 60 data points (5 minutes of history)
        return updated.slice(-60)
      })

      setCurrentValues(newValues)
      setBinaryStates(newBinaryStates)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPaused, currentValues, binaryStates])

  const BinaryIndicator = ({ label, active, color = 'blue' }) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
    }

    return (
      <div className="binary-indicator">
        <div className={`indicator-light ${active ? colors[color] : 'bg-gray-400'} ${active ? 'active' : ''}`} />
        <span className="indicator-label">{label}</span>
        <span className="indicator-status">{active ? 'ON' : 'OFF'}</span>
      </div>
    )
  }

  const MetricCard = ({ label, value, unit, color }) => (
    <div className="metric-card" style={{ borderLeftColor: color }}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">
        {value.toFixed(1)}<span className="metric-unit">{unit}</span>
      </div>
    </div>
  )

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Refrigeration Case Controller</h1>
          <p className="subtitle">Live Monitoring Dashboard</p>
        </div>
        <div className="header-controls">
          <label className="pause-control">
            <span>Pause Updates</span>
            <Switch.Root
              className="switch-root"
              checked={isPaused}
              onCheckedChange={setIsPaused}
            >
              <Switch.Thumb className="switch-thumb" />
            </Switch.Root>
          </label>
          <div className="update-indicator">
            {!isPaused && <div className="pulse" />}
            <span>Updates every 5s</span>
          </div>
        </div>
      </header>

      <div className="metrics-grid">
        <MetricCard
          label="Case Temperature"
          value={currentValues.caseTemp}
          unit="°F"
          color="#3b82f6"
        />
        <MetricCard
          label="Suction Temp"
          value={currentValues.suctionTemp}
          unit="°F"
          color="#06b6d4"
        />
        <MetricCard
          label="Discharge Temp"
          value={currentValues.dischargeTemp}
          unit="°F"
          color="#ef4444"
        />
        <MetricCard
          label="Evaporator Temp"
          value={currentValues.evaporatorTemp}
          unit="°F"
          color="#8b5cf6"
        />
        <MetricCard
          label="TX Valve Position"
          value={currentValues.txValvePosition}
          unit="%"
          color="#10b981"
        />
        <MetricCard
          label="TX Valve Superheat"
          value={currentValues.txValveSuperheat}
          unit="°F"
          color="#f59e0b"
        />
      </div>

      <Separator.Root className="separator" />

      <div className="chart-section">
        <h2>Analog Signals - Time Series</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
              label={{ value: 'Temperature (°F) / Position (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f3f4f6'
              }}
            />
            <Legend
              wrapperStyle={{ color: '#f3f4f6' }}
            />
            <Line
              type="monotone"
              dataKey="caseTemp"
              stroke="#3b82f6"
              name="Case Temp (°F)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="suctionTemp"
              stroke="#06b6d4"
              name="Suction Temp (°F)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="dischargeTemp"
              stroke="#ef4444"
              name="Discharge Temp (°F)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="evaporatorTemp"
              stroke="#8b5cf6"
              name="Evaporator Temp (°F)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="txValvePosition"
              stroke="#10b981"
              name="TX Valve Position (%)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="txValveSuperheat"
              stroke="#f59e0b"
              name="TX Superheat (°F)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <Separator.Root className="separator" />

      <div className="binary-section">
        <h2>Digital Signals - System Status</h2>
        <div className="binary-grid">
          <BinaryIndicator
            label="Defrost Mode"
            active={binaryStates.defrostMode}
            color="orange"
          />
          <BinaryIndicator
            label="Compressor"
            active={binaryStates.compressorRunning}
            color="green"
          />
          <BinaryIndicator
            label="Evaporator Fan"
            active={binaryStates.evaporatorFan}
            color="blue"
          />
          <BinaryIndicator
            label="Case Light"
            active={binaryStates.caseLight}
            color="yellow"
          />
          <BinaryIndicator
            label="Door Switch"
            active={binaryStates.doorSwitch}
            color="purple"
          />
          <BinaryIndicator
            label="Alarm Status"
            active={binaryStates.alarmStatus}
            color="red"
          />
        </div>
      </div>

      <footer className="dashboard-footer">
        <p>Refrigeration Case Controller v1.0 | Simulated Data Stream</p>
      </footer>
    </div>
  )
}

export default RefrigerationDashboard
