# Google Sheets API Setup Guide

This guide will help you set up Google Sheets API integration for the pre-registration feature.

## Overview

The pre-registration feature saves user data (name, email, timestamp) to a Google Sheet when they submit the pre-registration form on the landing page.

## Prerequisites

- Google Account
- Access to Google Cloud Console
- The Google Sheet where you want to save the data

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter a project name (e.g., "Widest Life Pre-Registration")
5. Click "CREATE"

### 2. Enable Google Sheets API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and press "ENABLE"

### 3. Create a Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS" > "Service Account"
3. Enter a name (e.g., "pre-registration-service")
4. Click "CREATE AND CONTINUE"
5. Skip the optional steps by clicking "CONTINUE" and then "DONE"

### 4. Generate Service Account Key

1. In the "Credentials" page, find your service account under "Service Accounts"
2. Click on the service account email
3. Go to the "KEYS" tab
4. Click "ADD KEY" > "Create new key"
5. Choose "JSON" format
6. Click "CREATE"
7. A JSON file will be downloaded to your computer

### 5. Share Google Sheet with Service Account

1. Open the downloaded JSON file
2. Find and copy the `client_email` field (it looks like: `xxx@xxx.iam.gserviceaccount.com`)
3. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1ua3aAd-3Or5kBKDYTY4pgE98W5ZNBzaEiVtxIB8ApV4/edit
4. Click the "Share" button
5. Paste the service account email
6. Give it "Editor" access
7. Uncheck "Notify people"
8. Click "Share"

### 6. Configure Environment Variables

1. Open your backend `.env` file
2. From the downloaded JSON file, copy:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

Example:
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

**Important Notes:**
- Keep the private key in quotes
- Preserve the `\n` characters in the private key
- Never commit these credentials to version control

### 7. Prepare Your Google Sheet

1. Open your Google Sheet
2. Make sure Sheet1 (or your target sheet) has the following columns in Row 1:
   - Column A: Timestamp
   - Column B: Name
   - Column C: Email

Or the code will append to columns A, B, C automatically.

### 8. Test the Integration

1. Restart your backend server:
   ```bash
   cd backend
   npm run start:dev
   ```

2. Open your frontend and click the "Pre Register" button
3. Fill in the form and submit
4. Check your Google Sheet - you should see a new row with:
   - Timestamp
   - Name
   - Email

## Troubleshooting

### Error: "Unable to parse private key"
- Make sure the private key is wrapped in quotes
- Ensure all `\n` characters are preserved
- The key should start with `-----BEGIN PRIVATE KEY-----\n`

### Error: "The caller does not have permission"
- Make sure you shared the Google Sheet with the service account email
- Verify the email has "Editor" permissions
- Wait a few minutes after sharing for permissions to propagate

### Error: "Spreadsheet not found"
- Verify the SPREADSHEET_ID in the code matches your sheet
- The ID is in the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### No data appearing in the sheet
- Check the backend console logs for errors
- Verify the sheet name matches (default is "Sheet1")
- Make sure the Google Sheets API is enabled in your project

## Sheet Configuration

The current configuration appends data to `Sheet1!A:C`. If your sheet has a different name, update this line in `backend/src/modules/landing/landing.service.ts`:

```typescript
range: 'Sheet1!A:C', // Change 'Sheet1' to your sheet name
```

## Security Best Practices

1. **Never commit credentials**: Add `.env` to `.gitignore`
2. **Rotate keys periodically**: Generate new service account keys every 90 days
3. **Limit permissions**: Only give the service account access to necessary sheets
4. **Monitor usage**: Check Google Cloud Console for unexpected API usage

## Additional Resources

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Service Accounts Overview](https://cloud.google.com/iam/docs/service-accounts)
- [Google Cloud Console](https://console.cloud.google.com/)

## Support

If you encounter any issues, please check:
1. Backend server logs
2. Browser console for frontend errors
3. Google Cloud Console for API errors
