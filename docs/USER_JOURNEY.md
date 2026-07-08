# User Journey

Amazing Crew TV Production

Project:
Event Ticketing & Event Management Platform

First Event:
THE ALTAR CALLED HOME

## Visitor Journey

1. Visitor lands on the homepage.
2. Visitor views the movie information.
3. Visitor watches the trailer (optional).
4. Visitor reads the synopsis.
5. Visitor views ticket categories.
6. Visitor selects ticket quantities.
7. Visitor reviews the shopping cart.
8. Visitor clicks "Continue".
9. Visitor enters buyer information.
10. Visitor enters attendee information.
11. Visitor reviews the order.
12. Visitor completes payment through Paystack.
13. Payment is verified.
14. Tickets are generated.
15. QR codes are generated.
16. Tickets are emailed.
17. Visitor downloads the tickets.
18. Visitor attends the premiere.
19. QR code is scanned at check-in.
20. Entry is granted.

## Event Day Journey

1. Attendee arrives at the venue.
2. Attendee presents the digital ticket.
3. Check-in Officer scans the QR code.
4. The system verifies the ticket.
5. The system confirms the ticket has not been used.
6. The system displays the seating zone.
7. The attendee is welcomed into the correct seating section.

## Event Manager Journey

1. Event Manager logs in.
2. Dashboard displays sales summary.
3. Dashboard displays ticket statistics.
4. Dashboard displays attendance statistics.
5. Manager searches for attendees if needed.
6. Manager exports reports after the event.

## Super Admin Journey

1. Super Admin logs in.
2. Reviews overall dashboard.
3. Updates event information if required.
4. Monitors ticket sales.
5. Monitors revenue.
6. Manages administrator accounts.
7. Reviews reports after the event.

## Check-in Officer Journey

1. Officer logs in.
2. Opens the QR scanner.
3. Scans attendee ticket.
4. Views attendee details.
5. Confirms the ticket is valid.
6. Marks attendee as checked in.
7. Directs attendee to the correct seating zone.

## Error Scenarios

### Payment Fails

- Display an error message.
- Allow the user to try payment again.

### Duplicate Ticket Scan

- Display "Ticket Already Used".
- Prevent a second check-in.

### Invalid QR Code

- Display "Invalid Ticket".

### Internet Connection Lost

- Inform the user.
- Allow the process to continue when the connection returns.

Visitor
   │
   ▼
Homepage
   │
   ▼
Ticket Selection
   │
   ▼
Shopping Cart
   │
   ▼
Buyer Information
   │
   ▼
Attendee Information
   │
   ▼
Order Review
   │
   ▼
Paystack Payment
   │
   ▼
Payment Verification
   │
   ▼
Ticket Generation
   │
   ▼
Email Delivery
   │
   ▼
Ticket Download
   │
   ▼
Event Check-in