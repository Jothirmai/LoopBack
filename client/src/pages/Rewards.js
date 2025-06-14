import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRewards,
  redeemReward,
  clearRewardsMessage,
  clearRewardsError,
} from '../features/rewards/rewardsSlice';
import { fetchUserPoints } from '../features/rewardsHistory/rewardsHistorySlice';
import toast from 'react-hot-toast';

const Rewards = () => {
  const dispatch = useDispatch();
  const { rewards, loading: rewardsLoading, error, message } = useSelector((state) => state.rewards);
  const { user } = useSelector((state) => state.auth); // Authenticated user
  const { currentPoints, loading: pointsLoading } = useSelector((state) => state.rewardsHistory);

  const loading = rewardsLoading || pointsLoading;

  // Fetch rewards and user points on mount
  useEffect(() => {
    dispatch(fetchRewards());
    dispatch(fetchUserPoints());
  }, [dispatch]);

  // Show toast on reward success
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearRewardsMessage());
      dispatch(fetchUserPoints()); // Refresh points after redeem
    }
  }, [message, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearRewardsError());
    }
  }, [error, dispatch]);

  const handleRedeem = (rewardId, cost) => {
    if (user?.points < cost) {
      toast.error("Not enough points to redeem this reward.");
      return;
    }
    dispatch(redeemReward(rewardId));
  };

  return (
    <div className="rewards-page">
      <h1 className="home-h1">Available Rewards</h1>

      {loading ? (
        <div className="loading-spinner">
          <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="30" height="30">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      ) : (
        <>
          <p className="points-display">
            🎯 Your Points: <strong>{currentPoints ?? 0}</strong>
          </p>

          {rewards.length === 0 ? (
            <p className="no-rewards">No rewards available at the moment.</p>
          ) : (
            <div className="rewards-grid">
              {rewards.map((reward) => {
                const canRedeem = currentPoints >= reward.cost;
                return (
                  <div key={reward.id} className="reward-card">
                    <div className="reward-svg-image">
                      <img src="/images/f.svg" alt="Reward Icon" />
                    </div>
                    <h3>{reward.name}</h3>
                    <p>Cost: {reward.cost} points</p>
                    <button
                      onClick={() => handleRedeem(reward.id, reward.cost)}
                      disabled={!canRedeem}
                      style={{
                        backgroundColor: canRedeem ? '#4CAF50' : '#ccc',
                        cursor: canRedeem ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {canRedeem ? 'Redeem' : 'Insufficient Points'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .rewards-page {
          padding: 30px 20px 80px;
          min-height: 80vh;
          font-family: Arial, sans-serif;
          background-color: #fff;
        }

        .home-h1 {
          text-align: center;
          color: #2c7a7b;
          margin-bottom: 10px;
        }

        .points-display {
          text-align: center;
          font-size: 1.1rem;
          color: #333;
          margin-bottom: 25px;
        }

        .loading-spinner {
          display: flex;
          justify-content: center;
          margin-top: 40px;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .no-rewards {
          text-align: center;
          color: #555;
        }

        .rewards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 25px;
          padding: 20px 10px;
        }

        .reward-card {
          padding: 20px;
          border-radius: 12px;
          background: #f0f8ff;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .reward-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }

        .reward-card h3 {
          color: #2c7a7b;
          margin: 10px 0;
        }

        .reward-card p {
          color: #555;
          margin: 0;
        }

        .reward-card button {
          margin-top: 15px;
          padding: 10px 15px;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 1rem;
          transition: background-color 0.3s ease;
        }

        .reward-card button:hover {
          background-color: #388e3c;
        }

        .reward-card button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .reward-svg-image {
          margin: 0 auto 12px;
          width: 60px;
          height: 60px;
          animation: popIn 0.6s ease-out;
        }

        .reward-svg-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 600px) {
          .rewards-page {
            padding: 20px 10px 100px;
          }
        }
      `}</style>
    </div>
  );
};

export default Rewards;
