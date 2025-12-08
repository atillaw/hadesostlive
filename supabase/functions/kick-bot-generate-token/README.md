# Kick Chat Bot - HadesOST Bağlantı Sistemi

Bu belge, Kick chat botunun HadesOST sitesiyle entegrasyonunu açıklar.

## Gerekli Secret

Bot için `KICK_BOT_SECRET` secret'ını Supabase'e eklemeniz gerekiyor.

## API Endpoints

### 1. Token Üretme (Bot Tarafı)
**Endpoint:** `POST /functions/v1/kick-bot-generate-token`

Bot, bir kullanıcı `!connect` yazdığında bu endpoint'i çağırır.

**Headers:**
```
x-bot-secret: YOUR_KICK_BOT_SECRET
Content-Type: application/json
```

**Request Body:**
```json
{
  "kick_user_id": "12345",
  "kick_username": "kullanici_adi",
  "kick_display_name": "Kullanıcı Adı",
  "kick_avatar_url": "https://...",
  "kick_channel_slug": "kullanici_adi",
  "kick_data": {
    "is_follower": true,
    "followed_at": "2024-01-15T10:00:00Z",
    "is_subscriber": true,
    "subscription_tier": "Tier 1",
    "subscribed_at": "2024-06-01T10:00:00Z",
    "subscription_months": 6,
    "is_moderator": false,
    "is_vip": true,
    "is_og": false,
    "is_founder": false,
    "badges": [
      {"type": "subscriber", "text": "6 Month Subscriber"},
      {"type": "vip", "text": "VIP"}
    ]
  }
}
```

**Response:**
```json
{
  "token": "ABC12XYZ",
  "expires_in": 600,
  "message": "Token: ABC12XYZ - 10 dakika içinde hadesost.uk/kullanici-ayarlari adresine gidip bu kodu gir!"
}
```

### 2. Kullanıcı Verisi Senkronizasyonu (Bot Tarafı)
**Endpoint:** `POST /functions/v1/kick-bot-sync-user`

Bot, kullanıcı verilerini güncellemek için bu endpoint'i çağırır.

**Headers:**
```
x-bot-secret: YOUR_KICK_BOT_SECRET
Content-Type: application/json
```

**Request Body:**
```json
{
  "kick_user_id": "12345",
  "kick_username": "kullanici_adi",
  "kick_data": {
    "is_subscriber": true,
    "subscription_tier": "Tier 2",
    "subscription_months": 7,
    "badges": [...]
  }
}
```

### 3. Toplu Senkronizasyon (Bot Tarafı)
**Endpoint:** `POST /functions/v1/kick-bot-bulk-sync`

Bot, birden fazla kullanıcıyı aynı anda senkronize edebilir.

**Request Body:**
```json
{
  "users": [
    {
      "kick_user_id": "12345",
      "kick_username": "kullanici1",
      "kick_data": {...}
    },
    {
      "kick_user_id": "67890",
      "kick_username": "kullanici2",
      "kick_data": {...}
    }
  ]
}
```

## Örnek Bot Kodu (Node.js)

```javascript
const SUPABASE_URL = 'https://txinupgxlqagjyshvxty.supabase.co';
const BOT_SECRET = process.env.KICK_BOT_SECRET;

// !connect komutu için
async function handleConnectCommand(kickUser) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/kick-bot-generate-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-bot-secret': BOT_SECRET
    },
    body: JSON.stringify({
      kick_user_id: kickUser.id.toString(),
      kick_username: kickUser.username,
      kick_display_name: kickUser.displayName,
      kick_avatar_url: kickUser.avatarUrl,
      kick_channel_slug: kickUser.channelSlug,
      kick_data: {
        is_follower: kickUser.isFollower,
        followed_at: kickUser.followedAt,
        is_subscriber: kickUser.isSubscriber,
        subscription_tier: kickUser.subscriptionTier,
        subscribed_at: kickUser.subscribedAt,
        subscription_months: kickUser.subscriptionMonths,
        is_moderator: kickUser.isModerator,
        is_vip: kickUser.isVip,
        is_og: kickUser.isOG,
        is_founder: kickUser.isFounder,
        badges: kickUser.badges
      }
    })
  });

  const data = await response.json();
  
  if (data.token) {
    // Chat'e mesaj gönder
    return `@${kickUser.username} 🔗 ${data.message}`;
  } else {
    return `@${kickUser.username} ❌ Bağlantı kodu oluşturulamadı. Lütfen tekrar deneyin.`;
  }
}

// Periyodik senkronizasyon için
async function syncAllConnectedUsers(users) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/kick-bot-bulk-sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-bot-secret': BOT_SECRET
    },
    body: JSON.stringify({ users })
  });

  return response.json();
}
```

## Güvenlik Notları

1. `KICK_BOT_SECRET` asla client-side'da kullanılmamalıdır
2. Token'lar 10 dakika sonra otomatik olarak expire olur
3. Her token sadece bir kez kullanılabilir
4. Aynı Kick hesabı birden fazla site hesabına bağlanamaz

## Veritabanı Şeması

### kick_connect_tokens
- `id`: UUID
- `kick_user_id`: TEXT
- `kick_username`: TEXT
- `kick_display_name`: TEXT
- `kick_avatar_url`: TEXT
- `kick_channel_slug`: TEXT
- `token`: TEXT (8 karakter, benzersiz)
- `is_used`: BOOLEAN
- `used_by_user_id`: UUID (FK -> auth.users)
- `used_at`: TIMESTAMP
- `expires_at`: TIMESTAMP (10 dakika)
- `kick_data`: JSONB

### kick_accounts (ek alanlar)
- `is_follower`: BOOLEAN
- `followed_at`: TIMESTAMP
- `is_subscriber`: BOOLEAN
- `subscription_tier`: TEXT
- `subscribed_at`: TIMESTAMP
- `subscription_months`: INTEGER
- `is_moderator`: BOOLEAN
- `is_vip`: BOOLEAN
- `is_og`: BOOLEAN
- `is_founder`: BOOLEAN
- `badges`: JSONB
- `verified_via`: TEXT ('oauth' veya 'bot')
- `last_synced_at`: TIMESTAMP
