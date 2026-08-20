# RoutePing (Bus Notification System)

RoutePing is a smart school bus notification system that allows students or parents to quickly inform the driver when they are not coming to school. The system instantly updates the driver's dashboard, helping reduce unnecessary stops, save time, and make daily school bus operations more efficient.

## Features

- **Driver Dashboard**: Real-time view of student attendance status and stop notifications.
- **Student / Parent Portal**: Quick toggle to notify driver of absence.
- **Real-Time Updates**: Powered by Supabase real-time subscriptions.
- **Responsive & Modern UI**: Built with Next.js and optimized for mobile and desktop screens.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database & Realtime**: Supabase
- **Styling**: Modern Vanilla CSS

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Supabase account & project

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ayushkatara46-stack/RoutePing.git
   cd RoutePing
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.local.example` to `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
