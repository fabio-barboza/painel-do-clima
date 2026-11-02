import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT_DIR = resolve(process.cwd(), '..')
const FRONTEND_ENV_EXAMPLE_PATH = resolve(ROOT_DIR, 'frontend/.env.example')
const WEATHER_API_PATH = resolve(ROOT_DIR, 'frontend/src/api/weather.js')
const README_PATH = resolve(ROOT_DIR, 'README.md')

const DEFAULT_API_BASE_URL = 'http://localhost:3000'

const readText = (filePath) => readFileSync(filePath, 'utf8')

function parseEnvExample(content) {
  return Object.fromEntries(
    content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'))
      .map((line) => {
        const separator = line.indexOf('=')
        return [line.slice(0, separator), line.slice(separator + 1)]
      })
  )
}

describe('frontend/.env.example', () => {
  test('should document VITE_API_URL with the default backend URL', () => {
    const parsed = parseEnvExample(readText(FRONTEND_ENV_EXAMPLE_PATH))

    expect(parsed).toEqual({ VITE_API_URL: DEFAULT_API_BASE_URL })
  })

  test('should match the fallback used by the API client in code', () => {
    const apiSource = readText(WEATHER_API_PATH)

    expect(apiSource).toContain(`const DEFAULT_API_BASE_URL = '${DEFAULT_API_BASE_URL}'`)
    expect(apiSource).toContain('import.meta.env.VITE_API_URL')
  })
})

describe('README.md frontend communication', () => {
  const readme = readText(README_PATH)

  test('should document VITE_API_URL, the frontend dev and preview ports and the no-store fetch rule', () => {
    expect(readme).toContain('| `frontend/.env.local` | `VITE_API_URL` | `http://localhost:3000` |')
    expect(readme).toContain('`http://localhost:5173`')
    expect(readme).toContain('`http://localhost:4173`')
    expect(readme).toContain("`cache: 'no-store'`")
  })

  test('should document that npm test in the frontend stays in watch mode', () => {
    expect(readme).toContain('`npm test` no frontend fica em modo watch')
    expect(readme).toContain('npm test -- run')
  })
})
