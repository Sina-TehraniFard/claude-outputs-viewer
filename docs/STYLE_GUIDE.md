# Claude Outputs Viewer - Style Guide

> A comprehensive, practical guide for consistent UI/UX design and development

## 🎯 Design Philosophy

**Clean, Functional, Fast**
- **Simplicity First**: Every element serves a purpose
- **Claude-Centric**: Optimized for reading and managing Claude conversation outputs
- **Developer-Friendly**: Consistent patterns, predictable behavior

---

## 🎨 Visual Design System

### Color Palette

#### Light Theme
```css
Background:    #ffffff (Pure white for clean reading)
Surface:       #f8fafc (Cards, elevated elements) 
Border:        #e2e8f0 (Subtle separation)
Text Primary:  #0f172a (High contrast for readability)
Text Secondary:#64748b (Supporting information)
Accent:        #3b82f6 (Interactive elements)
Success:       #10b981 (Positive actions)
Warning:       #f59e0b (Caution states)
Error:         #ef4444 (Destructive actions)
```

#### Dark Theme
```css
Background:    #0f172a (Deep dark for eye comfort)
Surface:       #1e293b (Cards, elevated elements)
Border:        #334155 (Visible but not harsh)
Text Primary:  #f1f5f9 (High contrast on dark)
Text Secondary:#94a3b8 (Muted supporting text)
Accent:        #60a5fa (Brighter for dark backgrounds)
```

### Typography

#### Font Stack
```css
/* Primary: Clean, readable sans-serif */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Code/Monospace: For file paths, code snippets */
font-family: 'JetBrains Mono', 'Monaco', 'Cascadia Code', monospace;
```

#### Text Hierarchy
```css
H1 (Page Title):     32px, font-weight: 700, line-height: 1.2
H2 (Section):        24px, font-weight: 600, line-height: 1.3  
H3 (Subsection):     20px, font-weight: 600, line-height: 1.4
Body Text:           16px, font-weight: 400, line-height: 1.6
Small Text:          14px, font-weight: 400, line-height: 1.5
Caption:             12px, font-weight: 500, line-height: 1.4
```

### Spacing System

**8px Base Unit** - All spacing uses multiples of 8px
```css
xs:  4px   (0.25rem)  /* Tight spacing within elements */
sm:  8px   (0.5rem)   /* Small gaps, icon margins */
md:  16px  (1rem)     /* Standard element spacing */
lg:  24px  (1.5rem)   /* Section spacing */
xl:  32px  (2rem)     /* Large section breaks */
xxl: 48px  (3rem)     /* Page-level spacing */
```

### Border Radius
```css
sm:  4px   /* Small elements, badges */
md:  8px   /* Standard cards, buttons */
lg:  12px  /* Large containers */
xl:  16px  /* Special highlight containers */
```

---

## 🧩 Component Library

### Primary Components

#### 1. Directory Card
```tsx
// Usage: Display directory with metadata
<Card className="directory-card">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-blue-600" />
        2025-08-02
      </CardTitle>
      <Badge variant="secondary">12 files</Badge>
    </div>
    <CardDescription>Latest • 2 hours ago</CardDescription>
  </CardHeader>
</Card>
```

**Visual Specs:**
- Hover: Scale 1.02x, shadow elevation
- Cursor: Pointer
- Transition: 200ms ease-out

#### 2. File Card
```tsx
// Usage: File listing with preview and actions
<Card className="file-card">
  <CardHeader className="pb-2">
    <div className="flex items-center gap-2">
      <FileText className="h-4 w-4 text-blue-600" />
      <CardTitle className="text-base">filename.md</CardTitle>
      <Heart className="h-3 w-3 ml-auto" />
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-slate-600 line-clamp-2">Preview text...</p>
    <div className="flex gap-1 mt-2">
      <Badge variant="outline">#tag</Badge>
    </div>
  </CardContent>
</Card>
```

