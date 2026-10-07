# PPTech Computer & Cyber — Second-Hand Laptop Manager

A simple, responsive laptop inventory and sales dashboard that can be hosted as a static website on GitHub Pages.

## Features
- Dashboard: stock, monthly sales, revenue, profit
- Monthly sales/revenue charts
- Best-selling brand chart
- Inventory CRUD
- Sales recording
- Customer summary
- EMI provider field
- Warranty field
- Profit calculation
- Sales CSV export
- JSON backup/restore
- Mobile responsive
- No server required

## Important
This version stores data in the browser's `localStorage`. GitHub Pages hosts the application files, but it does NOT provide a shared database.

That means:
- Data is saved only in the browser/device where you use the app.
- If you clear browser data, the records can be lost.
- Use **Export Backup** regularly.
- If multiple staff members need to use the same live database, connect this frontend to Supabase/Firebase or another backend.

## GitHub Pages
1. Create a GitHub repository, e.g. `pptech-laptop-manager`.
2. Upload `index.html`, `style.css`, and `app.js`.
3. Open **Settings → Pages**.
4. Under Build and deployment choose **Deploy from a branch**.
5. Select `main` and `/root`.
6. Save and wait for GitHub Pages to publish.

The app will then be available at your GitHub Pages URL.

## Data entry
Add laptops from **+ Add Laptop**. When a laptop is sold, use **Record Sale**. The laptop automatically changes to Sold and profit is calculated as:

`Sale Price - (Purchase Price + Repair Cost + Other Cost)`
