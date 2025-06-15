import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { fetchRewardsHistory } from '../features/rewardsHistory/rewardsHistorySlice';

const PostLoginHome = () => {
    const dispatch = useDispatch();
    const { history, currentPoints, loading, error } = useSelector((state) => state.rewardsHistory);

    // Calculate total earned and redeemed points from history for summary cards
    const totalEarnedPoints = history.filter(entry => entry.type === 'earn').reduce((sum, entry) => sum + entry.points, 0);
    const totalRedeemedPoints = history.filter(entry => entry.type === 'redeem').reduce((sum, entry) => sum + Math.abs(entry.points), 0);

    // Fetch rewards history data when the component mounts
    useEffect(() => {
        dispatch(fetchRewardsHistory());
    }, [dispatch]);

    // Data processing for Rewards History Charts (only Pie Chart data needed now)
    const typeDistribution = { earn: 0, redeem: 0 };

    history.forEach((entry) => {
        typeDistribution[entry.type] = (typeDistribution[entry.type] || 0) + Math.abs(entry.points);
    });

    const pieData = [
        { name: 'Earned', value: typeDistribution.earn },
        { name: 'Redeemed', value: typeDistribution.redeem },
    ];

    const COLORS_PIE_REWARDS = ['#4caf50', '#f44336']; // Earn: green, Redeem: red for rewards pie chart

    // Pagination for Rewards History Table
    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 5; // Number of history entries per page

    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentHistoryEntries = history.slice(indexOfFirstEntry, indexOfLastEntry);
    const totalPages = Math.ceil(history.length / entriesPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-header">Reward Points Dashboard</h1>
            <p className="dashboard-subtext">Overview of your LoopBack reward points and activities.</p>

            {/* Reward Points Summary Cards */}
            <div className="summary-cards">
                <div className="card earned-points-card">
                    <div className="card-icon">
                        <img src="/images/d.png" alt="Earned Points" />
                    </div>
                    <div className="card-content">
                        <h3>Total Earned</h3>
                        <p className="amount">{totalEarnedPoints} pts</p>
                    </div>
                </div>

                <div className="card redeemed-points-card">
                    <div className="card-icon">
                        <img src="/images/e.png" alt="Redeemed Points" />
                    </div>
                    <div className="card-content">
                        <h3>Total Redeemed</h3>
                        <p className="amount">{totalRedeemedPoints} pts</p>
                    </div>
                </div>

                <div className="card current-balance-card">
                    <div className="card-icon">
                        <img src="/images/g.svg" alt="Current Balance" />
                    </div>
                    <div className="card-content">
                        <h3>Current Balance</h3>
                        <p className="amount">{currentPoints} pts</p>
                    </div>
                </div>
            </div>

            {/* Rewards History Chart (only Pie Chart) and Rewards History Table */}
            <div className="charts-and-history-table">
                {/* Rewards History Chart (only Pie Chart) */}
                <div className="rewards-chart-section-single">
                    <h2 className="section-title">Points Distribution</h2>
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
                        <p className="no-data">No data available for points distribution.</p>
                    ) : (
                        <div className="chart-box-single">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_PIE_REWARDS[index]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Rewards History Table */}
                <div className="rewards-history-table-section">
                    <h2 className="section-title">Rewards History</h2>
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
                        <p className="no-data">No rewards history available.</p>
                    ) : (
                        <>
                            <div className="table-responsive"> {/* Added for horizontal scrolling on small screens */}
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Description</th>
                                            <th>Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentHistoryEntries.map((entry, index) => (
                                            <tr key={index}>
                                                <td>{new Date(entry.created_at).toLocaleString()}</td>
                                                <td>{entry.description}</td>
                                                <td className={`points ${entry.type === 'earn' ? 'positive' : 'negative'}`}>
                                                    {entry.points > 0 ? `+${entry.points}` : entry.points}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="pagination">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                    Prev
                                </button>
                                <span> Page {currentPage} of {totalPages} </span>
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style jsx>{`
                .dashboard-container {
                    min-height: 90vh;
                    padding: 3rem 2rem;
                    background: #f8fdfd;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .dashboard-header {
                    font-size: 2.8rem;
                    color: #1a202c;
                    text-align: center;
                    margin-bottom: 0.5rem;
                }

                .dashboard-subtext {
                    font-size: 1.1rem;
                    color: #4a5568;
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .summary-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 2rem;
                    margin-bottom: 3rem;
                }

                .card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
                }

                .card-icon {
                    margin-right: 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                }

                .card-icon img {
                    width: 35px;
                    height: 35px;
                }

                /* Specific card colors for rewards points */
                .earned-points-card .card-icon { background-color: #e6fffa; }
                .earned-points-card h3 { color: #2f855a; }
                .earned-points-card .amount { color: #2f855a; }

                .redeemed-points-card .card-icon { background-color: #feebc8; }
                .redeemed-points-card h3 { color: #dd6b20; }
                .redeemed-points-card .amount { color: #dd6b20; }

                .current-balance-card .card-icon { background-color: #ebf8ff; }
                .current-balance-card h3 { color: #3182ce; }
                .current-balance-card .amount { color: #3182ce; }

                .card-content h3 {
                    margin: 0 0 0.5rem;
                    font-size: 1.2rem;
                    font-weight: 600;
                }

                .card-content .amount {
                    font-size: 1.8rem;
                    font-weight: 700;
                }

                .charts-and-history-table {
                    display: flex;
                    flex-wrap: wrap; /* Allows items to wrap to the next line */
                    gap: 2rem;
                    justify-content: center; /* Center items when they wrap */
                    margin-bottom: 3rem; /* Add some space below this section */
                }

                /* Styling for Rewards Charts Section (now single chart) */
                .rewards-chart-section-single {
                    flex: 1; /* Allows the chart section to grow and shrink */
                    min-width: 300px; /* Adjusted minimum width to prevent chart from getting too small */
                    max-width: 500px; /* Optional: limit max width on very large screens */
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .rewards-chart-section-single .chart-box-single {
                    width: 100%;
                    max-width: 400px;
                    background-color: #f9f9f9;
                    border-radius: 10px;
                    padding: 10px;
                    box-shadow: 0 1px 6px rgba(0,0,0,0.05);
                }

                /* Styling for Rewards History Table Section */
                .rewards-history-table-section {
                    flex: 2; /* Allows the table section to take more space if available */
                    min-width: 320px; /* Adjusted minimum width for table readability */
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
                    overflow-x: auto; /* Enable horizontal scrolling for table on small screens */
                }

                .section-title {
                    font-size: 1.5rem;
                    color: #2d3748;
                    margin-bottom: 1.5rem;
                    text-align: center;
                }

                .table-responsive {
                    overflow-x: auto; /* Ensures table can scroll horizontally if content overflows */
                }

                .history-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1rem;
                    min-width: 500px; /* Ensures table columns don't shrink too much */
                }

                .history-table th,
                .history-table td {
                    text-align: left;
                    padding: 12px 15px;
                    border-bottom: 1px solid #edf2f7;
                }

                .history-table th {
                    background-color: #f7fafc;
                    color: #4a5568;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.9rem;
                }

                .history-table td {
                    color: #2d3748;
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

                .pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .pagination button {
                    background-color: #4299e1;
                    color: white;
                    border: none;
                    padding: 0.7rem 1.2rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: background-color 0.3s ease;
                }

                .pagination button:disabled {
                    background-color: #a0aec0;
                    cursor: not-allowed;
                }

                .pagination button:hover:not(:disabled) {
                    background-color: #3182ce;
                }

                .pagination span {
                    font-size: 1rem;
                    color: #4a5568;
                }

                .loading-spinner {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 150px;
                }

                .animate-spin {
                    animation: spin 1s linear infinite;
                    color: #4299e1;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .error, .no-data {
                    color: #e53e3e;
                    text-align: center;
                    margin-top: 1rem;
                    font-style: italic;
                }

                /* Media Queries for Responsiveness */

                /* Tablets and larger phones */
                @media (max-width: 1024px) {
                    .charts-and-history-table {
                        flex-direction: column; /* Stack chart and table vertically */
                        align-items: center; /* Center them when stacked */
                    }
                    .rewards-chart-section-single,
                    .rewards-history-table-section {
                        min-width: unset; /* Remove explicit min-width to allow full width */
                        width: 95%; /* Adjust width for better spacing on tablets */
                        max-width: 600px; /* Max width to keep content readable */
                    }
                    .summary-cards {
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Slightly smaller min-width for cards */
                    }
                }

                /* Smaller phones */
                @media (max-width: 768px) {
                    .dashboard-container {
                        padding: 2rem 1rem; /* Reduce padding on smaller screens */
                    }
                    .dashboard-header {
                        font-size: 2.2rem;
                    }
                    .dashboard-subtext {
                        font-size: 1rem;
                        margin-bottom: 2rem;
                    }
                    .summary-cards {
                        grid-template-columns: 1fr; /* Stack cards vertically on very small screens */
                        gap: 1.5rem;
                    }
                    .card {
                        flex-direction: column;
                        text-align: center;
                        padding: 1rem; /* Reduce card padding */
                    }
                    .card-icon {
                        margin-right: 0;
                        margin-bottom: 0.8rem;
                        width: 50px; /* Smaller icon size */
                        height: 50px;
                    }
                    .card-icon img {
                        width: 30px;
                        height: 30px;
                    }
                    .card-content h3 {
                        font-size: 1.1rem;
                    }
                    .card-content .amount {
                        font-size: 1.6rem;
                    }
                    .rewards-chart-section-single,
                    .rewards-history-table-section {
                        width: 95%; /* Keep full width for these sections */
                        padding: 1rem; /* Reduce padding for sections */
                    }
                    .section-title {
                        font-size: 1.3rem;
                        margin-bottom: 1rem;
                    }
                    .history-table th,
                    .history-table td {
                        padding: 8px 10px; /* Reduce table cell padding */
                        font-size: 0.85rem; /* Smaller font for table content */
                    }
                    .pagination {
                        flex-direction: column; /* Stack pagination buttons */
                        gap: 0.8rem;
                    }
                    .pagination button {
                        width: 80%; /* Make buttons wider */
                        padding: 0.6rem 1rem;
                    }
                }

                /* Very small screens (e.g., iPhone 5/SE) */
                @media (max-width: 480px) {
                    .dashboard-header {
                        font-size: 1.8rem;
                    }
                    .dashboard-subtext {
                        font-size: 0.9rem;
                    }
                    .summary-cards {
                        gap: 1rem;
                    }
                    .card-content .amount {
                        font-size: 1.4rem;
                    }
                    .history-table {
                        min-width: 400px; /* Ensure table is still scrollable if needed */
                    }
                }
            `}</style>
        </div>
    );
};

export default PostLoginHome;