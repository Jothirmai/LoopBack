import React from 'react';

// Removed: import { useSelector } from 'react-redux';
// Removed: import { Link } from 'react-router-dom';
// Removed: import { colors } from '../styles/theme';

// Define colors locally for self-containment
const colors = {
  primaryColor: '#4CAF50', // A nice green
  // secondaryBackgroundColor: '#2196F3', // Example, not used here, but kept for consistency
  // backgroundColor: '#f8f9fa',
  // textColor: '#333',
};


const containerStyle = {
  padding: '5vw 4vw',
  backgroundColor: '#f7f7f7',
  minHeight: '100vh',
};

const heroStyle = {
  textAlign: 'center',
  padding: '10vw 5vw',
  backgroundColor: '#e6f7ff',
  borderRadius: '1rem',
  margin: '2rem auto',
  maxWidth: '90%',
};

const headingStyle = {
  fontSize: 'clamp(2rem, 6vw, 2.8rem)',
  color: '#333',
  marginBottom: '1rem',
};

const subTextStyle = {
  fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
  color: '#555',
  maxWidth: '700px',
  margin: '0 auto 2rem',
};

const ctaButton = {
  display: 'inline-block',
  marginTop: '1.5rem',
  padding: '0.75rem 1.5rem',
  backgroundColor: colors.primaryColor,
  color: '#fff',
  borderRadius: '0.5rem',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '1rem',
  transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease', // Added transition
};

const subHeadingStyle = {
  fontSize: 'clamp(1.5rem, 5vw, 2rem)',
  color: '#333',
  marginBottom: '2rem',
  textAlign: 'center',
};

const infoSection = {
  textAlign: 'center',
  padding: '4rem 2rem',
  backgroundColor: '#f0f0f0',
  marginTop: '4rem',
};

const responsiveGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '2rem',
  width: '100%',
  maxWidth: '1000px',
  margin: '0 auto',
  padding: '0 1rem',
  boxSizing: 'border-box',
};

const infoBlock = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
  padding: '2rem',
  textAlign: 'center',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Added transition for animation
};

const howItWorksImage = {
  width: '100%',
  maxHeight: '150px',
  objectFit: 'cover',
  borderRadius: '4px',
  marginBottom: '1rem',
};

const stepTitle = {
  fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
  color: colors.primaryColor,
  marginBottom: '0.5rem',
};

const aboutSectionStyle = {
  padding: '4rem 2rem',
  maxWidth: '1000px',
  margin: '4rem auto',
  textAlign: 'left',
};

const paragraphStyle = {
  fontSize: '1.1rem',
  lineHeight: '1.6',
  color: '#444',
  marginBottom: '1rem',
};

const aboutCardStyle = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  padding: '1.5rem',
  textAlign: 'center',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Added transition for animation
};

const cardTitle = {
  fontSize: '1.4rem',
  color: colors.primaryColor,
  marginBottom: '0.75rem',
};

const cardText = {
  fontSize: '1rem',
  color: '#666',
};

const footerNote = {
  marginTop: '3rem',
  padding: '1.5rem',
  backgroundColor: '#e6f7ff',
  borderRadius: '8px',
  textAlign: 'center',
  fontStyle: 'italic',
  color: colors.primaryColor,
};

const reviewSectionStyle = {
  marginTop: '4rem',
  textAlign: 'center',
};

