# Forge reference implementation

Reference: https://playful-data-072305.framer.app/
Template information: https://www.framer.com/marketplace/templates/forge-fitness/

Rebuilt in the existing React/Vite public entry. No Framer subscription or Framer runtime.
Inspected the reference in-browser: black background, #fa5407 accent, Oswald headings, Public Sans body, JetBrains Mono labels, Bebas Neue wordmark. Matched full-screen media hero, centered two-line heading, four-column process, three photo panels, split coach profile, dark carousel cards, centered FAQ, two coaching panels and footer.

Original Anto copy and user-supplied media replace the template's sample people, outcomes, prices and testimonials. No invented statistics, testimonials or prices. Existing evaluation and WhatsApp flow preserved. Private app remains separate.

Hero uses user's outdoor training video, muted, looping and with a pause control; reduced-motion preference prevents autoplay. Dumbbell cutout appears in the training panel, not the hero. Cutout created with built-in image_gen from _DSC6390.jpg.jpeg: remove studio background only, preserve woman, clothing, pose and dumbbell, transparent PNG.

Verified: production build; desktop composition; 390 px viewport without horizontal overflow; video playback/pause; mobile menu; FAQ; meal carousel; evaluation navigation.
