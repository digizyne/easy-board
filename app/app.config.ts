export default defineAppConfig({
  // EASY brand — "Ship Green": emerald primary (green = Done / ship it) on a
  // clean zinc neutral. Both are built-in Tailwind palettes, so no custom CSS
  // is required. Appearance defaults to system (users can toggle).
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'zinc'
    }
  }
})
