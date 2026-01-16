import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import * as Switch from '@radix-ui/react-switch'
import * as Separator from '@radix-ui/react-separator'

// Translations for English and Argentine Spanish
const TRANSLATIONS = {
  en: {
    title: 'Refrigeration Case Controller',
    subtitle: 'Live Monitoring Dashboard',
    language: 'Language',
    pauseUpdates: 'Pause Updates',
    updatesEvery: 'Updates every 5s',
    caseTemperature: 'Case Temperature',
    suctionTemp: 'Suction Temp',
    dischargeTemp: 'Discharge Temp',
    evaporatorTemp: 'Evaporator Temp',
    txValvePosition: 'TX Valve Position',
    txValveSuperheat: 'TX Valve Superheat',
    analogSignals: 'Analog Signals - Time Series',
    digitalSignals: 'Digital Signals - System Status',
    yAxisLabel: 'Temperature (°F) / Position (%)',
    caseTempChart: 'Case Temp (°F)',
    suctionTempChart: 'Suction Temp (°F)',
    dischargeTempChart: 'Discharge Temp (°F)',
    evaporatorTempChart: 'Evaporator Temp (°F)',
    txValvePositionChart: 'TX Valve Position (%)',
    txSuperheatChart: 'TX Superheat (°F)',
    defrostMode: 'Defrost Mode',
    compressor: 'Compressor',
    evaporatorFan: 'Evaporator Fan',
    caseLight: 'Case Light',
    doorSwitch: 'Door Switch',
    alarmStatus: 'Alarm Status',
    on: 'ON',
    off: 'OFF',
    footer: 'Refrigeration Case Controller v1.0 | Simulated Data Stream',
  },
  es: {
    title: 'Controlador de Cámara Frigorífica',
    subtitle: 'Panel de Monitoreo en Vivo',
    language: 'Idioma',
    pauseUpdates: 'Pausar Actualizaciones',
    updatesEvery: 'Actualiza cada 5s',
    caseTemperature: 'Temperatura de Cámara',
    suctionTemp: 'Temp. de Succión',
    dischargeTemp: 'Temp. de Descarga',
    evaporatorTemp: 'Temp. de Evaporador',
    txValvePosition: 'Posición Válvula TX',
    txValveSuperheat: 'Sobrecalentamiento TX',
    analogSignals: 'Señales Analógicas - Series Temporales',
    digitalSignals: 'Señales Digitales - Estado del Sistema',
    yAxisLabel: 'Temperatura (°F) / Posición (%)',
    caseTempChart: 'Temp. Cámara (°F)',
    suctionTempChart: 'Temp. Succión (°F)',
    dischargeTempChart: 'Temp. Descarga (°F)',
    evaporatorTempChart: 'Temp. Evaporador (°F)',
    txValvePositionChart: 'Posición Válvula TX (%)',
    txSuperheatChart: 'Sobrecalentamiento TX (°F)',
    defrostMode: 'Modo Descongelación',
    compressor: 'Compresor',
    evaporatorFan: 'Ventilador Evaporador',
    caseLight: 'Luz de Cámara',
    doorSwitch: 'Interruptor Puerta',
    alarmStatus: 'Estado de Alarma',
    on: 'ENCENDIDO',
    off: 'APAGADO',
    footer: 'Controlador de Cámara Frigorífica v1.0 | Flujo de Datos Simulados',
  },
}

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
  const [language, setLanguage] = useState('en')

  const t = TRANSLATIONS[language]

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

  // Custom tooltip formatter to round values to 1 decimal place
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '8px',
          padding: '12px',
          color: '#f3f4f6'
        }}>
          <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '4px 0' }}>
              {entry.name}: {entry.value.toFixed(1)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

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
        <span className="indicator-status">{active ? t.on : t.off}</span>
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
          <h1>{t.title}</h1>
          <p className="subtitle">{t.subtitle}</p>
        </div>
        <div className="header-controls">
          <label className="language-control">
            <span>{t.language}:</span>
            <div className="language-buttons">
              <button
                className={`language-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                English
              </button>
              <button
                className={`language-btn ${language === 'es' ? 'active' : ''}`}
                onClick={() => setLanguage('es')}
              >
                Español
              </button>
            </div>
          </label>
          <label className="pause-control">
            <span>{t.pauseUpdates}</span>
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
            <span>{t.updatesEvery}</span>
          </div>
        </div>
      </header>

      <div className="metrics-grid">
        <MetricCard
          label={t.caseTemperature}
          value={currentValues.caseTemp}
          unit="°F"
          color="#3b82f6"
        />
        <MetricCard
          label={t.suctionTemp}
          value={currentValues.suctionTemp}
          unit="°F"
          color="#06b6d4"
        />
        <MetricCard
          label={t.dischargeTemp}
          value={currentValues.dischargeTemp}
          unit="°F"
          color="#ef4444"
        />
        <MetricCard
          label={t.evaporatorTemp}
          value={currentValues.evaporatorTemp}
          unit="°F"
          color="#8b5cf6"
        />
        <MetricCard
          label={t.txValvePosition}
          value={currentValues.txValvePosition}
          unit="%"
          color="#10b981"
        />
        <MetricCard
          label={t.txValveSuperheat}
          value={currentValues.txValveSuperheat}
          unit="°F"
          color="#f59e0b"
        />
      </div>

      <Separator.Root className="separator" />

      <div className="chart-section">
        <h2>{t.analogSignals}</h2>
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
              label={{ value: t.yAxisLabel, angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: '#f3f4f6' }}
            />
            <Line
              type="monotone"
              dataKey="caseTemp"
              stroke="#3b82f6"
              name={t.caseTempChart}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="suctionTemp"
              stroke="#06b6d4"
              name={t.suctionTempChart}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="dischargeTemp"
              stroke="#ef4444"
              name={t.dischargeTempChart}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="evaporatorTemp"
              stroke="#8b5cf6"
              name={t.evaporatorTempChart}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="txValvePosition"
              stroke="#10b981"
              name={t.txValvePositionChart}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="txValveSuperheat"
              stroke="#f59e0b"
              name={t.txSuperheatChart}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <Separator.Root className="separator" />

      <div className="binary-section">
        <h2>{t.digitalSignals}</h2>
        <div className="binary-grid">
          <BinaryIndicator
            label={t.defrostMode}
            active={binaryStates.defrostMode}
            color="orange"
          />
          <BinaryIndicator
            label={t.compressor}
            active={binaryStates.compressorRunning}
            color="green"
          />
          <BinaryIndicator
            label={t.evaporatorFan}
            active={binaryStates.evaporatorFan}
            color="blue"
          />
          <BinaryIndicator
            label={t.caseLight}
            active={binaryStates.caseLight}
            color="yellow"
          />
          <BinaryIndicator
            label={t.doorSwitch}
            active={binaryStates.doorSwitch}
            color="purple"
          />
          <BinaryIndicator
            label={t.alarmStatus}
            active={binaryStates.alarmStatus}
            color="red"
          />
        </div>
      </div>

      <footer className="dashboard-footer">
        <p>{t.footer}</p>
      </footer>
    </div>
  )
}

export default RefrigerationDashboard
