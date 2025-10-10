import React from 'react';
import { Box } from '@chakra-ui/react';

const mathExpressions = [
  "∫ f(x) dx", "∑ x_i", "lim x→∞", "d/dx", "∇ · F",
  "P(A|B)", "μ = Σx/n", "σ² = Σ(x-μ)²/n", "e^(iπ) + 1 = 0",
  "F = G(m₁m₂)/r²", "E = mc²", "∛x", "log₂ n", "sin²θ + cos²θ = 1",
  "R = n/N", "S = w₁x₁ + w₂x₂", "T = k·log W", "H = -∑ p(x)log p(x)"
];

export const MathBackground: React.FC = () => {
  return (
    <Box 
      position="absolute" 
      top="0" 
      left="0" 
      right="0" 
      bottom="0" 
      zIndex="1"
      opacity="0.15"
      bgGradient="linear(to-br, blue.50, purple.50)"
      overflow="hidden"
    >
      <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {[...Array(25)].map((_, i) => (
          <g key={i} opacity="0.5">
            <circle
              cx={Math.random() * 100 + '%'}
              cy={Math.random() * 100 + '%'}
              r="1"
              fill="blue.400"
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
                values="0;0.7;0.3;0.5;0"
                dur={`${Math.random() * 10 + 5}s`}
                repeatCount="indefinite"
              />
            </circle>
            <text
              x={Math.random() * 100 + '%'}
              y={Math.random() * 100 + '%'}
              fill="#4299E1"
              fontSize="14"
              fontFamily="monospace"
              filter="url(#glow)"
            >
              {mathExpressions[Math.floor(Math.random() * mathExpressions.length)]}
              <animate
                attributeName="opacity"
                values="0;0.5;0;0.4;0"
                dur={`${Math.random() * 15 + 10}s`}
                repeatCount="indefinite"
              />
            </text>
          </g>
        ))}
      </svg>
    </Box>
  );
};

