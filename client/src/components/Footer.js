import { colors } from '../styles/theme';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: colors.primaryColor, color: 'white', padding: '1rem 0.5rem' }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1rem',
      }}>
        <div style={{ flex: '1 1 250px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>LoopBack</h2>
          <p style={{ margin: 0 }}>Recycle responsibly. Earn rewards. Make a difference.</p>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Contact Us</h3>
          <p style={{ margin: '0.25rem 0' }}>Email: support@loopback.com</p>
          <p style={{ margin: '0.25rem 0' }}>Phone: +91-12345-67890</p>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: '1rem',
        fontSize: '0.8rem',
        borderTop: '1px solid rgba(255,255,255,0.3)',
        paddingTop: '0.75rem'
      }}>
        © {new Date().getFullYear()} LoopBack. All rights reserved.
      </div>
      <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8rem' }}>
        This website is still under development.
      </div>

      <style>
        {`
          @media (max-width: 768px) {
            footer div {
              text-align: center;
            }
            footer ul {
              padding-left: 0;
            }
          }
        `}
      </style>
    </footer>
  );
};

export default Footer;
