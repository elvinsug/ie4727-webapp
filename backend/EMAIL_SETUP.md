# Email Setup Guide

The application now uses a custom SMTP email helper to send purchase confirmation emails.

## Quick Setup

### Option 1: Using Gmail (Recommended for Testing)

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Enable 2-Step Verification on your Google Account:**
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

3. **Generate an App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

4. **Update the `.env` file:**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   SMTP_FROM_EMAIL=your-email@gmail.com
   SMTP_FROM_NAME=MIONA
   ```

### Option 2: Using Other SMTP Providers

**Outlook/Hotmail:**
```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USERNAME=your-email@outlook.com
SMTP_PASSWORD=your-password
```

**Yahoo:**
```
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USERNAME=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
```

**SendGrid (For Production):**
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### Option 3: No SMTP (Fallback)

If you don't configure SMTP credentials, the system will:
1. Try to use PHP's `mail()` function (may not work on localhost)
2. Save emails to `backend/logs/emails/` as text files for testing

## Testing Email Functionality

After configuration:

1. Make a test purchase through the application
2. Check if the email was sent to the user's email address
3. If email fails, check `backend/logs/emails/` for the saved email content

## Troubleshooting

**Emails not sending:**
- Verify SMTP credentials are correct in `.env`
- Check that port 587 is not blocked by firewall
- Enable "Less secure app access" for Gmail (or use App Passwords)
- Check PHP error logs for SMTP connection errors

**Gmail-specific issues:**
- Make sure 2-Step Verification is enabled
- Use App Passwords instead of your regular password
- Check Gmail security alerts for blocked login attempts

**Email goes to spam:**
- This is common with test emails
- For production, use a proper SMTP service like SendGrid or Mailgun
- Configure SPF and DKIM records for your domain

## Files Modified

- `backend/api/EmailHelper.php` - Custom SMTP email class
- `backend/api/buy_product_options.php` - Updated to use EmailHelper
- `backend/load_env.php` - Environment variable loader
- `backend/.env.example` - Example configuration file

## Production Recommendations

For production use:
1. Use a dedicated email service (SendGrid, Mailgun, AWS SES)
2. Set up proper SPF, DKIM, and DMARC records
3. Use a verified domain email address
4. Monitor email delivery rates and bounce rates
