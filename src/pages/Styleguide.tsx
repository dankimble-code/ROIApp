import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTheme, PaletteType } from '@/contexts/ThemeContext'
import { Palette, CheckCircle, AlertCircle, Info } from 'lucide-react'

const palettes = [
  { 
    id: 'palette-a' as PaletteType, 
    name: 'Palette A', 
    description: 'Ink + Rust (cool neutral base)',
    colors: {
      primary: '#1E293B',
      secondary: '#C2643F', 
      accent: '#B38B59',
      bg: '#F8FAFC',
      surface: '#F1F5F9',
      border: '#E2E8F0',
      text: '#0F172A',
      muted: '#64748B'
    }
  },
  { 
    id: 'palette-b' as PaletteType, 
    name: 'Palette B', 
    description: 'Charcoal + Copper (warm neutral base)',
    colors: {
      primary: '#2B2F36',
      secondary: '#B26B3A',
      accent: '#4F7A79', 
      bg: '#FAFAF8',
      surface: '#F4F2EE',
      border: '#E7E2DA',
      text: '#212529',
      muted: '#6B7280'
    }
  },
  { 
    id: 'palette-c' as PaletteType, 
    name: 'Palette C', 
    description: 'Deep Plum + Ochre (soft contrast)',
    colors: {
      primary: '#2E2239',
      secondary: '#B28847',
      accent: '#4B6B88',
      bg: '#FAFBFC', 
      surface: '#EEEFF4',
      border: '#E5E7EB',
      text: '#111827',
      muted: '#6D7280'
    }
  }
]

export default function Styleguide() {
  const { palette, setPalette } = useTheme()
  const [email, setEmail] = useState('')
  const [selectedValue, setSelectedValue] = useState('')

  const currentPalette = palettes.find(p => p.id === palette)

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-text">Design System Styleguide</h1>
          <p className="text-muted max-w-2xl mx-auto">
            Interactive preview of our three subtle color palettes with semantic tokens.
            Each palette maintains WCAG AA contrast while providing distinct visual personalities.
          </p>
        </div>

        {/* Theme Switcher */}
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle className="text-text flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme Switcher
            </CardTitle>
            <CardDescription className="text-muted">
              Choose a palette to see live changes across all components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {palettes.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPalette(p.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    palette === p.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border bg-surface hover:border-accent'
                  }`}
                >
                  <div className="text-left space-y-2">
                    <h3 className="font-semibold text-text">{p.name}</h3>
                    <p className="text-sm text-muted">{p.description}</p>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: p.colors.primary }} />
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: p.colors.secondary }} />
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: p.colors.accent }} />
                    </div>
                  </div>
                  {palette === p.id && (
                    <CheckCircle className="h-5 w-5 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Palette Info */}
        {currentPalette && (
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="text-text">Current Palette: {currentPalette.name}</CardTitle>
              <CardDescription className="text-muted">{currentPalette.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(currentPalette.colors).map(([name, hex]) => (
                  <div key={name} className="text-center space-y-2">
                    <div 
                      className="w-full h-16 rounded border border-border"
                      style={{ backgroundColor: hex }}
                    />
                    <div className="text-sm">
                      <div className="font-medium text-text capitalize">{name}</div>
                      <div className="text-muted font-mono text-xs">{hex}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Component Previews */}
        <div className="grid gap-8">
          {/* Buttons */}
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="text-text">Buttons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="destructive">Destructive</Button>
                <Button disabled>Disabled</Button>
              </div>
            </CardContent>
          </Card>

          {/* Form Elements */}
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="text-text">Form Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-text">Email</Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-bg border-border text-text"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-text">Select Option</Label>
                  <Select value={selectedValue} onValueChange={setSelectedValue}>
                    <SelectTrigger className="bg-bg border-border text-text">
                      <SelectValue placeholder="Choose an option" />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-border">
                      <SelectItem value="option1">Option 1</SelectItem>
                      <SelectItem value="option2">Option 2</SelectItem>
                      <SelectItem value="option3">Option 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="text-text">Tabs</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tab1" className="w-full">
                <TabsList className="bg-bg border-border">
                  <TabsTrigger value="tab1" className="text-text">Tab 1</TabsTrigger>
                  <TabsTrigger value="tab2" className="text-text">Tab 2</TabsTrigger>
                  <TabsTrigger value="tab3" className="text-text">Tab 3</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1" className="text-text">
                  <p>Content for tab 1. This demonstrates how text appears in the selected palette.</p>
                </TabsContent>
                <TabsContent value="tab2" className="text-text">
                  <p>Content for tab 2. Notice the consistent color usage across components.</p>
                </TabsContent>
                <TabsContent value="tab3" className="text-text">
                  <p>Content for tab 3. All colors use semantic tokens for easy theming.</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="text-text">Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-border bg-bg">
                <Info className="h-4 w-4 text-accent" />
                <AlertDescription className="text-text">
                  This is an informational alert using semantic tokens.
                </AlertDescription>
              </Alert>
              <Alert className="border-secondary/30 bg-secondary/5">
                <AlertCircle className="h-4 w-4 text-secondary" />
                <AlertDescription className="text-text">
                  This is a warning alert with secondary color accent.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="text-text">Table</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-text">Name</TableHead>
                    <TableHead className="text-text">Role</TableHead>
                    <TableHead className="text-text">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-border">
                    <TableCell className="text-text">John Doe</TableCell>
                    <TableCell className="text-muted">Developer</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Active</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-border">
                    <TableCell className="text-text">Jane Smith</TableCell>
                    <TableCell className="text-muted">Designer</TableCell>
                    <TableCell>
                      <Badge variant="outline">Pending</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}