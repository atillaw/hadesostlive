# Kick Subscriber Listener

This edge function listens to Kick.com WebSocket events for new subscribers and gifted subscriptions.

## Security Configuration

**Required Setup:**

This function now requires webhook authentication to prevent unauthorized access.

1. Add a secret to your Supabase project:
   - Go to your backend settings
   - Add a new secret: `KICK_WEBHOOK_SECRET`
   - Set it to a strong random value (e.g., `openssl rand -hex 32`)

2. Configure your client to send the secret:
   ```typescript
   const ws = new WebSocket(`${SUPABASE_URL}/functions/v1/kick-subscriber-listener`, {
     headers: {
       'x-webhook-secret': 'your-secret-here'
     }
   });
   ```

## How it works

1. Connects to Kick's Pusher WebSocket API
2. Listens for subscription and gift events
3. Validates incoming connections with webhook secret
4. Validates subscriber data before database insert
5. Stores subscriber information in the `kick_subscribers` table
6. Sends real-time updates to connected clients

## Security Features

- ✅ Webhook secret validation
- ✅ Input validation for subscriber data
- ✅ Audit logging of events
- ✅ Unauthorized access tracking