const Home = () => {
  // Mock isAuthenticated as true or false since Redux is removed for self-containment
  const isAuthenticated = false; // Set to true or false for demonstration purposes

  return (
    <div style={containerStyle}>
      {/* Global CSS for card hover animations */}
      <style>
        {`
          .card-hover-effect:hover {
            transform: translateY(-5px); /* Lifts the card slightly */
            box-shadow: 0 10px 20px rgba(0,0,0,0.15); /* Enhances shadow */
          }

          .cta-button-hover:hover {
            background-color: #388E3C; /* Darker green on hover */
            transform: translateY(-2px); /* Slight lift */
            box-shadow: 0 6px 12px rgba(0,0,0,0.2); /* More pronounced shadow */
          }
        `}
      </style>

      <header style={heroStyle}>
        <h1 style={headingStyle}>
          Make Recycling <span style={{ color: colors.primaryColor }}>Rewarding with LoopBack</span>
        </h1>
        <p style={subTextStyle}>
          Discover recycling centers, scan your efforts, and earn green rewards. Turn your eco-actions into impact!
        </p>
        <h3 style={{ color: colors.primaryColor }}>Clean the Planet. Fill Your Wallet</h3>
        {!isAuthenticated && (
          // Replaced Link with an anchor tag since react-router-dom is removed
          <a href="/login" style={ctaButton} className="cta-button-hover">Join Us</a>
        )}
      </header>

      <section style={infoSection}>
        <h2 style={subHeadingStyle}>How It Works</h2>
        <div style={responsiveGrid}>
          {howItWorks.map(({ title, text, image }) => (
            <div style={infoBlock} key={title} className="card-hover-effect"> {/* Apply animation class */}
              {image && <img src={image} alt={title} style={howItWorksImage} />}
              <h4 style={stepTitle}>{title}</h4>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={aboutSectionStyle}>
        <h2 style={subHeadingStyle}>About LoopBack</h2>
        <p style={paragraphStyle}>
          <strong>LoopBack</strong> is your gateway to responsible recycling. Earn rewards by scanning your drop-offs, finding the nearest recycling spots, and joining the sustainability movement.
        </p>
        <p style={paragraphStyle}>
          We believe in a cleaner planet. With tech-enabled features like QR code scanning and location-based tracking, we make sure your recycling journey is impactful and easy.
        </p>

        <h3 style={subHeadingStyle}>Core Features</h3>
        <div style={responsiveGrid}>
          {keyFeatures.map(({ title, text }) => (
            <div style={aboutCardStyle} key={title} className="card-hover-effect"> {/* Apply animation class */}
              <h4 style={cardTitle}>{title}</h4>
              <p style={cardText}>{text}</p>
            </div>
          ))}
        </div>

        <div style={footerNote}>
          Let’s close the loop. One scan, one reward, one cleaner future.
        </div>
      </section>

      <section style={reviewSectionStyle}>
        <h2 style={subHeadingStyle}>What Our Users Say</h2>
        <div style={responsiveGrid}>
          {reviews.map(({ name, text, rating }, index) => (
            <div key={index} style={aboutCardStyle} className="card-hover-effect"> {/* Apply animation class */}
              <p style={{ fontStyle: 'italic' }}>&quot;{text}&quot;</p>
              <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>- {name}</p>
              <p style={{ color: '#f5a623' }}>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

const howItWorks = [
  {
    title: 'Step 1: Drop Recyclables',
    text: 'Take your recyclable waste to the nearest certified center.',
    image: '/images/a.png', // Placeholder image
  },
  {
    title: 'Step 2: Scan Code',
    text: 'Scan the QR code available at the site to log your action.',
    image: '/images/b.png', // Placeholder image
  },
  {
    title: 'Step 3: Get Rewards',
    text: 'Earn points and redeem for eco-friendly products or discounts.',
    image: '/images/c.png', // Placeholder image
  },
];

const keyFeatures = [
  { title: 'Live Centre Map', text: 'Search real-time for open recycling spots around you.' },
  { title: 'QR Scan Logging', text: 'Log your recycling instantly by scanning on site.' },
  { title: 'Reward Vault', text: 'Unlock perks like coupons or merchandise for points.' },
  { title: 'Impact Insights', text: 'Visualize your contribution to the planet.' },
];

const reviews = [
  { name: 'Mary', text: 'LoopBack made recycling fun and rewarding! I love the instant feedback.', rating: 5 },
  { name: 'Alex', text: 'Easy to find centres and the QR scan is smooth. Great way to stay eco-conscious!', rating: 4 },
  { name: 'Daniel', text: 'My kids now remind me to recycle because they want to earn points!', rating: 5 },
];

export default Home;
