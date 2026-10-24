import { FlatCompat } from '@eslint/eslintrc'
import { globalIgnores } from 'eslint/config'

const compat = new FlatCompat({ baseDirectory: import.meta.dirname })

const config = [
  ...compat.extends('next/core-web-vitals'),
  globalIgnores(['.next/**', 'node_modules/**', 'out/**', 'next-env.d.ts', '.test-dist/**']),
]

export default config
