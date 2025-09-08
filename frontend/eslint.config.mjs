import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      boundaries,
      "unused-imports": unusedImports,
    },
  },
  {
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": [
        {
          type: "app",
          pattern: "app",
        },
        { type: "fsd-app", pattern: "fsd-app" },
        {
          type: "fsd-pages",
          pattern: "fsd-pages/*",
          capture: ["page"],
        },
        {
          type: "widgets",
          pattern: "widgets/*",
          capture: ["widget"],
        },
        {
          type: "features",
          pattern: "features/*",
          capture: ["feature"],
        },
        {
          type: "entities",
          pattern: "entities/*",
          capture: ["entity"],
        },
        {
          type: "shared",
          pattern: "shared/*",
          capture: ["segment"],
        },
      ],
    },
  },
  {
    rules: {
      "boundaries/entry-point": [
        2,
        {
          default: "disallow",
          rules: [
            {
              target: [["shared"]],
              allow: "**/*.(tsx|ts)",
            },
            {
              target: [
                "app",
                "fsd-app",
                "fsd-pages",
                "widgets",
                "features",
                "entities",
              ],
              allow: "index.(ts|tsx)",
            },
          ],
        },
      ],
      "boundaries/element-types": [
        2,
        {
          default: "allow",
          message: "${file.type} is not allowed to import (${dependency.type})",
          rules: [
            {
              from: ["shared"],
              disallow: [
                "app",
                "fsd-app",
                "fsd-pages",
                "widgets",
                "features",
                "entities",
              ],
              message:
                "Shared module must not import upper layers (${dependency.type})",
            },
            {
              from: ["entities"],
              message:
                "Entity must not import upper layers (${dependency.type})",
              disallow: ["app", "fsd-app", "fsd-pages", "widgets", "features"],
            },
            {
              from: ["entities"],
              message: "Entity must not import other entity",
              disallow: [
                [
                  "entities",
                  {
                    entity: "!${entity}",
                  },
                ],
              ],
            },
            {
              from: ["features"],
              message:
                "Feature must not import upper layers (${dependency.type})",
              disallow: ["app", "fsd-app", "fsd-pages", "widgets"],
            },
            {
              from: ["features"],
              message: "Feature must not import other feature",
              disallow: [
                [
                  "features",
                  {
                    feature: "!${feature}",
                  },
                ],
              ],
            },
            {
              from: ["widgets"],
              message:
                "Feature must not import upper layers (${dependency.type})",
              disallow: ["app", "fsd-app", "fsd-pages"],
            },
            {
              from: ["widgets"],
              message: "Widget must not import other widget",
              disallow: [
                [
                  "widgets",
                  {
                    widget: "!${widget}",
                  },
                ],
              ],
            },
            {
              from: ["fsd-pages"],
              message: "Page must not import upper layers (${dependency.type})",
              disallow: ["app", "fsd-app"],
            },
            {
              from: ["fsd-pages"],
              message: "Page must not import other page",
              disallow: [
                [
                  "fsd-pages",
                  {
                    page: "!${page}",
                  },
                ],
              ],
            },
          ],
        },
      ],
      "react/display-name": "off",
      "max-len": ["error", 120],
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        {
          accessibility: "explicit",
          overrides: {
            accessors: "explicit",
            constructors: "no-public",
            methods: "explicit",
            properties: "off",
            parameterProperties: "explicit",
          },
        },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "import/no-duplicates": "warn",
      "padding-line-between-statements": [
        "error",
        {
          blankLine: "always",
          prev: "*",
          next: ["if", "for", "while", "switch", "try", "do"],
        },
        {
          blankLine: "always",
          prev: ["if", "for", "while", "switch", "try", "do"],
          next: "*",
        },
        { blankLine: "always", prev: "*", next: "return" },
      ],
      "no-console": "error",
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
