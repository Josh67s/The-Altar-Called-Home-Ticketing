# User Roles & Permissions

Amazing Crew TV Production

Project:
Event Ticketing & Event Management Platform

First Event:
THE ALTAR CALLED HOME

## Visitor

Visitors can:

- View the homepage
- Watch the trailer
- View ticket prices
- Purchase one or more tickets
- Enter attendee information
- Pay online
- Download purchased tickets
- Receive tickets by email

Visitors cannot:

- Access the admin dashboard
- Scan tickets
- View attendee lists
- View sales reports
- Modify ticket information

## Check-in Officer

Check-in Officers can:

- Log into the check-in portal
- Search for tickets
- Scan QR codes
- Verify ticket validity
- Mark attendees as checked in

Check-in Officers cannot:

- Change ticket prices
- Delete tickets
- View revenue
- Manage administrators
- Modify event settings

## Event Manager

Event Managers can:

- View all orders
- View all attendees
- Search tickets
- Resend tickets
- View ticket sales
- View attendance statistics
- Export attendee lists

Event Managers cannot:

- Delete administrators
- Change system settings
- Remove the Super Admin

## Super Admin

The Super Admin can:

- Perform all Event Manager actions
- Create administrator accounts
- Remove administrator accounts
- Manage check-in officer accounts
- Configure ticket categories
- Configure ticket prices
- Update event details
- View financial reports
- Manage platform settings

## Authentication Strategy

Visitors:

- No login required

Check-in Officers:

- Email and password login

Event Managers:

- Email and password login

Super Admin:

- Email and password login

| Action | Visitor | Check-in | Event Manager | Super Admin |
|--------|:-------:|:--------:|:-------------:|:-----------:|
| Buy Tickets | ✅ | ❌ | ❌ | ❌ |
| Download Tickets | ✅ | ❌ | ❌ | ❌ |
| Scan QR Codes | ❌ | ✅ | ✅ | ✅ |
| View Orders | ❌ | ❌ | ✅ | ✅ |
| Export Attendees | ❌ | ❌ | ✅ | ✅ |
| Manage Ticket Prices | ❌ | ❌ | ❌ | ✅ |
| Manage Event Settings | ❌ | ❌ | ❌ | ✅ |
| View Revenue | ❌ | ❌ | ✅ | ✅ |
| Create Admin Accounts | ❌ | ❌ | ❌ | ✅ |

## Future Roles

The platform should support additional roles in future, such as:

- Volunteer Coordinator
- Finance Officer
- Customer Support
- Content Manager
- Technical Administrator