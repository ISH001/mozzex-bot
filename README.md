# ⚡ Mozzex Official Discord Bot & Server Suite

Engineered specifically for the **Mozzex Memecoin Trading Community & Capital Network**.

---

## 🌟 Key Features

1. **📢 Professional Embed Publisher**
   - Automatically publishes branded, high-conversion embeds to:
     - `#server-rules`: Security, anti-drainer policy, no-DM rule, trading risk disclaimers.
     - `#announcements`: Server roadmap and community navigation.
     - `#trading-mentorship`: On-chain sniping, risk management, and funded capital breakdown with 1-click apply button.
     - `#support-desk`: Interactive ticket system panel with "📩 Open Support Ticket" button.
     - `#important-info`: Client Capital allocation parameters and profit split guidelines.
     - `#vouches`: Official rep format and trust guidelines.
     - `#client-support`: Priority desk for funded traders and partners.

2. **📊 Invite Tracker System**
   - Tracks member joins in real-time.
   - Detects used invite codes, logs the inviter, and prevents duplicate/fake account spam.
   - `/invites [user]`: Comprehensive statistics (Total, Leaves, Fakes, Net).
   - `/topinvites`: Real-time community leaderboard for top inviters.

3. **👋 Welcome & Auto-Role**
   - Welcomes newcomers in `#introductions` (or `#welcome`) with their avatar, member count, and who invited them.
   - Automatically gives the `@Member` / `@Trader` role upon joining.

4. **🎫 Interactive Ticket System**
   - Spawns private channels (`ticket-username`) under `🎫 TICKETS` category.
   - Restricts channel visibility so only the creator and staff can read and talk.
   - Interactive buttons: **🔒 Close Ticket** and **🙋 Claim Ticket**.

5. **🔍 Memecoin Trading Utilities**
   - `/scan <address>`: Real-time DexScreener token analytics (Price, FDV, Liquidity, 5m/1h/24h volume, buy ratio) + 1-click trade links (BullX, Photon, DexScreener, Rugcheck).
   - `/call <address> <entry_mc>`: Official alpha callout formatting for signal channels.
   - `/pnl <token> <profit_sol> <roi_pct>`: Flex card generator for `#profits-and-milestones`.
   - `/vouch <trader> <rating> <comment>`: Permanent community reputation engine.

6. **🛡️ 1-Click Role & Permission Fixer**
   - Enforces read-only permissions on informational channels.
   - Locks down `👑 MEMBERS` (Premium) to VIP roles only.
   - Strictly hides `⚙️ STAFF HQ` from `@everyone`.
   - Protects against `@everyone` mention raids.

---

## 🚀 Quick Start Guide

### 1. Credentials Configuration
Edit `.env` inside `mozzex-bot/`:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_mozzex_server_id_here
```

> **Important**: In the [Discord Developer Portal](https://discord.com/developers/applications):
> Under **Bot** > **Privileged Gateway Intents**, enable:
> - ✅ **Presence Intent**
> - ✅ **Server Members Intent** (Required for Welcome & Auto-Role)
> - ✅ **Message Content Intent**

### 2. Register Slash Commands
Double-click `deploy-commands.bat` or run:
```bash
node deploy-commands.js
```

### 3. Send All Professional Embeds
Double-click `publish-embeds.bat` or run:
```bash
node scripts/publish-embeds.js
```

### 4. Lock Roles & Permissions
Double-click `fix-permissions.bat` or run:
```bash
node scripts/fix-permissions.js
```

### 5. Start The Bot
Double-click `start-bot.bat` or run:
```bash
node index.js
```
