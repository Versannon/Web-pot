# Webpot: Google Sheets + Apps Script + Firebase Integration Guide

This guide explains how to set up your website using **Firebase Hosting** for the frontend and **Google Sheets + Apps Script** for backend data storage and email handling. This solution is free for small/medium projects and works 24/7.

---

## 1. Overview
- **Frontend:** Hosted on Firebase (HTML, CSS, JS)
- **Backend:** Google Apps Script Web App (handles form submissions, writes to Google Sheets, sends emails)
- **Database:** Google Sheets
- **Email:** Sent via Apps Script (Gmail API)

---

## 2. Step-by-Step Setup

### A. Prepare Google Sheet
1. Create a new Google Sheet (e.g., `Webpot Orders`).
2. Add column headers (e.g., Name, Email, Service, Message, Timestamp).

### B. Create Apps Script Backend
1. In your Google Sheet, go to **Extensions > Apps Script**.
2. Replace the default code with a script that:
   - Accepts POST requests (doPost)
   - Writes data to the sheet
   - Sends an email notification
3. Example Apps Script:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.name, data.email, data.service, data.message, new Date()
  ]);
  // Send email
  MailApp.sendEmail({
    to: 'your@email.com',
    subject: 'New Webpot Order',
    htmlBody: '<b>Name:</b> ' + data.name + '<br><b>Email:</b> ' + data.email + '<br><b>Service:</b> ' + data.service + '<br><b>Message:</b> ' + data.message
  });
  return ContentService.createTextOutput('Success').setMimeType(ContentService.MimeType.TEXT);
}
```

4. Save and **Deploy > New deployment**
   - Select **Web app**
   - Set access to **Anyone**
   - Copy the Web App URL

### C. Update Your Website (Frontend)
1. In your JS (e.g., `script.js`), send form data to the Apps Script Web App URL:

```javascript
fetch('YOUR_APPS_SCRIPT_WEB_APP_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: nameValue,
    email: emailValue,
    service: serviceValue,
    message: messageValue
  })
})
.then(res => res.text())
.then(data => { /* show success message */ })
.catch(err => { /* show error */ });
```

2. Make sure your form calls this JS on submit.

### D. Host Frontend on Firebase
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run `firebase login` and `firebase init` (choose Hosting, set `public` folder, etc.)
3. Place your website files in the `public` folder.
4. Deploy: `firebase deploy`

---

## 3. Important Notes
- **CORS:** Apps Script Web App must allow requests from your domain. Add this to your Apps Script:

```javascript
return ContentService.createTextOutput('Success')
  .setMimeType(ContentService.MimeType.TEXT)
  .setHeader('Access-Control-Allow-Origin', '*');
```
- **Quotas:** Google Apps Script has daily limits (emails, script runs). Fine for most small sites.
- **Security:** Do not expose sensitive logic in frontend. Validate/sanitize input in Apps Script.
- **Testing:** Test form submission and email delivery after deployment.

---

## 4. Troubleshooting
- If emails are not sent, check Apps Script quotas and permissions.
- If data is not written, check sheet name and column order.
- If CORS errors, ensure correct headers and deployment access.

---

## 5. Resources
- [Google Apps Script Web Apps](https://developers.google.com/apps-script/guides/web)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Apps Script Quotas](https://developers.google.com/apps-script/guides/services/quotas)

---

**You now have a free, reliable, and scalable web app with database and email handling!**
