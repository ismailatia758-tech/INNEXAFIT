import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Custom rule overrides for Next.js/React project patterns
  {
    rules: {
      // Allow any types - common in Next.js for API responses and props
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      // Allow setState in useEffect (common for socket connections and external data subscriptions)
      "react-hooks/set-state-in-effect": "off",
      // Allow non-null assertions
      "@typescript-eslint/no-non-null-assertion": "off",
      // Downgrade unused vars to warning
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Allow empty interfaces (common for component prop types)
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      // Allow require-await to be off
      "@typescript-eslint/require-await": "off",
      // Disable rules that conflict with Next.js patterns
      "react/display-name": "off",
      // Allow the common pattern of exhaustive deps
      "react-hooks/exhaustive-deps": "warn",
    },
  },
]);

export default eslintConfig;
