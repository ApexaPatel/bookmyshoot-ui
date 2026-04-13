# BookMyShoot Frontend

React + Vite frontend for BookMyShoot. It provides public discovery flows for photographers and organizations, authenticated portfolio/billing management for photographers, membership + auctions for customers, quotations, and a full admin panel.

## Tech Stack
- React
- Vite
- React Router
- Tailwind CSS
- Zustand
- Lucide icons

## Implemented Requirements
### Authentication and session
- Login and signup
- JWT session restore
- Protected profile and portfolio routes
- Header avatar menu with profile actions

### Photographer discovery
- Public Explore Photographers page
- Photographer cards with:
  - cover image
  - profile image
  - organization badge/info
- Public photographer details page with:
  - photographer summary
  - bio
  - total photoshoot count
  - event filter
  - location filter
  - filtered gallery

### Organizations explorer
- Organizations listing page
- Organization details page
- Photographer cards inside organizations
- Navigation from organization to photographer portfolio view

### Portfolio management
- Portfolio list page
- Add new photoshoot page
- Edit existing photoshoot page
- Cloudinary-backed image uploads through backend
- Event autocomplete
- multi-tag inputs for:
  - destinations
  - props
- thumbnail selection
- image removal
- basic image reordering

### Profile UX
- Cover image management
- Profile image management
- Photographer bio textarea with 500-character counter
- Redesigned profile page with:
  - full-width cover banner
  - overlapping profile header
  - sticky sidebar
  - structured content cards
  - portfolio/settings-ready layout

### Billing, membership, and auctions
- Photographer billing page with simulated plan upgrade flow (Free/Pro/Premium)
- Membership purchase page with simulated checkout and status display
- Auction marketplace:
  - customer auction creation (membership-gated)
  - Pro/Premium photographer bidding
  - bid comparison and winner selection
- Plan-based restrictions and upgrade CTAs for ineligible users

### Admin panel
- Dashboard analytics cards + charts
- User and photographer management (search/filter/pagination/role update/delete)
- Payments section:
  - Subscriptions
  - Memberships (status/date filters)
  - Photoshoots
  - Expenses
- Plans & Membership configuration:
  - Free/Pro/Premium plan cards
  - Membership config + metrics

## Main Routes
### Public
- `/`
- `/photographers`
- `/organizations`
- `/organizations/:id`
- `/photographer/:id`
- `/quote`
- `/login`
- `/signup`

### Protected
- `/profile`
- `/portfolio`
- `/portfolio/new`
- `/portfolio/:id`
- `/billing` (photographer)
- `/membership`
- `/auction`
- `/admin` (admin/staff/super_admin)

## Setup
### 1. Install
```bash
cd bookmyshoot-ui
npm install
```

### 2. Env
```bash
cp .env.example .env
```

Frontend uploads are routed through the backend, so no Cloudinary secret is stored in the frontend.

### 3. Run
```bash
npm run dev
```

Default frontend dev URL:
- `http://localhost:5173`

The dev server proxies `/api` to the backend on `http://localhost:3001`.

## Implementation Notes
### Upload flow
1. User selects image in frontend
2. Frontend posts image to `/api/upload`
3. Backend uploads to Cloudinary
4. Backend returns `secure_url`
5. Frontend saves returned URL via the appropriate API

### Public photographer gallery flow
1. Load photographer details
2. Load photographer events
3. Select event
4. Show unique event-specific locations
5. Select one or more locations
6. Load filtered gallery by event + selected locations

### Profile page structure
- `ProfileHeader`
- `ProfileSidebar`
- `ProfileInfoCard`
- `ImageUploadSection`

### Portfolio components
- `PortfolioCard`
- `PortfolioGrid`
- `AddPortfolioForm`
- `ImageUploader`

### Organization/discovery components
- `OrganizationCard`
- `PhotographerCard`
- `EventSidebar`
- `GalleryGrid`

## Project Structure
```text
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── organization/
│   │   ├── portfolio/
│   │   ├── profile/
│   │   └── ui/
│   ├── context/
│   ├── lib/
│   ├── pages/
│   │   ├── auth/
│   │   ├── organizations/
│   │   ├── photographer/
│   │   ├── photographers/
│   │   ├── portfolio/
│   │   └── profile/
│   ├── store/
│   └── App.jsx
├── .env.example
└── vite.config.js
```

## Notes
- Do not add Cloudinary secrets to frontend env
- Backend must be running for uploads and API-driven pages
- Profile and portfolio features are optimized for photographer users
