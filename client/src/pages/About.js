// src/pages/PostLoginHome.js
import { Link } from 'react-router-dom';

const PostLoginHome = () => {
  return (
    <div className="post-login">
      <h1 className="dashboard-title">Welcome Back to <span className="brand">LoopBack</span></h1>
      <p className="sub-text">Choose what you’d like to do today:</p>

      <div className="dashboard-grid">
        <Link to="/locator" className="dashboard-card">
          <img src="/images/e.svg" alt="Locator" />
          <h3>Find Recycling Centres</h3>
        </Link>
        <Link to="/scan" className="dashboard-card">
          <img src="/images/h.svg" alt="Scan" />
          <h3>Scan and Earn</h3>
        </Link>
        <Link to="/rewards" className="dashboard-card">
          <img src="/images/g.svg" alt="Rewards" />
          <h3>Redeem Rewards</h3>
        </Link>
        <Link to="/rewards-history" className="dashboard-card">
          <img src="/images/d.svg" alt="History" />
          <h3>Rewards History</h3>
        </Link>
      </div>

      <style jsx>{`
        .post-login {
          min-height: 90vh;
          padding: 3rem 2rem 5rem;
          text-align: center;
          background: #f8fdfd;
          animation: fadeIn 0.8s ease;
        }

        .dashboard-title {
          font-size: 2.5rem;
          color: #2c7a7b;
        }

        .brand {
          color: #38a169;
        }

        .sub-text {
          margin: 0.5rem 0 2rem;
          font-size: 1.1rem;
          color: #444;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .dashboard-card {
          padding: 1.5rem;
          background: #e6fffa;
          border-radius: 10px;
          text-decoration: none;
          color: #2c7a7b;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.07);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
        }

        .dashboard-card img {
          width: 60px;
          margin-bottom: 1rem;
          animation: popIn 0.6s ease-out;
        }

        .dashboard-card h3 {
          margin-top: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default PostLoginHome;
