import {Link} from 'react-router-dom';

function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.brand}>
               <Link to="/">
                    <img src='./logoipsum-blackandwhite.svg' width="100" className="logo" />
              </Link>
          <p style={styles.copy}>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
        
        <div style={styles.links}>
          <a href="#privacy" style={styles.link}>Privacy Policy</a>
          <a href="#terms" style={styles.link}>Terms of Service</a>
          <a href="#contact" style={styles.link}>Contact</a>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#f0f0f2', // Matches your card/page background tone
    borderTop: '1px solid #e2e2e5',
    padding: '24px 16px',
    
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoText: {
    fontWeight: '800',
    letterSpacing: '0.5px',
    color: '#222',
    fontSize: '14px',
  },
  copy: {
    color: '#666',
    fontSize: '12px',
    margin: 0,
  },
  links: {
    display: 'flex',
    gap: '20px',
  },
  link: {
    color: '#555',
    fontSize: '13px',
    textDecoration: 'none',
    fontWeight: '500',
  },
};

export default Footer;