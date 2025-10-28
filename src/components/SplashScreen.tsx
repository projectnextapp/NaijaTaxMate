import React from "react";
// import logo from '../images/egwiapp.jpg';

export const SplashScreen: React.FC = () => {
  const currencies = ["₦", "$", "€", "£", "¥", "₵", "₨", "₺"];

  return (
    <div style={styles.container}>
      {/* Keyframe Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.9; }
          }

          @keyframes dropDown {
            0% {
              transform: translateY(-100px) rotate(0deg);
              opacity: 0;
            }
            30% {
              opacity: 1;
            }
            100% {
              transform: translateY(110vh) rotate(360deg);
              opacity: 0;
            }
          }
        `}
      </style>

      {/* Animated Currency Symbols */}
      <div style={styles.currencyContainer}>
        {Array.from({ length: 20 }).map((_, i) => {
          const symbol = currencies[Math.floor(Math.random() * currencies.length)];
          return (
            <span
              key={i}
              style={{
                ...styles.currencySymbol,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 3}s`,
                fontSize: `${16 + Math.random() * 20}px`,
                color:
                  Math.random() > 0.5 ? "rgba(10, 92, 54, 0.5)" : "rgba(0, 0, 0, 0.3)",
              }}
            >
              {symbol}
            </span>
          );
        })}
      </div>

      {/* Logo Section */}
      <div style={styles.logoContainer}>
        <div style={styles.logo}>
          {/* <img src={logo} alt="NaijaTaxMate Logo" style={styles.image} /> */}
          {/* <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect width="80" height="80" rx="16" fill="#0A5C36" />
            <path d="M25 30H35V50H25V30Z" fill="white" />
            <path d="M40 25H50V50H40V25Z" fill="white" />
            <path d="M55 35H65V50H55V35Z" fill="white" />
            <rect x="20" y="55" width="40" height="3" fill="white" />
          </svg> */}
        </div>
        <h1 style={styles.appName}>NaijaTaxMate</h1>
        <p style={styles.tagline}>Your Trusted Tax Companion</p>
        <p style={styles.tagline}>Developed by Egwi U. Kelvin</p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties | any> = {
  container: {
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(180deg, #F8F9FA 0%, #E9F7EF 100%)",
    fontFamily: "Poppins, sans-serif",
  },
  currencyContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    zIndex: 1,
  },
  currencySymbol: {
    position: "absolute",
    top: "-50px",
    animationName: "dropDown",
    animationTimingFunction: "ease-in",
    animationIterationCount: "infinite",
    fontWeight: 600,
  },
  logoContainer: {
    zIndex: 2,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    animation: "pulse 2s ease-in-out infinite",
  },
  logo: {
    marginBottom: "20px",
  },
  appName: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#0A5C36",
    marginBottom: "8px",
  },
  tagline: {
    fontSize: "14px",
    color: "#6C757D",
    margin: 0,
  },
};
