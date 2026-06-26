# SakhiKit

A donation platform fighting period poverty in India. Verified NGOs list menstrual hygiene kit needs; donors sponsor kits one-time or as recurring subscriptions, with full transparency on impact.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Auth0 React SDK
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB Atlas
- **Auth:** Auth0 (RBAC with 3 roles)
- **Payments:** Stripe (one-time + subscriptions, webhook reconciliation)
- **Images:** Cloudinary
- **Email:** Resend
- **Maps:** Leaflet

## Project Structure

\`\`\`
sakhikit/
├── sakhikit-client/    # React + Vite frontend
└── sakhikit-server/    # Express + Mongoose backend
\`\`\`

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Auth0 account
- Stripe account (test mode)

### Setup

\`\`\`bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/sakhikit.git
cd sakhikit

# Install client
cd sakhikit-client && npm install
cp .env.example .env
# Fill in your env values

# Install server (new terminal tab)
cd ../sakhikit-server && npm install
cp .env.example .env
# Fill in your env values
\`\`\`

### Run

\`\`\`bash
# Terminal 1
cd sakhikit-client && npm run dev

# Terminal 2
cd sakhikit-server && npm run dev
\`\`\`

## Status

🚧 In active development — placement portfolio project