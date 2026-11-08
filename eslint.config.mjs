import next from "eslint-config-next";

const eslintConfig = [
  ...next,
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "@next/next/no-img-element": "warn",
      "import/no-anonymous-default-export": "off",
    },
  },
];

export default eslintConfig;
