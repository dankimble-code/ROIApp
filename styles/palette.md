# Color Palette Documentation

## Overview
This design system uses three subtle color palettes with semantic tokens for consistent theming. All colors follow WCAG AA contrast guidelines and are optimized for readability and accessibility.

## Palette A: Ink + Rust (Cool Neutral Base)
**Character:** Professional, crisp, modern with cool undertones
**Best for:** Corporate, finance, technology applications

### Colors
- **Primary:** `#1E293B` / `hsl(217, 33%, 17%)`
  - Usage: CTAs, active states, focus indicators
  - High contrast, excellent for buttons and links
  
- **Secondary:** `#C2643F` / `hsl(18, 51%, 50%)`
  - Usage: Links, secondary actions, highlights
  - Warm rust tone provides energy and approachability
  
- **Accent:** `#B38B59` / `hsl(39, 35%, 53%)`
  - Usage: Hover states, decorative elements, badges
  - Earthy gold tone for subtle emphasis
  
- **Background:** `#F8FAFC` / `hsl(210, 40%, 98%)`
  - Usage: Page backgrounds
  - Very light blue-tinted white
  
- **Surface:** `#F1F5F9` / `hsl(213, 27%, 96%)`
  - Usage: Cards, modals, elevated surfaces
  - Slightly darker than background for layering
  
- **Border:** `#E2E8F0` / `hsl(213, 27%, 84%)`
  - Usage: Component borders, dividers
  - Subtle gray with cool undertones
  
- **Text:** `#0F172A` / `hsl(217, 91%, 12%)`
  - Usage: Primary text, headings
  - Very dark blue-black for excellent readability
  
- **Muted:** `#64748B` / `hsl(215, 16%, 47%)`
  - Usage: Secondary text, placeholders, disabled states
  - Medium gray for supporting text

## Palette B: Charcoal + Copper (Warm Neutral Base) - DEFAULT
**Character:** Warm, approachable, sophisticated with earthy undertones
**Best for:** Creative, education, wellness applications

### Colors
- **Primary:** `#2B2F36` / `hsl(213, 12%, 19%)`
  - Usage: CTAs, active states, focus indicators
  - Warm charcoal with subtle blue undertones
  
- **Secondary:** `#B26B3A` / `hsl(24, 51%, 47%)`
  - Usage: Links, secondary actions, highlights
  - Rich copper tone for warmth and energy
  
- **Accent:** `#4F7A79` / `hsl(178, 24%, 40%)`
  - Usage: Hover states, decorative elements, badges
  - Muted teal for calming contrast
  
- **Background:** `#FAFAF8` / `hsl(60, 25%, 98%)`
  - Usage: Page backgrounds
  - Warm off-white with yellow undertones
  
- **Surface:** `#F4F2EE` / `hsl(39, 18%, 94%)`
  - Usage: Cards, modals, elevated surfaces
  - Cream tone for comfortable layering
  
- **Border:** `#E7E2DA` / `hsl(39, 18%, 85%)`
  - Usage: Component borders, dividers
  - Warm beige for subtle definition
  
- **Text:** `#212529` / `hsl(210, 11%, 15%)`
  - Usage: Primary text, headings
  - Very dark gray with warm undertones
  
- **Muted:** `#6B7280` / `hsl(220, 9%, 46%)`
  - Usage: Secondary text, placeholders, disabled states
  - Neutral gray for supporting content

## Palette C: Deep Plum + Ochre (Soft Contrast)
**Character:** Sophisticated, creative, premium with purple undertones
**Best for:** Design, arts, luxury applications

### Colors
- **Primary:** `#2E2239` / `hsl(270, 26%, 17%)`
  - Usage: CTAs, active states, focus indicators
  - Deep plum for sophisticated branding
  
- **Secondary:** `#B28847` / `hsl(39, 42%, 49%)`
  - Usage: Links, secondary actions, highlights
  - Golden ochre for warmth and luxury
  
- **Accent:** `#4B6B88` / `hsl(210, 29%, 41%)`
  - Usage: Hover states, decorative elements, badges
  - Muted blue for professional balance
  
- **Background:** `#FAFBFC` / `hsl(210, 20%, 98%)`
  - Usage: Page backgrounds
  - Clean white with subtle blue undertones
  
- **Surface:** `#EEEFF4` / `hsl(225, 25%, 95%)`
  - Usage: Cards, modals, elevated surfaces
  - Light lavender-gray for elegant layering
  
- **Border:** `#E5E7EB` / `hsl(220, 13%, 91%)`
  - Usage: Component borders, dividers
  - Cool gray for clean definition
  
- **Text:** `#111827` / `hsl(225, 29%, 12%)`
  - Usage: Primary text, headings
  - Very dark blue-gray for clarity
  
- **Muted:** `#6D7280` / `hsl(210, 9%, 46%)`
  - Usage: Secondary text, placeholders, disabled states
  - Neutral gray for supporting text

## Semantic Token Mapping

### CSS Variables
```css
--bg: /* Background color */
--surface: /* Elevated surfaces (cards, modals) */
--border: /* Borders and dividers */
--text: /* Primary text */
--muted: /* Secondary text and disabled states */
--primary: /* Primary actions and CTAs */
--primary-foreground: /* Text on primary backgrounds */
--secondary: /* Secondary actions and links */
--secondary-foreground: /* Text on secondary backgrounds */
--accent: /* Hover states and highlights */
--accent-foreground: /* Text on accent backgrounds */
```

### Usage Guidelines

#### Contrast Requirements
- **Text on background/surface:** Minimum 7:1 ratio (WCAG AAA)
- **Disabled states:** Minimum 3:1 ratio for sufficient visibility
- **Interactive elements:** Minimum 4.5:1 ratio for accessibility

#### Component Usage
- **Buttons:** Use `primary` for main actions, `secondary` for supporting actions
- **Links:** Use `secondary` color for better approachability than primary
- **Borders:** Use `border` token for consistent edge definition
- **Text hierarchy:** `text` for headings/body, `muted` for captions/labels
- **Surfaces:** Use `surface` for cards and modals over `bg` backgrounds

#### Best Practices
- Reserve `primary` for the most important actions (max 1-2 per screen)
- Use `accent` sparingly for hover states and small highlights
- Maintain consistent spacing and avoid color-only information conveyance
- Test all combinations in both bright and dim lighting conditions