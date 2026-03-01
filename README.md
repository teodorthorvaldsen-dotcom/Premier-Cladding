# All-Cladding-Solutions

A Next.js web application for configuring and requesting quotes for fire-rated ACM (Aluminum Composite Material) panels.

## Features

- **Panel Configurator**: Configure ACM panels with custom sizes, thicknesses, colors, and finishes
- **Real-time Pricing**: Automatic price calculation with volume discounts
- **Quote Requests**: Submit quote requests with drawings and project details
- **Consultation**: Upload plans for panel consultation and recommendations
- **Project Gallery**: View featured ACM panel projects

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Email**: Resend API

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your values:
     ```
     RESEND_API_KEY=your_resend_api_key
     BUSINESS_EMAIL=quotes@yourcompany.com
     EMAIL_FROM=onboarding@resend.dev
     ADMIN_PASSWORD=your_admin_password
     ```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub** (if not already):
   - Create a new repository on GitHub
   - Initialize git in your project:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/yourusername/your-repo-name.git
     git push -u origin main
     ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in (GitHub account recommended)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - **Add Environment Variables**:
     - `RESEND_API_KEY`
     - `BUSINESS_EMAIL`
     - `EMAIL_FROM`
     - `ADMIN_PASSWORD` (optional, for admin page)
   - Click "Deploy"
   - Your site will be live at `your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts and add environment variables when asked

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `RESEND_API_KEY` | API key from Resend.com for email delivery | Yes (for email) |
| `BUSINESS_EMAIL` | Email address where quote requests are sent | Yes (for email) |
| `EMAIL_FROM` | "From" address for outgoing emails | Yes (for email) |
| `ADMIN_PASSWORD` | Password for `/admin/quotes` page | Optional |

**Note**: Email functionality will work without these variables, but quote/consultation submissions won't send emails. The forms will still work and show success messages.

## Project Structure

```
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes (quote, contact, consultation)
│   │   ├── products/     # ACM panel configurator
│   │   ├── quote/        # Quote request page
│   │   └── ...
│   ├── components/       # React components
│   ├── data/            # Static data (colors, widths, etc.)
│   ├── lib/             # Utility functions (pricing, etc.)
│   └── types/           # TypeScript type definitions
├── public/              # Static assets (images, documents)
└── ...
```

## Features Overview

### Panel Configurator (`/products/acm-panels`)
- Select panel type (Basic, Premium)
- Choose thickness (4mm, 6mm)
- Configure width and length
- Select color and finish
- Set quantity
- Real-time price calculation

### Quote Request (`/quote`)
- Review configuration summary
- Upload drawings (PDF, PNG, JPG)
- Fill in contact and project details
- Accept pre-estimate agreement
- Submit for review

### Consultation (`/consultation`)
- Upload project plans
- Request design review or technical support
- Specify timeline and requirements

## Admin Features

- `/admin/quotes` - View submitted quote requests (requires `ADMIN_PASSWORD`)

## License

Private project - All rights reserved
