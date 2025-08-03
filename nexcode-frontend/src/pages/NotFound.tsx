import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

// Using a programmatic SVG for the astronaut to keep it self-contained
// Original SVG by 'Alpár-Etele Méder' on unDraw
const AstronautSVG = () => (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-48 h-48">
      {/* A simplified SVG to represent a floating figure */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path fill="#2F3640" d="M80 145c-15 0-25-10-25-25s10-25 25-25h40c15 0 25 10 25 25s-10 25-25 25z" />
      <circle cx="100" cy="80" r="30" fill="#EAEAEA" filter="url(#glow)"/>
      <rect x="95" y="70" width="10" height="20" fill="#2F3640" rx="5" />
      <path fill="#EAEAEA" d="M60 110 L50 150 L70 145 L80 115z" filter="url(#glow)"/>
      <path fill="#EAEAEA" d="M140 110 L150 150 L130 145 L120 115z" filter="url(#glow)"/>
    </svg>
);


// An inline SVG for a "Code Planet" to fit the theme
const CodeSphereSVG = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-64 h-64 opacity-60">
    <defs>
      <pattern id="binaryPattern" patternUnits="userSpaceOnUse" width="10" height="10">
        <text x="0" y="8" fontFamily="monospace" fontSize="0.5rem" fill="#00fff9">01</text>
        <text x="5" y="15" fontFamily="monospace" fontSize="0.5rem" fill="#EAEAEA">10</text>
      </pattern>
      <radialGradient id="sphereGradient">
        <stop offset="0%" stopColor="#ff00c1" stopOpacity="0.7"/>
        <stop offset="100%" stopColor="#00fff9" stopOpacity="0.7"/>
      </radialGradient>
      <mask id="sphereMask">
        <circle cx="50" cy="50" r="48" fill="white" />
      </mask>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#binaryPattern)" />
    <circle cx="50" cy="50" r="48" fill="url(#sphereGradient)" mask="url(#sphereMask)" opacity="0.5" />
  </svg>
);


const NotFound = () => {
  const location = useLocation();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 1. Log the error to the console
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // 2. Track mouse movement for the parallax effect
  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const parallax = (strength) => ({
    transform: `translate(${(mousePos.x / window.innerWidth - 0.5) * strength}px, ${(mousePos.y / window.innerHeight - 0.5) * strength}px)`,
  });

  return (
    <>
      <style>{`
        /* Using a darker, more digital-feeling gradient */
        .bg-digital-void {
            background-color: #0c0a18;
            background-image: radial-gradient(circle at 1px 1px, #3a3a5e 1px, transparent 0);
            background-size: 20px 20px;
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px); }
        }
        .astronaut-animation {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes glitch {
          2%, 64% { transform: translate(2px, 0) skew(0deg); }
          4%, 60% { transform: translate(-2px, 0) skew(0deg); }
          62% { transform: translate(0, 0) skew(5deg); }
        }
        .glitch-text::before, .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
        }
        .glitch-text::before {
          left: 2px;
          text-shadow: -2px 0 #ff00c1;
          clip-path: polygon(0 0, 100% 0, 100% 30%, 0 30%);
          animation: glitch 3s infinite linear alternate-reverse;
        }
        .glitch-text::after {
          left: -2px;
          text-shadow: -2px 0 #00fff9, 2px 2px #ff00c1;
          clip-path: polygon(0 70%, 100% 70%, 100% 100%, 0 100%);
          animation: glitch 2s infinite linear alternate-reverse;
        }
      `}</style>

      {/* Main Container */}
      <div className="min-h-screen bg-digital-void text-white font-mono flex flex-col items-center justify-center overflow-hidden relative">
        
        {/* Parallax-driven elements */}
        <div className="absolute inset-0 z-10">
            <div className="absolute bottom-1/4 left-1/4 astronaut-animation" style={parallax(30)}>
                <AstronautSVG />
            </div>
            <div className="absolute top-20 right-20" style={parallax(-20)}>
                <CodeSphereSVG />
            </div>
        </div>

        {/* Central Content */}
        <div className="text-center z-20">
          <div
            className="glitch-text font-black text-8xl md:text-9xl relative inline-block"
            data-text="404"
            style={parallax(50)}
          >
            404
          </div>
          <p className="text-xl md:text-2xl font-light mt-4 mb-6" style={parallax(25)}>
            Error: Segmentation Fault.
          </p>
          <a
            href="/"
            className="px-8 py-3 text-lg font-bold text-black bg-gradient-to-r from-[#00fff9] to-[#ff00c1] rounded-full hover:scale-105 transition-transform duration-300 ease-in-out shadow-lg shadow-cyan-500/50"
            style={parallax(15)}
          >
            Return to IDE
          </a>
        </div>
      </div>
    </>
  );
};

export default NotFound;