import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import axios from 'axios';
import config from '../config';

const CHART_COLORS = [
  'var(--primary-color)',
  'var(--secondary-color)',
  'var(--accent-color)',
  '#8884d8',
  '#82ca9d'
];

const PredictionDistributionChart = ({ data }) => {
  const predictionCounts = data.reduce((acc, item) => {
    const key = item.prediction || 'no_activity';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(predictionCounts).map((key) => ({
    name: key,
    value: predictionCounts[key]
  }));

  if (chartData.length === 0) {
    chartData.push({ name: 'no_activity', value: 1 });
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
          label
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

const RealTimePrediction = ({ latestPrediction }) => {
  return (
    <div className="realtime-prediction-card">
      <h3>Real-Time Prediction</h3>
      <div className="realtime-prediction-value">
        {latestPrediction || 'no_activity'}
      </div>
    </div>
  );
};

const ActivityTimeline = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="duration" fill="var(--primary-color)" />
    </BarChart>
  </ResponsiveContainer>
);

const ConfidenceGauge = ({ confidence }) => {
  const gaugeData = [
    {
      name: 'Confidence',
      value: confidence * 100
    }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadialBarChart
        innerRadius="70%"
        outerRadius="100%"
        data={gaugeData}
        startAngle={180}
        endAngle={0}
      >
        <RadialBar
          minAngle={15}
          background
          clockWise
          dataKey="value"
          fill="var(--accent-color)"
        />
        <Tooltip />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};

const Home = () => {
  const [waterLevel, setWaterLevel] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [waterLevelData, setWaterLevelData] = useState([]);
  const [temperatureData, setTemperatureData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState('');
  const [hasDataForNode, setHasDataForNode] = useState(true);
  const [nodeDataMessage, setNodeDataMessage] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const [predictionData, setPredictionData] = useState([]);
  const [latestPrediction, setLatestPrediction] = useState('no_activity');
  const [latestConfidence, setLatestConfidence] = useState(1);

  const getActualTankId = (nodeId) => {
    const mapping = {
      demo_node: 'demo_node',
      NODE_001: 'NODE_001',
      NODE_002: 'NODE_002',
      'Node 1': 'NODE_001',
      'Node 2': 'NODE_002'
    };
    return mapping[nodeId] || nodeId;
  };

  const getTimeRangeParams = () => {
    const now = new Date();
    let fromDate;
    let toDate;

    switch (selectedTimeRange) {
      case '1h':
        fromDate = new Date(now.getTime() - 1 * 60 * 60 * 1000);
        toDate = now;
        break;
      case '6h':
        fromDate = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        toDate = now;
        break;
      case '24h':
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        toDate = now;
        break;
      case '7d':
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        toDate = now;
        break;
      case 'custom':
        if (customFromDate && customToDate) {
          fromDate = new Date(customFromDate);
          toDate = new Date(customToDate);
        } else {
          return null;
        }
        break;
      case 'all':
      default:
        return null;
    }

    return {
      from: fromDate.toISOString(),
      to: toDate.toISOString()
    };
  };

  const fetchNodes = async () => {
    try {
      const response = await axios.get(config.TANK_PARAMETERS_URL, {
        headers: {
          accept: 'application/json'
        }
      });

      
      console.log("FULL tank response:", response);
      console.log("tank response data:", response.data);
      console.log("is array?", Array.isArray(response.data));
      console.log('tank parameters response:', response.data);

      const rawData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      const transformedNodes = rawData.map((node, index) => ({
        id: node.node_id || node.id || `NODE_${index + 1}`,
        name: node.node_id || node.name || `NODE_${index + 1}`,
        tank_height: node.tank_height_cm || node.tank_height || 200,
        tank_length: node.tank_length_cm || node.tank_length || 100,
        tank_width: node.tank_width_cm || node.tank_width || 80,
        latitude: node.lat || node.latitude || 0,
        longitude: node.long || node.longitude || 0
      }));
      console.log("transformedNodes:",transformedNodes);
      setNodes(transformedNodes);

      if (transformedNodes.length > 1 && !selectedNode) {
          setSelectedNode(transformedNodes[1].id);
      } else if (transformedNodes.length > 0 && !selectedNode) {
      setSelectedNode(transformedNodes[0].id);
      }
    } catch (error) {
      console.error('Error fetching nodes:', error);

      const sampleNodes = [
        {
          id: 'demo_node',
          name: 'demo_node',
          tank_height: 200,
          tank_length: 100,
          tank_width: 80,
          latitude: 10.8505,
          longitude: 76.2711
        }
      ];

      setNodes(sampleNodes);
      setSelectedNode((prev) => prev || sampleNodes[0].id);
    }
  };

  const fetchSensorData = async () => {
    if (!selectedNode) return;

    try {
      setLoading(true);

      const actualNodeId = getActualTankId(selectedNode);
      const timeParams = getTimeRangeParams();

      const response = await axios.get(config.SENSOR_DATA_URL, {
        headers: {
          accept: 'application/json'
        }
      });
      console.log("FULL sensor response:", response);
      console.log("sensor data response:", response.data);
      console.log("selectedNode:", selectedNode);
      console.log("actualNodeId:", actualNodeId);
      console.log("is array?", Array.isArray(response.data));
      console.log('sensor data response:', response.data);

      const rawData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      let sensorData = rawData.filter(
        (item) =>
          item.node_id === actualNodeId ||
          item.tank_id === actualNodeId
      );

      if (timeParams) {
        sensorData = sensorData.filter((item) => {
          const createdAt = new Date(item.created_at);
          return (
            createdAt >= new Date(timeParams.from) &&
            createdAt <= new Date(timeParams.to)
          );
        });
      }

      sensorData.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );

      const latest20 = sensorData.slice(-20);

      if (latest20.length > 0) {
        setHasDataForNode(true);
        setNodeDataMessage('');

        const latest = latest20[latest20.length - 1];
        const selectedNodeData = nodes.find((n) => n.id === selectedNode);
        const tankHeight = selectedNodeData?.tank_height || 200;

        const waterLevelPercentage = Math.max(
          0,
          Math.min(
            100,
            Math.round(((tankHeight - latest.distance) / tankHeight) * 100)
          )
        );

        setWaterLevel(waterLevelPercentage);
        setTemperature(Math.round(latest.temperature * 10) / 10);
        setLastUpdated(new Date(latest.created_at));

        const waterData = latest20.map((item) => ({
          time: new Date(item.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          value: Math.max(
            0,
            Math.min(
              100,
              Math.round(((tankHeight - item.distance) / tankHeight) * 100)
            )
          ),
          raw_cm: item.distance
        }));

        const tempData = latest20.map((item) => ({
          time: new Date(item.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          value: Math.round(item.temperature * 10) / 10
        }));

        const derivedPredictionData = latest20.map((item, index) => {
          let prediction = 'no_activity';

          if (item.temperature >= 30) {
            prediction = 'shower';
          } else if (item.distance < 70) {
            prediction = 'faucet';
          } else if (item.distance < 85) {
            prediction = 'toilet';
          } else if (item.temperature >= 25) {
            prediction = 'dishwasher';
          }

          return {
            time: new Date(item.created_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            prediction,
            duration: index + 1,
            confidence: prediction === 'no_activity' ? 1.0 : 0.85
          };
        });

        setWaterLevelData(waterData);
        setTemperatureData(tempData);
        setPredictionData(derivedPredictionData);

        const latestPredictionItem =
          derivedPredictionData[derivedPredictionData.length - 1];
        setLatestPrediction(latestPredictionItem?.prediction || 'no_activity');
        setLatestConfidence(latestPredictionItem?.confidence || 1);
      } else {
        setHasDataForNode(false);
        setNodeDataMessage(`No sensor data found for ${selectedNode}`);
        setWaterLevel(0);
        setTemperature(0);
        setWaterLevelData([]);
        setTemperatureData([]);
        setPredictionData([]);
        setLatestPrediction('no_activity');
        setLatestConfidence(1);
        setLastUpdated(null);
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setHasDataForNode(false);
      setNodeDataMessage('Error fetching sensor data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNodeChange = (event) => {
  const nodeId = event.target.value;
  console.log("dropdown selected value:", nodeId);

  setSelectedNode(nodeId);
  setNodeDataMessage('');

  if (nodeId) {
    setLoading(true);
    const actualTankId = getActualTankId(nodeId);
    setNodeDataMessage(`Checking data for ${nodeId} (tank_id: ${actualTankId})...`);
  }
};

  const handleTimeRangeChange = (event) => {
    const timeRange = event.target.value;
    setSelectedTimeRange(timeRange);

    if (timeRange !== 'custom') {
      setCustomFromDate('');
      setCustomToDate('');
    }
  };

  const handleCustomFromDateChange = (event) => {
    setCustomFromDate(event.target.value);
  };

  const handleCustomToDateChange = (event) => {
    setCustomToDate(event.target.value);
  };

  useEffect(() => {
  fetchNodes();
  fetchSensorData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

useEffect(() => {
  if (selectedNode) {
    fetchSensorData();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedNode]);

useEffect(() => {
  if (selectedTimeRange && selectedNode) {
    fetchSensorData();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedTimeRange]);

useEffect(() => {
  if (selectedTimeRange === 'custom' && customFromDate && customToDate && selectedNode) {
    fetchSensorData();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [customFromDate, customToDate]);

  return (
    <div className="home-page">
      <div className="page-header">
        <div className="header-left">
          <h2 className="page-title">Dashboard Overview</h2>

          <div className="node-selector">
            <label htmlFor="node-select" className="node-label">Tank:</label>
            <select
              id="node-select"
              value={selectedNode}
              onChange={handleNodeChange}
              className="node-dropdown"
            >
              <option value="">Select Tank/Node</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.id}
                  {node.tank_height > 0 && ` (${node.tank_height}cm tank)`}
                </option>
              ))}
            </select>
          </div>

          <div className="time-range-selector">
            <label htmlFor="time-range-select" className="time-range-label">Time Range:</label>
            <select
              id="time-range-select"
              value={selectedTimeRange}
              onChange={handleTimeRangeChange}
              className="time-range-dropdown"
            >
              <option value="all">All Time</option>
              <option value="1h">Last 1 Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {selectedTimeRange === 'custom' && (
            <div className="custom-date-range">
              <div className="date-input-group">
                <label htmlFor="from-date" className="date-label">From:</label>
                <input
                  id="from-date"
                  type="datetime-local"
                  value={customFromDate}
                  onChange={handleCustomFromDateChange}
                  className="date-input"
                />
              </div>
              <div className="date-input-group">
                <label htmlFor="to-date" className="date-label">To:</label>
                <input
                  id="to-date"
                  type="datetime-local"
                  value={customToDate}
                  onChange={handleCustomToDateChange}
                  className="date-input"
                />
              </div>
            </div>
          )}
        </div>

        {lastUpdated && (
          <div className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
            {loading && <span className="update-indicator"> • Updating...</span>}
          </div>
        )}
      </div>

      {nodeDataMessage && (
        <div className={`data-status-message ${hasDataForNode ? 'success' : 'warning'}`}>
          <div className="status-icon">
            {hasDataForNode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
          </div>
          <span>{nodeDataMessage}</span>
        </div>
      )}

      {selectedNode && hasDataForNode && (
        <div className="selected-node-info">
          <strong>Showing data for node:</strong> {selectedNode}
          {getActualTankId(selectedNode) !== selectedNode && (
            <span className="tank-mapping"> → tank_id: {getActualTankId(selectedNode)}</span>
          )}
          <span className="time-range-info">
            {' '}• Time Range: {
              selectedTimeRange === '1h' ? 'Last 1 Hour' :
              selectedTimeRange === '6h' ? 'Last 6 Hours' :
              selectedTimeRange === '24h' ? 'Last 24 Hours' :
              selectedTimeRange === '7d' ? 'Last 7 Days' :
              selectedTimeRange === 'all' ? 'All Time' :
              selectedTimeRange === 'custom' ? 'Custom Range' :
              'All Time'
            }
          </span>
          {nodes.find((n) => n.id === selectedNode)?.tank_height && (
            <span className="tank-specs">
              {' '}• Tank: {nodes.find((n) => n.id === selectedNode)?.tank_height}cm (H) × {nodes.find((n) => n.id === selectedNode)?.tank_length}cm (L) × {nodes.find((n) => n.id === selectedNode)?.tank_width}cm (W)
            </span>
          )}
        </div>
      )}

      <div className="cards-container">
        <div className="card water-level-card">
          <div className="card-header">
            <div className="card-icon water-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
              </svg>
            </div>
            <h3>Water Level</h3>
          </div>
          <div className="card-value">
            <span className="value">
              {loading ? '--' : (!hasDataForNode ? 'N/A' : waterLevel)}
            </span>
            <span className="unit">%</span>
          </div>
          <div className="card-status">
            <span className={`status ${!hasDataForNode ? 'no-data' : waterLevel > 50 ? 'good' : 'warning'}`}>
              {!hasDataForNode ? 'No Data' :
                waterLevel > 80 ? 'High' :
                waterLevel > 50 ? 'Normal' :
                waterLevel > 20 ? 'Low' :
                'Critical'}
            </span>
          </div>
        </div>

        <div className="card temperature-card">
          <div className="card-header">
            <div className="card-icon temp-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 4v10.54a4 4 0 11-4 0V4a2 2 0 114 0z" />
              </svg>
            </div>
            <h3>Temperature</h3>
          </div>
          <div className="card-value">
            <span className="value">
              {loading ? '--' : (!hasDataForNode ? 'N/A' : temperature)}
            </span>
            <span className="unit">°C</span>
          </div>
          <div className="card-status">
            <span className={`status ${!hasDataForNode ? 'no-data' : temperature < 30 ? 'good' : 'warning'}`}>
              {!hasDataForNode ? 'No Data' :
                temperature < 25 ? 'Normal' :
                temperature < 30 ? 'Warm' :
                'Hot'}
            </span>
          </div>
        </div>
      </div>

      <div className="graphs-container">
        <div className="graph-card">
          <h3>Water Level</h3>
          {loading && waterLevelData.length === 0 ? (
            <div className="graph-loading">Loading sensor data...</div>
          ) : !hasDataForNode ? (
            <div className="no-data-graph">
              <div className="no-data-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <p>No data available for the selected node</p>
              <small>Please select a node with available sensor data</small>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={waterLevelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  labelFormatter={(value) => `Time: ${value}`}
                  formatter={(value, name, props) => [
                    `${value}% (${props.payload.raw_cm}cm)`,
                    'Water Level'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2196F3"
                  strokeWidth={3}
                  dot={{ fill: '#2196F3', strokeWidth: 2, r: 4 }}
                  animationDuration={500}
                  animationBegin={0}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="graph-card">
          <h3>Temperature</h3>
          {loading && temperatureData.length === 0 ? (
            <div className="graph-loading">Loading sensor data...</div>
          ) : !hasDataForNode ? (
            <div className="no-data-graph">
              <div className="no-data-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <p>No data available for the selected node</p>
              <small>Please select a node with available sensor data</small>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => `Time: ${value}`}
                  formatter={(value) => [`${value}°C`, 'Temperature']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#FF9800"
                  strokeWidth={3}
                  dot={{ fill: '#FF9800', strokeWidth: 2, r: 4 }}
                  animationDuration={500}
                  animationBegin={0}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="graphs-container">
        <div className="graph-card">
          <RealTimePrediction latestPrediction={latestPrediction} />
        </div>

        <div className="graph-card">
          <h3>Prediction Distribution</h3>
          <PredictionDistributionChart data={predictionData} />
        </div>

        <div className="graph-card">
          <h3>Activity Timeline</h3>
          <ActivityTimeline data={predictionData} />
        </div>

        <div className="graph-card">
          <h3>Confidence Gauge</h3>
          <ConfidenceGauge confidence={latestConfidence} />
        </div>
      </div>
    </div>
  );
};

export default Home;
