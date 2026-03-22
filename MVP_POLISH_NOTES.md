SmartAsset AI MVP polish

What was improved
- Premium visual refresh for the global design system in src/index.css
- Stronger banking-style app shell in src/components/layouts/AppLayout.tsx
- High-end login / onboarding screen in src/pages/Login.tsx
- Demo-friendly executive dashboard in src/pages/Dashboard.tsx
- Cleaner asset workspace with metrics, filters, and polished create dialog in src/pages/Assets.tsx
- Cleaner employee registry with metrics and improved create flow in src/pages/Employees.tsx

What still needs to be done on your side
1. Install dependencies locally with pnpm install
2. Confirm Supabase env values in .env
3. Run the app with your normal local flow
4. Seed the DB if needed with supabase/seed.sql
5. If any component-specific type issue appears, run lint/build once locally and fix the small import/type mismatch

Main demo flow
1. Login or sign up
2. Create an employee
3. Create an asset with image
4. Open asset detail
5. Assign the asset
6. Verify it and show history / QR / intelligence

Recommended next improvements
- Add edit/delete actions for employees and assets
- Add empty-state illustrations
- Add a dedicated risk insights page
- Add branch-level analytics cards
- Add deploy-ready environment checklist in README
