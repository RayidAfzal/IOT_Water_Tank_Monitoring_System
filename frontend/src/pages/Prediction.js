import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import config from '../config';

const COLORS = ['#7c3aed', '#06b6d4'];

const Prediction = () => {
  const [modelInfo, setModelInfo] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [inputData, setInputData] = useState({
    distance: '',
    temperature: ''
  });

  useEffect(() => {
    // Fetch model info
    axios.get(`${config.API_BASE_URL}/api/v1/model-info`)
      .then(response => setModelInfo(response.data))
      .catch(error => console.error('Error fetching model info:', error));
  }, []);

  const handlePredict = async () => {
    try {
      const response = await axios.post(`${config.API_BASE_URL}/api/v1/predict`, {
        distance: parseFloat(inputData.distance),
        temperature: parseFloat(inputData.temperature)
      });
      setPrediction(response.data);
    } catch (error) {
      console.error('Error fetching prediction:', error);
    }
  };

  const chartData = prediction ? [
    { name: 'Confidence', value: prediction.confidence },
    { name: 'Remaining', value: 1 - prediction.confidence }
  ] : [];

  return (
    <div className="prediction-page">
      <h1>Water Activity Prediction</h1>
      
      {/* Model Info Card */}
      <div className="model-info-card">
        <h2>Model Information</h2>
        {modelInfo && (
          <>
            <p>Model Type: {modelInfo.model_type}</p>
            <p>Accuracy: {(modelInfo.accuracy * 100).toFixed(2)}%</p>
            <p>Version: {modelInfo.version}</p>
            <p>Last Trained: {modelInfo.last_trained}</p>
          </>
        )}
      </div>

      {/* Input Form */}
      <div className="prediction-form">
        <h2>Enter Sensor Data</h2>

        <input
          type="number"
          placeholder="Distance"
          value={inputData.distance}
          onChange={(e) => setInputData({ ...inputData, distance: e.target.value })}
        />

        <input
          type="number"
          placeholder="Temperature"
          value={inputData.temperature}
          onChange={(e) => setInputData({ ...inputData, temperature: e.target.value })}
        />

        <button onClick={handlePredict}>Predict</button>
      </div>

      {/* Prediction Results */}
      <div className="prediction-results">
        <h2>Prediction Results</h2>

        {prediction && (
          <>
            <p>Predicted Activity: {prediction.prediction}</p>
            <p>Confidence: {(prediction.confidence * 100).toFixed(2)}%</p>

            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Prediction;