# CTBEDORM | Modern Dormitory Allocation System

A high-performance, premium web application for managing student housing registrations, room allocations, and facility maintenance at the **College of Technology and Built Environment (CTBE)**. Built with Next.js 15, Supabase, and Tailwind CSS.

## 🚀 Key Features

### 👨‍🎓 Student Portal
- **Automated Allocation**: Smart room assignment based on building type, floor preference, and availability.
- **Digital ID Card**: Interactive, glassmorphism-style digital residency ID for security verification.
- **Service Requests**: Real-time maintenance reporting with SLA tracking and status updates.
- **Application Tracking**: Live status updates on housing requests (Pending, Approved, Rejected).
- **Announcements**: Instant access to building-wide alerts and proctor updates.

### 🛡️ Administration Suite
- **Management Center**: Holistic view of facility statistics, occupancy rates, and pending tasks.
- **Room Inventory**: Granular control over buildings, floors, and individual room occupancy.
- **Staff Management**: Role-based access control for proctors and admins.
- **Announcement Control**: Broadcast urgent or informational messages to specific buildings.
- **SLA Monitoring**: Automated flagging of overdue maintenance requests.

## 🛠️ Tech Stack
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Database / Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theming**: [Next Themes](https://github.com/pacocoursey/next-themes) (Optimized Dark/Light modes)

## 📦 Getting Started

### 1. Prerequisites
- Node.js 20.x or later
- A Supabase account and project

### 2. Environment Setup
Create a `.env.local` file in the root directory and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Database Migration
Run the SQL migration located in `supabase/schema.sql` in your Supabase SQL Editor to set up the following tables:
- `proctors`
- `buildings`
- `rooms`
- `students`
- `applications`
- `maintenance_requests`

### 4. Installation & Development
```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## 🎨 Design Philosophy
CTBEDORM uses a **Premium Glassmorphism** design system:
- **Rich Aesthetics**: Vibrant gradients, subtle micro-animations, and sleek dark modes.
- **Visual Clarity**: Focused typography (Inter/Geist) and hierarchical information layouts.
- **Responsiveness**: Fully adaptive interface for mobile, tablet, and desktop viewing.

---
© 2026 CTBE Dormitory Allocation System. All rights reserved.
