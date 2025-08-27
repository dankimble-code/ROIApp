# Color Palette Documentation

This document outlines the three subtle color palettes implemented in the application.

## Palette A - Ink + Rust (Cool Neutral Base)

**Primary Brand Colors:**
- Primary: `#1E293B` (HSL: 217, 33%, 17%) - Cool dark blue-gray
- Secondary: `#C2643F` (HSL: 18, 51%, 50%) - Warm rust red
- Accent: `#B38B59` (HSL: 39, 35%, 53%) - Muted golden brown

**Surface Colors:**
- Background: `#F8FAFC` (HSL: 210, 40%, 98%) - Very light cool gray
- Surface: `#F1F5F9` (HSL: 213, 27%, 96%) - Light cool gray
- Border: `#E2E8F0` (HSL: 213, 27%, 84%) - Medium cool gray

**Text Colors:**
- Text: `#0F172A` (HSL: 217, 91%, 12%) - Very dark blue-gray
- Muted: `#64748B` (HSL: 215, 16%, 47%) - Medium cool gray

**Usage Notes:**
- Cool-toned palette ideal for professional/corporate environments
- High contrast text maintains excellent readability
- Reserved primary color for CTAs and active states
- Secondary color used for links and secondary actions

---

## Palette B - Charcoal + Copper (Warm Neutral Base) ← DEFAULT

**Primary Brand Colors:**
- Primary: `#2B2F36` (HSL: 213, 12%, 19%) - Dark charcoal
- Secondary: `#B26B3A` (HSL: 24, 51%, 47%) - Warm copper
- Accent: `#4F7A79` (HSL: 178, 24%, 40%) - Muted teal

**Surface Colors:**
- Background: `#FAFAF8` (HSL: 60, 25%, 98%) - Warm off-white
- Surface: `#F4F2EE` (HSL: 39, 18%, 94%) - Light warm gray
- Border: `#E7E2DA` (HSL: 39, 18%, 85%) - Medium warm gray

**Text Colors:**
- Text: `#212529` (HSL: 210, 11%, 15%) - Very dark gray
- Muted: `#6B7280` (HSL: 220, 9%, 46%) - Medium neutral gray

**Usage Notes:**
- Default palette with warm, approachable feel
- Copper secondary adds warmth without being overwhelming
- Teal accent provides subtle contrast
- Excellent for dashboard and business applications

---

## Palette C - Deep Plum + Ochre (Soft Contrast)

**Primary Brand Colors:**
- Primary: `#2E2239` (HSL: 270, 26%, 17%) - Deep plum
- Secondary: `#B28847` (HSL: 39, 42%, 49%) - Warm ochre
- Accent: `#4B6B88` (HSL: 210, 29%, 41%) - Soft steel blue

**Surface Colors:**
- Background: `#FAFBFC` (HSL: 210, 20%, 98%) - Very light cool white
- Surface: `#EEEFF4` (HSL: 225, 25%, 95%) - Light lavender gray
- Border: `#E5E7EB` (HSL: 220, 13%, 91%) - Light cool gray

**Text Colors:**
- Text: `#111827` (HSL: 225, 29%, 12%) - Very dark plum-gray
- Muted: `#6D7280` (HSL: 210, 9%, 46%) - Medium cool gray

**Usage Notes:**
- Sophisticated palette with subtle purple undertones
- Ochre secondary provides warm contrast to cool base
- Steel blue accent adds professional depth
- Ideal for creative or premium applications

---

## Implementation Guidelines

### Subtlety Rules
- Saturation reduced 15-25% from raw hex values for large surfaces
- Background and surface brightness lifted 2-4% for softness
- Text contrast maintained at WCAG AA standards
- Primary reserved for CTAs and active states only

### Semantic Token Usage
- `--bg`: Main page background
- `--surface`: Card backgrounds, modals, dropdowns
- `--border`: Dividers, input borders, card edges
- `--text`: Primary text content
- `--muted`: Secondary text, placeholders, disabled states
- `--primary`: Call-to-action buttons, active states
- `--secondary`: Links, secondary buttons
- `--accent`: Highlights, badges, special indicators

### Accessibility
- All body text passes WCAG AA contrast requirements (4.5:1) on bg and surface
- Disabled states maintain minimum 3:1 contrast with surfaces
- Focus states use primary color with sufficient contrast
- Color is never the only indicator of state or meaning

### Component Integration
All shadcn/ui components automatically inherit these tokens through:
- CSS custom properties in `index.css`
- Tailwind configuration in `tailwind.config.ts`
- No hardcoded hex values in component code