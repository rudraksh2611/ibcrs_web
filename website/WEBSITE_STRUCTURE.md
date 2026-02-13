# Website Structure & Navigation Guide

## 📍 Website Pages Overview

### 1. **index.html** (Main Page)
```
IBCRS Website
│
├─ Navigation Bar
│  ├─ Home
│  ├─ Detection
│  ├─ Features
│  ├─ Our Team ← NEW
│  └─ About Us ← NEW (links to about.html)
│
├─ Header Section
│  ├─ Title: IBCRS
│  └─ Subtitle: Intelligent BioTech Component Recognition System
│
├─ Main Content Area
│  ├─ Live Detection Feed (Video/Camera Feed)
│  ├─ Control Buttons (Start, Stop, Snapshot)
│  └─ Performance Stats Panel
│
├─ Key Features Section (6 Cards)
│  ├─ Real-Time Detection
│  ├─ Lightning Fast
│  ├─ Performance Tracking
│  ├─ Easy Integration
│  ├─ AI Powered
│  └─ Mobile Responsive
│
├─ 🆕 INNOVATORS SECTION ← NEW
│  │
│  ├─ Team Member Cards (6 People)
│  │  ├─ Dr. Sarah Johnson (AI Lead)
│  │  ├─ John Chen (Backend)
│  │  ├─ Emma Wilson (Frontend)
│  │  ├─ Prof. Michael Zhang (Director)
│  │  ├─ Lisa Anderson (Data Scientist)
│  │  └─ David Kumar (DevOps)
│  │
│  └─ Each Card Contains:
│     ├─ Avatar Circle with Icon
│     ├─ Name & Role
│     ├─ Bio/Description
│     ├─ Social Media Links
│     └─ Skill Tags
│
├─ 🆕 ACHIEVEMENTS SECTION ← NEW
│  ├─ 50K+ Downloads
│  ├─ 4.9★ Rating
│  ├─ 7 Biotech Components
│  └─ 1000+ Active Users
│
├─ Modal (Component Details)
│  └─ Displays detailed info for each component
│
└─ Footer
   ├─ Contact Info
   ├─ Copyright
   ├─ Tech Stack
   └─ Credits
```

---

### 2. **about.html** (New About Us Page - Comprehensive) ← NEW
```
About IBCRS Page
│
├─ Navigation Bar (consistent with main page)
│  └─ Back to Home button
│
├─ Page Header
│  ├─ Title: About IBCRS
│  └─ Subtitle & Description
│
├─ Mission Section
│  └─ Company mission statement
│
├─ Vision Section
│  ├─ Long-term vision
│  └─ 5 Key vision points
│
├─ Core Values Section (6 Cards)
│  ├─ Innovation
│  ├─ Collaboration
│  ├─ Reliability
│  ├─ Accessibility
│  ├─ Continuous Learning
│  └─ Excellence
│
├─ Team Section (Full Profiles)
│  ├─ Description
│  └─ 6 Team Member Cards
│     (Same as index.html team section)
│
├─ Technology Stack Section
│  ├─ Core Technologies
│  │  ├─ YOLOv8
│  │  ├─ PyTorch
│  │  ├─ OpenCV
│  │  ├─ Flask
│  │  ├─ Next.js
│  │  └─ Docker
│  │
│  └─ Supported Models
│     ├─ YOLOv5
│     ├─ YOLOv8
│     ├─ YOLOv9
│     ├─ YOLOv11
│     └─ Custom Models
│
├─ Contact Section
│  ├─ Email: info@ibcrs.ai
│  └─ Website: www.ibcrs.ai
│
└─ Footer (Same as main page)
```

---

### 3. **Component Pages** (component_cam.html, etc.)
```
Component Detail Page
│
├─ Navigation Bar
│  └─ Back to Detection button
│
├─ Page Header
│  └─ Component Name & Description
│
├─ Content Sections
│  ├─ Introduction
│  ├─ Advantages (bulleted list)
│  ├─ Disadvantages (bulleted list)
│  ├─ How It Works
│  └─ Tutorial Video
│
└─ Footer (Enhanced with contact info)
```

---

## 🎨 Design System

### Color Palette
```
Primary Blue:      #0066ff
Accent Cyan:       #00d4ff
Dark Background:   #0f1419
Secondary Dark:    #1a1f2e
Light Text:        #ffffff
Secondary Text:    #a0aec0
Tertiary Text:     #b0b8c0
```

### Typography
```
Font Family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif

Heading 1 (h1):   2.5rem, bold
Heading 2 (h2):   2.0rem, bold
Heading 3 (h3):   1.4rem, bold
Heading 4 (h4):   1.1rem, bold
Body Text:        1.0rem (1rem), regular
Small Text:       0.9rem
Tiny Text:        0.85rem
```