#### 3. Search Interface
```tsx
// Usage: Tag-based search with filters
<div className="search-container">
  <Input 
    placeholder="Search by tags..."
    className="search-input"
  />
  <div className="flex gap-2">
    <Button variant={operator === 'OR' ? 'default' : 'outline'}>
      OR
    </Button>
    <Button variant={operator === 'AND' ? 'default' : 'outline'}>
      AND
    </Button>
  </div>
</div>
```

### Secondary Components

#### Navigation Header
```tsx
<header className="border-b bg-white/95 backdrop-blur">
  <div className="container flex h-14 items-center justify-between">
    <h1 className="text-xl font-bold">Claude Outputs</h1>
    <nav className="flex gap-2">
      <Button variant="ghost">Directories</Button>
      <Button variant="ghost">Search</Button>
      <Button variant="ghost">Favorites</Button>
    </nav>
  </div>
</header>
```

#### Status Indicators
```tsx
// Loading state
<div className="flex items-center gap-2">
  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
  <span className="text-sm">Loading files...</span>
</div>

// Error state  
<div className="bg-red-50 border border-red-200 rounded-lg p-4">
  <p className="text-red-800 text-sm">Failed to load directory</p>
</div>

// Empty state
<div className="text-center py-12">
  <Folder className="h-12 w-12 text-slate-400 mx-auto mb-4" />
  <h3 className="font-medium text-slate-900">No files found</h3>
  <p className="text-slate-500 text-sm">This directory is empty</p>
</div>
```

---

## 📐 Layout Patterns

### Page Structure
```tsx
<div className="min-h-screen bg-slate-50">
  <Header />
  <main className="container mx-auto py-6 px-4">
    <div className="mb-8">
      <h1>Page Title</h1>
      <p className="text-slate-600">Description</p>
    </div>
    <div className="content-area">
      {/* Page content */}
    </div>
  </main>
</div>
```

### Grid Layouts
```tsx
// Responsive directory/file grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>

// List view alternative
<div className="space-y-3">
  {items.map(item => <Card key={item.id} className="flex" />)}
</div>
```

### Content Containers
```tsx
// Standard container widths
<div className="max-w-6xl mx-auto">   {/* Wide layouts (dashboard) */}
<div className="max-w-4xl mx-auto">   {/* Reading content */}  
<div className="max-w-2xl mx-auto">   {/* Forms, narrow content */}
```

---

## 🎭 Interactive States

### Button States
```css
/* Primary Button */
.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  transition: background 150ms ease;
}
.btn-primary:hover { background: #2563eb; }
.btn-primary:active { background: #1d4ed8; }
.btn-primary:disabled { 
  background: #cbd5e1; 
  cursor: not-allowed; 
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: #475569;
  border: none;
}
.btn-ghost:hover { background: #f1f5f9; }
```

### Card Interactions
```css
.card {
  transition: all 200ms ease-out;
  cursor: pointer;
}
.card:hover {
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}
.card:active {
  transform: translateY(0);
}
```

### Focus States
```css
/* Consistent focus ring */
.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  border-color: #3b82f6;
}
```

---

## 📱 Responsive Design

### Breakpoints
```css
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */  
lg:  1024px  /* Small laptops */
xl:  1280px  /* Desktop */
2xl: 1536px  /* Large desktop */
```

### Mobile-First Patterns
```tsx
// Navigation: Collapse to hamburger on mobile
<nav className="hidden md:flex gap-4">
  <Button>Directories</Button>
  <Button>Search</Button>
</nav>
<Button className="md:hidden">☰</Button>

// Grid: Stack on mobile, grid on larger screens  
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Typography: Smaller on mobile
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
```

---

## ⚡ Performance Guidelines

### Image Optimization
```tsx
// Lazy loading for file previews
<img 
  src={preview} 
  loading="lazy"
  className="w-full h-32 object-cover rounded-lg"
  alt="File preview"
/>
```

### Animation Performance
```css
/* Use transform instead of changing layout properties */
.card-hover {
  transform: translateY(-2px) scale(1.02);
  /* Avoid: margin-top: -2px; width: 102%; */
}

/* Prefer opacity changes over visibility */
.fade-in {
  opacity: 0;
  transition: opacity 300ms ease;
}
.fade-in.visible {
  opacity: 1;
}
```

