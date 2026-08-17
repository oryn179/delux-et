# Implement Telegram-based OTP Verification

The goal is to implement a verification system where users receive a 6-digit OTP via a Telegram bot.

## Features

- **Telegram Integration**: Users provide their Telegram ID or username to receive codes.
- **OTP Generation**: A 6-digit code valid for 60 seconds.
- **Rate Limiting**: 7 failed attempts lead to a 1 hour and 30 minute suspension.
- **Telegram Bot**: A placeholder or connector for the Telegram bot to send the message.

## Technical Details

- **Database**: 
  - Update `profiles` or a new `otp_verifications` table to store:
    - `telegram_id`
    - `current_otp`
    - `otp_expires_at`
    - `failed_attempts`
    - `suspended_until`
- **Edge Function**: Create an edge function `send-telegram-otp` to:
  - Generate the code.
  - Send the message via Telegram Bot API (requires `TELEGRAM_BOT_TOKEN` secret).
  - Manage expiration and attempt counts.
- **Frontend**: 
  - Add a Telegram verification step to the authentication or profile verification flow.
  - Implement the timer (60s) and error handling for suspension.
