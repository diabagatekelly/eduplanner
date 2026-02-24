import nextConfig from 'eslint-config-next'
import prettier from 'eslint-config-prettier'

const config = [
  // Ignore generated and dependency directories
  {
    ignores: ['coverage/**', '.next/**', 'node_modules/**'],
  },

  // Next.js flat config (includes react, react-hooks, @next/next rules)
  ...nextConfig,

  // Disable ESLint rules that conflict with Prettier formatting
  prettier,

  // Project-level overrides
  // NOTE: react-hooks/set-state-in-effect demoted to warn for Layer 0.
  // These are real anti-patterns being fixed in Layer 6 (component architecture).
  // Upgrade back to 'error' once Layer 6 is complete.
  {
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]

export default config
