// Cấu hình lint tối thiểu (M6b): @eslint/js + typescript-eslint (không type-checked) + react-hooks.
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      'public/pyodide/',
      'src/generated/',
      'node_modules/',
      '.superpowers/',
      '.worktrees/',
      '.venv/',
      'ref/',
      'test-results/',
      'playwright-report/',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      // Cách bỏ khóa khỏi object: `const { a, ...rest } = obj` (dùng trong test migration).
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    // Mọi luật react-hooks (cả luật "warn" mặc định, như exhaustive-deps) đều là lỗi, để CI không bỏ sót.
    // Chỉ đổi mức độ, giữ nguyên tùy chọn của luật (nếu có).
    rules: Object.fromEntries(
      Object.entries(reactHooks.configs.flat.recommended.rules).map(([name, entry]) => [
        name,
        Array.isArray(entry) ? ['error', ...entry.slice(1)] : 'error',
      ]),
    ),
  },
  {
    files: ['src/runner/worker.ts'],
    languageOptions: { globals: { ...globals.worker } },
  },
  {
    files: ['tools/**/*.{ts,mjs,js}', 'e2e/**/*.ts', '*.config.{ts,js,mjs}'],
    languageOptions: { globals: globals.node },
  },
);
