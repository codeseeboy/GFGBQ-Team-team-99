# TrustLayer AI - Frontend

Modern, responsive Next.js dashboard for AI-powered claim verification with real-time analysis, PDF export, and comprehensive reporting.

## 🎯 Features

- **Real-time Verification**: Stream claim analysis with live progress indicators
- **Trust Score Visualization**: Interactive circular progress display with confidence metrics
- **PDF Export**: Professional downloadable verification reports with dark theme
- **Responsive Design**: Mobile-first UI optimized for all screen sizes
- **Dashboard Analytics**: Claims summary, verification breakdown, hallucination detection
- **Report Management**: View, filter, and download historical verification reports
- **Dark Theme**: Modern dark interface with purple accent colors
- **Role-based Auth**: Secure authentication with JWT tokens

## 🚀 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | Next.js 16.0 (Turbopack) |
| **Language** | TypeScript 5.6 |
| **Styling** | Tailwind CSS 3.4 |
| **Animation** | Framer Motion |
| **PDF Export** | jsPDF 2.5 |
| **Components** | Radix UI + Custom |
| **State** | React Hooks (useState, useEffect) |
| **HTTP Client** | Axios |

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- Backend API running (http://localhost:4000)
- Environment variables configured

## 🛠️ Installation

1. **Clone and install**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```
   
   For production, use your deployed backend URL:
   ```env
   NEXT_PUBLIC_API_URL=https://api.trustlayer.com
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   
   Open http://localhost:3000 in your browser.

## 📂 Pages & Routes

| Route | Purpose | Description |
|-------|---------|-------------|
| `/` | Home/Landing | Hero section with feature overview |
| `/auth` | Authentication | Login/signup page |
| `/dashboard` | Verify | Main claim verification interface |
| `/engine` | Engine Status | AI verification pipeline details |
| `/reports` | Reports | Historical analysis and reports |
| `/reports/[id]` | Report Detail | Individual report view |
| `/about` | About | Project information |
| `/integrations` | Integrations | API and integration docs |

## 🎨 Component Structure

```
components/
├── landing-hero.tsx              # Homepage hero section
├── scroll-story.tsx              # Feature showcase
├── site-header.tsx               # Navigation header
├── theme-provider.tsx            # Dark theme wrapper
├── dashboard/
│   ├── analysis-input.tsx        # Text input form
│   ├── results-area.tsx          # Results display & PDF download
│   ├── insight-rail.tsx          # Real-time log streaming
│   ├── sidebar.tsx               # Navigation sidebar
│   ├── mobile-header.tsx         # Mobile menu
├── ui/                           # Radix UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── switch.tsx
│   ├── accordion.tsx
│   └── ... 40+ UI components
```

## 🔄 Verification Flow

### 1. User Input
```
User enters text → Analyze button click → Analysis ID generated
```

### 2. Real-time Streaming
```
Backend begins verification → 
Live logs stream via SSE → 
Progress shown in UI
```

### 3. Results Display
```
Claims extracted → Trust score calculated → 
Confidence levels assigned → Results displayed
```

### 4. Report Generation
```
Click "Download Report" → 
PDF generated with claims, evidence, sources → 
File downloaded to user's device
```

## 📡 API Integration

All API calls handled through `lib/api.ts`:

### Core Functions

**Verify Claim**:
```typescript
const result = await analyzeText(text);
// Returns: { analysisId, trustScore, label, claims, ... }
```

**Get Analysis Details**:
```typescript
const details = await getAnalysisDetails(analysisId);
// Returns: Full analysis with all claims and evidence
```

**Stream Logs**:
```typescript
const stream = eventSource("/api/logs/stream");
// Receives real-time verification events
```

**Download Report**:
```typescript
const pdf = await generateReportPDF(analysis);
// Returns: Blob for browser download
```

## 🎨 UI/UX Design

### Color Scheme
- **Background**: `#0a0a0f` (Deep dark)
- **Primary**: `#8b5cf6` (Purple)
- **Verified**: `#10b981` (Green)
- **Uncertain**: `#f59e0b` (Amber)
- **Hallucinated**: `#ef4444` (Red)

### Typography
- **Display**: Black font (bold, 24-48px)
- **Body**: Regular font (14-16px)
- **Muted**: Gray text with reduced opacity

### Components
- Glass-morphism cards with backdrop blur
- Smooth animations with Framer Motion
- Responsive grid layouts with Tailwind
- Custom scrollbar styling

## 📊 Key Features Explained

### Trust Score Display
Shows overall confidence percentage with color-coded indicator:
- **90-100%**: Green "Verified"
- **70-89%**: Amber "Review Recommended"
- **<70%**: Red "Low Confidence"

### Claims Breakdown
- **Verified**: Claims with strong supporting evidence
- **Uncertain**: Claims with mixed or limited evidence
- **Hallucinated**: Claims lacking supporting evidence

### PDF Report
- Multi-page layout (header, summary, original text, claims, sources)
- Dark theme matching UI
- Automatic pagination
- Text sanitization for special characters
- Evidence listing with source links

## 🚀 Build & Deploy

### Development
```bash
npm run dev    # Start dev server on port 3000
npm run lint   # Check code quality
```

### Production Build
```bash
npm run build  # Build Next.js app
npm start      # Start production server
```

### Deploy to Vercel
```bash
vercel deploy
```

Set environment variable in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## 🔐 Security

- Sensitive API keys stored in `.env.local` (not committed)
- JWT tokens stored in localStorage
- HTTPS enforced for all API calls
- CORS configured on backend
- Input sanitization before processing
- XSS protection via Next.js built-in features

## 🎯 Performance

- **Turbopack**: Fast development builds
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **SSE Streaming**: Efficient real-time updates
- **Lazy Loading**: Components load on demand

## 📱 Responsive Design

- **Mobile**: Full-width single column (< 768px)
- **Tablet**: 2-column layout with sidebar (768px - 1024px)
- **Desktop**: 3-column layout with sidebar + insights (> 1024px)

Mobile-specific components:
- Collapsible sidebar menu
- Touch-friendly button sizes
- Stacked card layouts
- Bottom-aligned action buttons

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| API connection fails | Verify backend URL in `.env.local` |
| PDF download not working | Check browser console for jsPDF errors |
| Logs not streaming | Ensure backend SSE endpoint is active |
| Authentication fails | Clear localStorage and retry login |

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [jsPDF](https://github.com/parallax/jsPDF)

## 📄 License

Private - ByteQuest 2025 Hackathon