### Loading States
```tsx
// Skeleton loading for cards
<div className="animate-pulse">
  <div className="h-6 bg-slate-200 rounded mb-2" />
  <div className="h-4 bg-slate-200 rounded w-3/4" />
</div>

// Progressive loading: Show structure first
<Card>
  <CardHeader>
    <CardTitle>{title || <Skeleton />}</CardTitle>
  </CardHeader>
  <CardContent>
    {content ? content : <Skeleton lines={3} />}
  </CardContent>
</Card>
```

---

## ✅ Accessibility Checklist

### Keyboard Navigation
- [ ] All interactive elements accessible via Tab
- [ ] Escape key closes modals/dropdowns
- [ ] Arrow keys navigate lists/grids
- [ ] Enter/Space activate buttons

### Screen Reader Support
```tsx
// Descriptive labels
<Button aria-label="Add file to favorites">
  <Heart />
</Button>

// Status announcements
<div role="status" aria-live="polite">
  {loading ? "Loading files..." : `${files.length} files loaded`}
</div>

// Landmark navigation
<main role="main">
<nav role="navigation" aria-label="Primary navigation">
```

### Color Contrast
- Text on background: Minimum 4.5:1 ratio
- Interactive elements: Minimum 3:1 ratio
- Don't rely solely on color for meaning

---

## 🔧 Development Guidelines

### File Organization
```
src/frontend/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── layout/       # Page layout components  
│   └── features/     # Feature-specific components
├── pages/            # Route components
├── styles/           # Global styles, themes
└── utils/            # Helper functions
```

### Component Naming
```tsx
// Use PascalCase for components
export function DirectoryCard() {}
export function FileSearchInput() {}

// Use camelCase for props
interface CardProps {
  showMetadata: boolean;
  onFileSelect: (file: File) => void;
}
```

### CSS Class Naming
```css
/* Use descriptive, component-based names */
.directory-card          /* Component root */
.directory-card__header   /* Component part */
.directory-card--featured /* Component variant */

/* Avoid overly generic names */
.card, .button, .container /* Too generic */
```

---

## 🎨 Customization Guide

### Theming
```css
/* Override CSS custom properties for themes */
:root {
  --color-primary: #3b82f6;
  --color-background: #ffffff;
  --radius-default: 8px;
}

[data-theme="dark"] {
  --color-background: #0f172a;
  --color-primary: #60a5fa;
}
```

### Component Variants
```tsx
// Extend existing components with variants
const cardVariants = {
  default: "bg-white border",
  featured: "bg-blue-50 border-blue-200", 
  compact: "p-3 text-sm"
}

<Card className={cardVariants.featured}>
```

---

## 📋 Quick Reference

### Most Common Patterns
```tsx
// Page header
<div className="mb-8">
  <h1 className="text-3xl font-bold">Page Title</h1>
  <p className="text-slate-600">Description</p>
</div>

// Action button group
<div className="flex gap-2">
  <Button variant="default">Primary</Button>
  <Button variant="outline">Secondary</Button>  
</div>

// Card with metadata
<Card className="cursor-pointer hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Icon className="h-5 w-5" />
      Title
    </CardTitle>
    <CardDescription>Metadata</CardDescription>
  </CardHeader>
</Card>

// Loading state
{loading ? (
  <div className="flex items-center gap-2">
    <LoadingSpinner />
    <span>Loading...</span>
  </div>
) : (
  content
)}
```

### Color Usage
```tsx
// Semantic colors
<Badge variant="success">Saved</Badge>      // Green
<Badge variant="warning">Modified</Badge>   // Yellow  
<Badge variant="error">Failed</Badge>       // Red
<Badge variant="info">Processing</Badge>    // Blue

// Text colors
<p className="text-slate-900">Primary text</p>
<p className="text-slate-600">Secondary text</p>
<p className="text-slate-400">Muted text</p>
```

---

*This style guide ensures consistency, accessibility, and maintainability across the Claude Outputs Viewer application.*