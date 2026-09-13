# Nemu α — visual interaction prototype

This is the first executable prototype for Nemu.

## Included now
- Deep-sea entrance / gate
- Home with "My Deep Room" and "Visit Partner"
- Two visually distinct fish rooms
- Tap-to-leave-ripple interaction
- Three gifts: Sea Bloom, Sleep Jelly, Ripple Tone
- Local persistence for placed gifts using localStorage
- Gentle daily visual variation
- Mobile-first layout / safe-area support
- No notifications, chat, feed, or manual mood selection

## Deliberately not included yet
- Authentication
- Pairing
- Firebase / cloud sync
- HealthKit
- Push notifications
- Store release setup
- Paid services

## Run locally
Any static server works. Example:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080 from the `nemu-alpha` directory.

## Next implementation milestone
After the world/feel is accepted:
1. Firebase Auth (email link or simple email/password)
2. 1-to-1 pairing
3. Two-room Firestore model
4. Cloud-synced gifts and visits
5. Netlify deployment
