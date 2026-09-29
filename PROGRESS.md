# Progress log

Newest first. Each entry is a version you can open at the preview link.

## 2026-09-29 — Version 5: chat

- "Chat with us" button bottom-left opens a counter bot. It answers about hours (live, from the
  clock), the full menu and prices, tonight's special, the address, booking rules, pickup and
  delivery, and can add items straight to the order tray from the conversation.
- Quick-reply chips, typing indicator, conversation kept for the visit, full-screen on phones.
- It will not guess at allergens or policies it does not know; it hands those to the phone number.
- Optional upgrade in `server/`: a small Cloudflare Worker that answers with Claude, with the
  page falling back to the built-in bot if the server is unavailable.

## 2026-09-29 — Version 4: phone layout pass

- Audited at a real phone size (390×844) with frames every 8% of the scroll.
- Fixed content that ran past the right edge (grid columns and one heading accent).
- The travelling burger now docks as a small 3D companion in the bottom-right corner between
  sections on phones, mostly clear of the reading area, then flies into its landing ring.
- Compact "Open / Closed" pill in the phone nav; bigger tap targets on Add and quantity buttons.
- Tighter section spacing, full-width buttons, larger hero type, and the closing headline no
  longer overlaps itself on small screens.
- Lighter effects on touch devices to keep scrolling smooth.

## 2026-09-29 — Version 3: Ritual Eats branding

- Logo added to the loading screen, navigation and footer (cut out from the supplied file so it
  sits on dark backgrounds).
- Colours switched to the brand cream and rust. Buttons, ribbon, cursor and avatars use the rust;
  text uses the cream.
- Headings changed to a serif that matches the "RITUAL" lettering, with handwritten accent words
  echoing "eats".
- All previous working-title copy replaced; signature burger renamed The Ritual Classic.

## 2026-09-29 — Version 2: 3D travelling burger and more motion

- The hero burger became one element that follows the scroll through every section and lands in
  a ring beside the final call to action. It tilts in 3D, follows the mouse, and carries a shadow,
  orbit ring, steam and a light sheen.
- Ingredients tumble down behind the content in 3D.
- Headings flip up word by word; cards, menu slices and steps swing in on a perspective hinge;
  photos wipe in; buttons are magnetic; cards tilt on hover.
- Second ribbon added before the hours section.

## 2026-09-29 — Version 1: first build

- Full page structure, ten generated photos, animated loading screen, sticky navigation.
- Live open/closed status, hours table, tonight's special by weekday.
- Order basket with pickup/delivery and a demo checkout; booth booking form.
- Works on phone and desktop; animations switch off for visitors who prefer reduced motion.

## Open items

See the table in [README.md](README.md). None of them block the design review.
