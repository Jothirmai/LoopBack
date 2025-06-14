// src/pages/Auth/Register.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../features/auth/authSlice';
import { colors } from '../../styles/theme';
import InputField from '../../components/InputField';
import { Envelope, Lock } from 'react-bootstrap-icons';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    dispatch(registerUser({ email: formData.email, password: formData.password }))
      .unwrap()
      .then(() => {
        toast.success('Registered successfully! Please login.');
        navigate('/login');
      })
      .catch((err) => {
        // Optional: handle extra errors here
        console.error(err);
      });
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.left}>
          <h2 style={styles.logo}>LoopBack</h2>
          <p style={styles.subtitle}>A place where your responsibility lets you earn rewards.</p>
        </div>
        <div style={styles.right}>
          <h2 style={styles.heading}>Join Us Here</h2>
          <form onSubmit={handleSubmit}>
            <InputField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              icon={Envelope}
            />
            <InputField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              icon={Lock}
              showPasswordToggle
              togglePasswordVisibility={() => setShowPassword(!showPassword)}
            />
            <InputField
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              icon={Lock}
              showPasswordToggle
              togglePasswordVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
            />
            <button type="submit" style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? (
                <div style={styles.spinnerContainer}>
                  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                </div>
              ) : 'Register'}
            </button>
          </form>
          <p style={styles.footerText}>
            Already have an account? <Link to="/login" style={styles.link}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    maxWidth: '900px',
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
    flexWrap: 'wrap',
  },
  left: {
    flex: 1,
    backgroundColor: colors.primaryColor,
    color: 'white',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
    minWidth: '300px',
  },
  right: {
    flex: 1,
    padding: '2rem',
    minWidth: '300px',
  },
  logo: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: '1.125rem',
    marginTop: '1rem',
  },
  heading: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
    textAlign: 'center',
    color: colors.secondaryBackgroundColor,
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    fontSize: '1.125rem',
    fontWeight: 'bold',
    backgroundColor: colors.primaryColor,
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  footerText: {
    textAlign: 'center',
    marginTop: '1rem',
    color: colors.textColor,
  },
  link: {
    color: colors.primaryColor,
    textDecoration: 'none',
  },
  spinnerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
  },
};

export default Register;
