# Non-Functional Requirements

Amazing Crew TV Production

Project:
Event Ticketing & Event Management Platform

First Event:
THE ALTAR CALLED HOME

## 1. Performance

The system shall:

- Load the landing page within 3 seconds.
- Display ticket information instantly after selection.
- Complete payment verification within 10 seconds.
- Generate tickets within 5 seconds after payment.
- Allow QR verification in under 2 seconds.

## 2. Security

The system shall:

- Use HTTPS for all communication.
- Verify every Paystack payment before generating tickets.
- Prevent duplicate ticket generation.
- Prevent duplicate check-ins.
- Protect administrator accounts with authentication.
- Never expose secret API keys in the browser.

## 3. Reliability

The system shall:

- Be available throughout ticket sales.
- Save successful payments even if the user closes the browser.
- Recover gracefully from temporary network interruptions.

## 4. Usability

The system shall:

- Work on desktop computers.
- Work on tablets.
- Work on mobile phones.
- Provide clear error messages.
- Have a simple checkout process.

## 5. Scalability

The system shall:

- Support future events without major code changes.
- Support additional ticket categories.
- Support multiple administrators.

## 6. Maintainability

The system shall:

- Use a modular folder structure.
- Use descriptive file names.
- Include comments where necessary.
- Be easy to update for future events.

## 7. Accessibility

The system shall:

- Use readable font sizes.
- Provide sufficient color contrast.
- Support keyboard navigation where appropriate.
- Include alternative text for important images.

## 8. Compatibility

The system shall work correctly on:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari

## 9. Backup and Recovery

The system shall:

- Store ticket and order data in Firestore.
- Allow administrators to export attendee data.
- Preserve ticket records for future reference.

## 10. Quality Standards

The platform shall:

- Be responsive.
- Be secure.
- Be reliable.
- Be reusable.
- Be easy to maintain.
- Provide a professional user experience.

