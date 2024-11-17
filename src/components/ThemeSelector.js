function ThemeSelector({ currentTheme, onSelectTheme }) {
  const BOARD_THEMES = {
    classic: {
      name: 'Classic',
      light: '#F0D9B5',
      dark: '#B58863'
    },
    midnight: {
      name: 'Midnight Blue',
      light: '#DEE3E6',
      dark: '#315991'
    },
    emerald: {
      name: 'Emerald',
      light: '#FFFFDD',
      dark: '#86A666'
    },
    coral: {
      name: 'Coral',
      light: '#FDE9D9',
      dark: '#D08B5B'
    },
    tournament: {
      name: 'Tournament',
      light: '#E8EBF0',
      dark: '#7FA650'
    }
  }

  return (
    <div className="theme-selector">
      <h3>Board Theme</h3>
      <div className="theme-grid">
        {Object.entries(BOARD_THEMES).map(([id, theme]) => (
          <button
            key={id}
            className={`theme-button ${currentTheme === id ? 'active' : ''}`}
            onClick={() => onSelectTheme(id)}
          >
            <div className="theme-preview">
              <div className="preview-square" style={{ background: theme.light }}></div>
              <div className="preview-square" style={{ background: theme.dark }}></div>
            </div>
            <span>{theme.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ThemeSelector 