### Spacing System
```
Extra Small (xs):  0.5rem
Small (sm):        1rem
Medium (md):       1.5rem
Large (lg):        2rem
Extra Large (xl):  2.5rem
XXL:               3rem
```

---

## 📱 Responsive Breakpoints

### Mobile (< 768px)
- Single column layouts
- Reduced font sizes
- Simplified navigation
- Touch-optimized buttons
- Full-width content

### Tablet (768px - 1024px)
- 2-column layouts where applicable
- Adjusted spacing
- Medium text sizes
- Balanced layout

### Desktop (> 1024px)
- Multi-column layouts
- Full navigation menu
- Optimal spacing
- Full-size text
- All features visible

---

## 🔄 User Flow

### New Visitor Journey
```
1. Lands on index.html
   ↓
2. Sees navigation menu → Can choose:
   - Home (scroll top)
   - Detection (scroll to video)
   - Features (scroll to features)
   - Our Team (scroll to team section)
   - About Us (navigate to about.html)
   ↓
3. Clicks "About Us" in navigation
   ↓
4. Taken to about.html
   - Sees mission, vision, values
   - Reads team profiles
   - Learns about technology
   - Gets contact info
   ↓
5. Can click "Back to Home" in navbar
   to return to index.html
```

---

## 🎯 Key Interactive Elements

### Team Cards Hover Effects
- Smooth lift animation (translateY)
- Border color change (glow)
- Inner shimmer effect
- Avatar scale and shadow change

### Achievement Cards Hover Effects
- Smooth lift animation
- Border color transition
- Shadow enhancement
- Icon color change (glow)

### Navigation Hover Effects
- Text color change to cyan
- Gradient underline animation
- Full width underline on hover

### Social Links Hover Effects
- Background color change
- Border color transition
- Icon color change
- Small lift animation

---

## 📊 Component Inventory

### Main Sections (index.html)
- Navigation Bar ✓
- Header Section ✓
- Live Detection Feed ✓
- Control Buttons ✓
- Stats Panel ✓
- Features Cards (6) ✓
- **Innovators Section (6 people)** ✓ NEW
- **Achievements Cards (4)** ✓ NEW
- Modal Window ✓
- Footer ✓

### About Page (about.html)
- Navigation Bar ✓ NEW
- Header Section ✓ NEW
- Mission Section ✓ NEW
- Vision Section ✓ NEW
- Values Cards (6) ✓ NEW
- Full Team Profiles ✓ NEW
- Technology Stack ✓ NEW
- Contact Section ✓ NEW
- Footer ✓ NEW

---

## 🔐 Implementation Details

### CSS Classes Used

#### Team Components
- `.team-section` - Team section container
- `.team-grid` - Grid layout for team cards
- `.team-card` - Individual team member card
- `.team-avatar` - Circular avatar container
- `.team-name` - Member name styling
- `.team-role` - Role/title styling
- `.team-bio` - Biography/description
- `.team-social` - Social links container
- `.social-link` - Individual social link
- `.team-skills` - Skills container
- `.skill-tag` - Individual skill badge

#### Achievement Components
- `.achievements-section` - Container
- `.achievements-grid` - Grid layout
- `.achievement-card` - Card container
- `.achievement-icon` - Icon styling
- `.achievement-number` - Number display
- `.achievement-label` - Label text

### Animation Classes
- `@keyframes slideIn` - Slide in animation
- `@keyframes fadeIn` - Fade in animation
- `@keyframes slideUp` - Slide up animation
- Hover effects with `transform`, `transition`

---

## 🚀 Performance Optimizations

### CSS
- Uses CSS Grid for layouts
- CSS transforms for animations (GPU accelerated)
- Backdrop filters for modern browsers
- Efficient media queries

### Images & Icons
- Font Awesome icons (lightweight)
- CSS-based gradients (no image files)
- SVG-friendly color scheme

### JavaScript
- Minimal required (mostly CSS-based animations)
- Smooth transitions without load impact
- Efficient DOM manipulation

---

## 📋 Customization Guide

### To Update Team Members:
1. Edit `.team-card` divs in index.html
2. Change name, role, bio
3. Update skill tags
4. Mirror changes in about.html

### To Change Colors:
1. Search for color hex codes in CSS
2. Replace globally or for specific sections
3. Test on different backgrounds

### To Modify Animations:
1. Find `@keyframes` definitions in CSS
2. Adjust transform and opacity values
3. Change transition duration in class definitions

### To Add New Sections:
1. Copy existing section structure
2. Update class names and styling
3. Add to appropriate page
4. Update navigation if needed

---

**Last Updated:** February 12, 2026
**Version:** 2.0 - Complete UI/UX Enhancement
**Status:** Production Ready ✅
