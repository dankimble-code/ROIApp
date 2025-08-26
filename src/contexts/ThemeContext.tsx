import React, { createContext, useContext, useEffect, useState } from 'react'

export type PaletteType = 'palette-a' | 'palette-b' | 'palette-c'

interface ThemeContextType {
  palette: PaletteType
  setPalette: (palette: PaletteType) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = useState<PaletteType>('palette-b')

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedPalette = localStorage.getItem('theme-palette') as PaletteType
    if (savedPalette && ['palette-a', 'palette-b', 'palette-c'].includes(savedPalette)) {
      setPaletteState(savedPalette)
    }
  }, [])

  // Apply theme to document root and save to localStorage
  const setPalette = (newPalette: PaletteType) => {
    setPaletteState(newPalette)
    document.documentElement.setAttribute('data-theme', newPalette)
    localStorage.setItem('theme-palette', newPalette)
  }

  // Apply initial theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', palette)
  }, [palette])

  return (
    <ThemeContext.Provider value={{ palette, setPalette }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}