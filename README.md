# Floral RSVP Web Application - Celebration for Angela-Maria Farhat

A single-page client-side floral invitation web application hosted on **GitHub Pages**, backed by **Google Sheets** via a **Google Apps Script** serverless Web App.

---

## 🌸 Table of Contents
1. [Project Overview](#project-overview)
2. [File Structure](#file-structure)
3. [Step 1: Setting Up Google Sheets & Google Apps Script](#step-1-setting-up-google-sheets--google-apps-script)
4. [Step 2: Connecting Apps Script to script.js](#step-2-connecting-apps-script-to-scriptjs)
5. [Step 3: GitHub & Git Setup Guide (Pushing Code & Creating Branches)](#step-3-github--git-setup-guide-pushing-code--creating-branches)
6. [Step 4: Publishing via GitHub Pages](#step-4-publishing-via-github-pages)

---

## 📌 Project Overview

- **Landing View (Page 1)**: Floral welcome screen where guests enter their name.
- **Invitation View (Page 2)**: Personalized party details for Angela-Maria Farhat with "Attending" and "Declining" options.
- **Confirmation View (Page 3)**: Thank you card with customized attendance confirmation.
- **Database Backend**: Submissions log automatically into Google Sheets (Timestamp, Name, Status) via Google Apps Script POST requests.

---

## 📁 File Structure

```text
Invitation/
├── index.html          # HTML structure for all 3 views
├── style.css           # Floral design system, animations, glassmorphism card UI
├── script.js           # SPA state management, view switcher, Apps Script fetch API
├── floral_header.png   # Generated watercolor floral artwork header
└── README.md           # Documentation & step-by-step setup guide
```

---

## 🛠️ Step 1: Setting Up Google Sheets & Google Apps Script

Follow these steps to create your free serverless database:

### 1. Create the Google Sheet
1. Open [Google Sheets](https://sheets.google.com) and create a **Blank Spreadsheet**.
2. Name your spreadsheet: `Angela-Maria Farhat RSVP Responses`.
3. In **Row 1**, set up the following headers in columns A, B, and C:
   - **Column A**: `Timestamp`
   - **Column B**: `Guest Name`
   - **Column C**: `RSVP Status`

### 2. Open the Apps Script Editor
1. In your Google Sheet menu bar, click **Extensions** ➔ **Apps Script**.
2. Clear any existing code in `Code.gs` and paste the following bulletproof JavaScript function:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var timestamp = data.timestamp || new Date().toLocaleString();
    var name = data.name || "Unknown Guest";
    var status = data.status || "No Response";

    // Append row: [Timestamp, Guest Name, RSVP Status]
    sheet.appendRow([timestamp, name, status]);

    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 3. Deploy as a Web App (CRITICAL SETTINGS)
1. Click the blue **Deploy** button at the top right ➔ Select **New deployment** (or **Manage deployments** if editing).
2. Click the gear icon next to *Select type* ➔ Select **Web app**.
3. Configure these exact settings:
   - **Description**: `RSVP Web App API`
   - **Execute as**: `Me (your email)`
   - **Who has access**: **`Anyone`** ⚠️ *(MUST be set to "Anyone", NOT "Only myself" or "Anyone with Google account", otherwise it blocks requests with a 403 Forbidden error!)*
4. Click **Deploy**.
5. Click **Authorize access** and allow permissions if prompted.
6. **Copy the Web App URL** (ends in `/exec`).

> [!IMPORTANT]
> **Updating Existing Deployments**:
> Whenever you edit code in Google Apps Script, you MUST go to **Deploy** ➔ **Manage deployments** ➔ Click the **Pencil (Edit)** icon ➔ Change **Version** to **`New version`** ➔ Click **Deploy**. Updating code alone will NOT update the live web app!


---

## 🔗 Step 2: Connecting Apps Script to script.js

1. Open `script.js` in your editor.
2. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` at the top of `script.js` with your copied Web App URL:

```javascript
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';
```

---

## 🚀 Step 3: GitHub & Git Setup Guide (Pushing Code & Creating Branches)

Here is your complete workflow guide for setting up GitHub, initializing Git, creating feature branches, and pushing your code.

### 1. Set Up GitHub Account & Create Repository
1. Sign up or log in at [GitHub.com](https://github.com).
2. Click the **`+`** icon at the top right ➔ **New repository**.
3. Name your repository: `invitation` (or `angela-farhat-rsvp`).
4. Set visibility to **Public** (required for free GitHub Pages).
5. Leave "Add a README file" unchecked (since we already created one locally).
6. Click **Create repository**.

### 2. Initialize Git Locally & Make First Commit
Open your Terminal or PowerShell in your project folder (`Invitation`) and run:

```bash
# 1. Initialize Git in the project folder
git init

# 2. Add all project files to Git staging
git add .

# 3. Create your first commit
git commit -m "Initial commit: Floral RSVP app structure and documentation"

# 4. Rename the default branch to 'main'
git branch -M main

# 5. Link your local repository to your GitHub repository
# (Replace YOUR-USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/invitation.git

# 6. Push your code to GitHub
git push -u origin main
```

---

### 🌿 Git Branching Workflow (How to Make Future Changes Safely)

Whenever you want to modify code (e.g. change colors, fix text, or add new features), follow this best-practice branching workflow:

#### Step A: Create a New Feature Branch
Before modifying files, create and switch to a new branch:

```bash
# Create and switch to a branch named 'feature/styling-update'
git checkout -b feature/styling-update
```

#### Step B: Make Your Edits & Test Locally
Edit `index.html`, `style.css`, or `script.js` as desired.

#### Step C: Stage & Commit Your Changes
```bash
# Check modified files
git status

# Stage the changed files
git add .

# Commit with a descriptive message
git commit -m "Enhance floral button styles and responsive padding"
```

#### Step D: Push Branch to GitHub
```bash
git push -u origin feature/styling-update
```

#### Step E: Merge into Main Branch
1. Go to your GitHub repository on `github.com`.
2. Click **Compare & pull request** ➔ **Create pull request**.
3. Click **Merge pull request** ➔ **Confirm merge**.
4. Back in your local terminal, switch to `main` and pull the latest changes:
```bash
git checkout main
git pull origin main
```

---

## 🌐 Step 4: Publishing via GitHub Pages

1. Navigate to your repository on GitHub: `https://github.com/YOUR-USERNAME/invitation`.
2. Click **Settings** (top navigation bar).
3. On the left sidebar, click **Pages**.
4. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`.
   - **Branch**: Select `main` / `/(root)` ➔ Click **Save**.
5. Wait 1–2 minutes. Refresh the page to see your live URL:
   `https://YOUR-USERNAME.github.io/invitation/`

🎉 **Congratulations!** Your floral RSVP website for Angela-Maria Farhat is now live and writing responses directly to your Google Sheet!
