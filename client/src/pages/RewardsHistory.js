import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { fetchRewardsHistory } from '../features/rewardsHistory/rewardsHistorySlice';

const COLORS = ['#4caf50', '#f44336']; // Earn: green, Redeem: red

const RewardsHistory = () => {
  const dispatch = useDispatch();
  const { history, currentPoints, loading, error } = useSelector((state) => state.rewardsHistory);

  useEffect(() => {
    dispatch(fetchRewardsHistory());
  }, [dispatch]);

  const groupedData = {};
  const typeDistribution = { earn: 0, redeem: 0 };

  history.forEach((entry) => {
    const date = new Date(entry.created_at).toLocaleDateString();
    groupedData[date] = (groupedData[date] || 0) + entry.points;
    typeDistribution[entry.type] += Math.abs(entry.points);
  });

  const barData = Object.entries(groupedData).map(([date, total]) => ({
    date,
    points: total,
  }));

  const pieData = [
    { name: 'Earned', value: typeDistribution.earn },
    { name: 'Redeemed', value: typeDistribution.redeem },
  ];

  return (
    <div className="points-history-container">
      <div className="history-box">
        <h2 className="history-title">Points History</h2>
        <p className="balance">
          Current Balance: <span className="balance-value">{currentPoints} points</span>
        </p>

        {loading && (
          <div className="loading-spinner">
            <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="30" height="30">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
        )}

        {error && <p className="error">{error}</p>}

        {!loading && !error && history.length === 0 ? (
          <p className="no-history">No history available.</p>
        ) : (
          <>
            <div className="charts-row">
              <div className="chart-container">
                <h3 style={{ textAlign: 'center' }}>Net Points by Day</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="points">
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.points >= 0 ? '#4caf50' : '#f44336'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3 style={{ textAlign: 'center' }}>Points Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <ul className="history-list">
              {history.map((entry, index) => (
                <li key={index} className="history-item">
                  <span className="created-at">{new Date(entry.created_at).toLocaleString()}</span>
                  <span className="description">{entry.description}</span>
                  <span className={`points ${entry.type === 'earn' ? 'positive' : 'negative'}`}>
                    {entry.points > 0 ? `+${entry.points}` : entry.points}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* CSS */}
      <style>{`
        .points-history-container {
          font-family: Arial, sans-serif;
          background-color: #f0f8ff;
          padding: 20px;
          min-height: 100vh;
        }

        .history-box {
          background: #fff;
          max-width: 1100px;
          margin: 30px auto;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .history-title {
          font-size: 28px;
          font-weight: bold;
          color: #276749;
          text-align: center;
        }

        .balance {
          font-size: 20px;
          margin: 10px 0 20px;
          text-align: center;
        }

        .balance-value {
          color: rgb(185, 144, 54);
          font-weight: bold;
        }

        .charts-row {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 30px;
        }

        .chart-container {
          width: 48%;
          min-width: 300px;
          max-width: 500px;
          background-color: #f9f9f9;
          border-radius: 10px;
          padding: 10px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.05);
        }

        .error {
          color: red;
          text-align: center;
          margin-bottom: 10px;
        }

        .no-history {
          color: #555;
          text-align: center;
          font-style: italic;
        }

        .history-list {
          list-style: none;
          padding: 0;
        }

        .history-item {
          display: flex;
          flex-direction: column;
          background: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 10px;
        }

        @media (min-width: 600px) {
          .history-item {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .created-at {
          color: #666;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .description {
          flex: 1;
          font-weight: 500;
          margin-right: 10px;
        }

        .points {
          font-weight: bold;
          min-width: 70px;
          text-align: right;
        }

        .positive {
          color: green;
        }

        .negative {
          color: red;
        }
      `}</style>
    </div>
  );
};

export default RewardsHistory;
