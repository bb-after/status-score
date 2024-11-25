import React from 'react';

const mathExpressions = [
  "∫ f(x) dx", "∑ x_i", "lim x→∞", "d/dx", "∇ · F",
  "P(A|B)", "μ = Σx/n", "σ² = Σ(x-μ)²/n", "e^(iπ) + 1 = 0",
  "F = G(m₁m₂)/r²", "E = mc²", "∛x", "log₂ n", "sin²θ + cos²θ = 1"
];

const MathBackground: React.FC = () => {
  return (
    <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {[...Array(15)].map((_, i) => (
        <g key={i} className="opacity-30">
          <circle
            cx={Math.random() * 100 + '%'}
            cy={Math.random() * 100 + '%'}
            r="1"
            fill="#fff"
            filter="url(#glow)"
          >
            <animate
              attributeName="r"
              values="0;3;1.5;2.5;0"
              dur={`${Math.random() * 10 + 5}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;1;0.5;0.7;0"
              dur={`${Math.random() * 10 + 5}s`}
              repeatCount="indefinite"
            />
          </circle>
          <text
            x={Math.random() * 100 + '%'}
            y={Math.random() * 100 + '%'}
            fill="#fff"
            fontSize="18"
            fontFamily="serif"
            filter="url(#glow)"
          >
            {mathExpressions[Math.floor(Math.random() * mathExpressions.length)]}
            <animate
              attributeName="opacity"
              values="0;0.5;0;0.7;0"
              dur={`${Math.random() * 10 + 5}s`}
              repeatCount="indefinite"
            />
          </text>
        </g>
      ))}
    </svg>
  );
};

export default MathBackground;

