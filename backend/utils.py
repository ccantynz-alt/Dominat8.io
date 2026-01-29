import os
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from twilio.rest import Client
import logging
from datetime import datetime
import vobject
import uuid

# iCloud/CardDAV Configuration
ICLOUD_USERNAME = os.environ.get('ICLOUD_USERNAME', '')
ICLOUD_APP_PASSWORD = os.environ.get('ICLOUD_APP_PASSWORD', '')
CARDDAV_URL = "https://contacts.icloud.com"


# Booking Reference Generator
async def generate_booking_reference(db):
    """Generate booking reference starting from H1, H2, H3..."""
    try:
        # Get the last booking to determine next number
        last_booking = await db.bookings.find_one(
            {"booking_ref": {"$exists": True}},
            sort=[("createdAt", -1)]
        )
        
        if last_booking and 'booking_ref' in last_booking:
            # Extract number from H123 format
            last_num = int(last_booking['booking_ref'][1:])
            next_num = last_num + 1
        else:
            next_num = 1
        
        return f"H{next_num}"
    except Exception as e:
        logger.error(f"Error generating booking reference: {str(e)}")
        return "H1"

# iCloud Contact Sync via Email (more reliable than CardDAV)
def sync_contact_to_icloud(booking: dict):
    """Sync customer contact to iCloud/iPhone by emailing vCard to iCloud email"""
    try:
        # Create vCard
        vcard = vobject.vCard()
        
        # Parse name
        name_parts = booking.get('name', 'Customer').split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Add name
        vcard.add('n')
        vcard.n.value = vobject.vcard.Name(family=last_name, given=first_name)
        vcard.add('fn')
        vcard.fn.value = booking.get('name', 'Customer')
        
        # Add phone
        if booking.get('phone'):
            tel = vcard.add('tel')
            tel.value = booking.get('phone')
            tel.type_param = 'CELL'
        
        # Add email
        if booking.get('email'):
            email = vcard.add('email')
            email.value = booking.get('email')
            email.type_param = 'INTERNET'
        
        # Add booking info as note
        booking_ref = booking.get('booking_ref', 'N/A')
        booking_date = booking.get('date', 'N/A')
        note = f"Hibiscus to Airport Customer\nBooking: {booking_ref}\nDate: {booking_date}\nPickup: {booking.get('pickupAddress', 'N/A')}\nDropoff: {booking.get('dropoffAddress', 'N/A')}"
        
        vcard.add('note')
        vcard.note.value = note
        
        # Add organization
        vcard.add('org')
        vcard.org.value = ['Hibiscus to Airport - Customer']
        
        # Generate unique ID
        contact_uid = str(uuid.uuid4())
        vcard.add('uid')
        vcard.uid.value = contact_uid
        
        # Serialize to vCard format
        vcard_data = vcard.serialize()
        
        # Method 1: Try CardDAV first
        if ICLOUD_USERNAME and ICLOUD_APP_PASSWORD:
            try:
                carddav_endpoint = f"{CARDDAV_URL}/{ICLOUD_USERNAME}/carddavhome/card/{contact_uid}.vcf"
                
                response = requests.put(
                    carddav_endpoint,
                    auth=(ICLOUD_USERNAME, ICLOUD_APP_PASSWORD),
                    headers={
                        'Content-Type': 'text/vcard; charset=utf-8',
                    },
                    data=vcard_data,
                    timeout=30
                )
                
                if response.status_code in [200, 201, 204]:
                    logger.info(f"Contact synced to iCloud via CardDAV: {booking.get('name')} ({booking_ref})")
                    return True
            except Exception as e:
                logger.warning(f"CardDAV sync failed, trying email method: {str(e)}")
        
        # Method 2: Email vCard to iCloud email (opens as contact on iPhone)
        # Send vCard as email attachment to iCloud email
        icloud_email = f"{ICLOUD_USERNAME}@icloud.com" if ICLOUD_USERNAME else None
        
        if icloud_email:
            try:
                # Create email with vCard attachment
                from email.mime.multipart import MIMEMultipart
                from email.mime.text import MIMEText
                from email.mime.base import MIMEBase
                from email import encoders
                import smtplib
                
                msg = MIMEMultipart()
                msg['From'] = os.environ.get('SENDER_EMAIL', 'noreply@hibiscustoairport.co.nz')
                msg['To'] = icloud_email
                msg['Subject'] = f"New Customer Contact - {booking.get('name')} ({booking_ref})"
                
                body = f"New booking customer:\n\nName: {booking.get('name')}\nPhone: {booking.get('phone')}\nEmail: {booking.get('email')}\nBooking: {booking_ref}\n\nOpen the attached vCard to add to contacts."
                msg.attach(MIMEText(body, 'plain'))
                
                # Attach vCard
                vcard_attachment = MIMEBase('text', 'vcard', name=f"{booking.get('name', 'contact')}.vcf")
                vcard_attachment.set_payload(vcard_data)
                encoders.encode_base64(vcard_attachment)
                vcard_attachment.add_header('Content-Disposition', 'attachment', filename=f"{booking.get('name', 'contact')}.vcf")
                msg.attach(vcard_attachment)
                
                # Send via SMTP
                smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
                smtp_port = int(os.environ.get('SMTP_PORT', 587))
                smtp_user = os.environ.get('SMTP_USERNAME')
                smtp_pass = os.environ.get('SMTP_PASSWORD')
                
                with smtplib.SMTP(smtp_server, smtp_port) as server:
                    server.starttls()
                    server.login(smtp_user, smtp_pass)
                    server.send_message(msg)
                
                logger.info(f"Contact vCard emailed to iCloud: {booking.get('name')} ({booking_ref})")
                return True
                
            except Exception as email_error:
                logger.error(f"Failed to email vCard to iCloud: {str(email_error)}")
                return False
        
        return False
            
    except Exception as e:
        logger.error(f"Error syncing contact to iCloud: {str(e)}")
        return False

# Date Formatter
def format_date_nz(date_str):
    """Format date as DD/MM/YYYY (NZ format)"""
    try:
        if isinstance(date_str, str):
            date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        else:
            date_obj = date_str
        return date_obj.strftime('%d/%m/%Y')
    except Exception as e:
        logger.error(f"Error formatting date: {str(e)}")
        return date_str

def format_date_with_day(date_str):
    """Format date as DD/MM/YYYY (DayName) - e.g., 27/12/2025 (Saturday)"""
    try:
        if isinstance(date_str, str):
            date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        else:
            date_obj = date_str
        day_name = date_obj.strftime('%A')  # Full day name (Saturday, Sunday, etc.)
        date_formatted = date_obj.strftime('%d/%m/%Y')
        return f"{date_formatted} ({day_name})"
    except Exception as e:
        logger.error(f"Error formatting date with day: {str(e)}")
        return date_str

# Generate Calendar Invite
def generate_calendar_invite(booking: dict):
    """Generate iCal calendar invite for booking"""
    try:
        cal = Calendar()
        cal.add('prodid', '-//Hibiscus to Airport//Booking System//EN')
        cal.add('version', '2.0')
        
        event = Event()
        event.add('summary', f"Airport Transfer - {booking['name']}")
        event.add('description', 
            f"Booking Ref: {booking.get('booking_ref', 'N/A')}\n"
            f"Customer: {booking['name']}\n"
            f"Phone: {booking['phone']}\n"
            f"Pickup: {booking['pickupAddress']}\n"
            f"Dropoff: {booking['dropoffAddress']}\n"
            f"Passengers: {booking.get('passengers', 1)}\n"
            f"Notes: {booking.get('notes', 'N/A')}"
        )
        
        # Parse date and time
        booking_datetime = datetime.strptime(
            f"{booking['date']} {booking['time']}", 
            "%Y-%m-%d %H:%M"
        )
        nz_tz = timezone('Pacific/Auckland')
        booking_datetime = nz_tz.localize(booking_datetime)
        
        event.add('dtstart', booking_datetime)
        event.add('dtend', booking_datetime)  # Same time, can adjust duration if needed
        event.add('location', booking['pickupAddress'])
        
        cal.add_component(event)
        
        return cal.to_ical()
    except Exception as e:
        logger.error(f"Error generating calendar invite: {str(e)}")
        return None

from icalendar import Calendar, Event
from pytz import timezone

logger = logging.getLogger(__name__)

# Google Maps Distance Calculator
def calculate_distance(pickup: str, dropoff: str):
    """Calculate distance between two addresses using Google Distance Matrix API"""
    try:
        api_key = os.environ.get('GOOGLE_MAPS_API_KEY')
        url = f"https://maps.googleapis.com/maps/api/distancematrix/json"
        params = {
            'origins': pickup,
            'destinations': dropoff,
            'key': api_key,
            'units': 'metric'
        }
        
        response = requests.get(url, params=params)
        data = response.json()
        
        if data['status'] == 'OK' and data['rows'][0]['elements'][0]['status'] == 'OK':
            distance_meters = data['rows'][0]['elements'][0]['distance']['value']
            distance_km = distance_meters / 1000
            return round(distance_km, 2)
        else:
            logger.error(f"Google Maps API error: {data}")
            return None
    except Exception as e:
        logger.error(f"Error calculating distance: {str(e)}")
        return None

# Tiered Pricing Engine - Updated to match BookaRide exactly
def calculate_price(distance_km: float, passengers: int = 1, vip_pickup: bool = False, oversized_luggage: bool = False):
    """
    Calculate price based on distance bracket and passengers.
    
    IMPORTANT: The rate is based on TOTAL distance, not incremental.
    A 30km trip uses $5.00/km for the ENTIRE distance.
    
    Pricing tiers:
    - 0 - 15 km:      $12.00/km
    - 15 - 15.8 km:   $8.00/km
    - 15.8 - 16 km:   $6.00/km
    - 16 - 25.5 km:   $5.50/km
    - 25.5 - 35 km:   $5.00/km
    - 35 - 50 km:     $4.00/km
    - 50 - 60 km:     $2.60/km
    - 60 - 75 km:     $2.47/km
    - 75 - 100 km:    $2.70/km
    - 100+ km:        $3.50/km
    """
    
    # Determine rate based on TOTAL distance bracket (not incremental)
    if distance_km <= 15.0:
        rate_per_km = 12.00
    elif distance_km <= 15.8:
        rate_per_km = 8.00
    elif distance_km <= 16.0:
        rate_per_km = 6.00
    elif distance_km <= 25.5:
        rate_per_km = 5.50
    elif distance_km <= 35.0:
        rate_per_km = 5.00
    elif distance_km <= 50.0:
        rate_per_km = 4.00
    elif distance_km <= 60.0:
        rate_per_km = 2.60
    elif distance_km <= 75.0:
        rate_per_km = 2.47
    elif distance_km <= 100.0:
        rate_per_km = 2.70
    else:
        rate_per_km = 3.50
    
    # Calculate base price (total distance × rate)
    base_price = distance_km * rate_per_km
    
    # Additional fees
    passenger_fee = max(0, passengers - 1) * 5.00  # $5 per extra passenger
    airport_fee = 15.00 if vip_pickup else 0.00    # VIP airport pickup
    luggage_fee = 25.00 if oversized_luggage else 0.00  # Oversized luggage
    
    # Calculate total
    total_price = base_price + passenger_fee + airport_fee + luggage_fee
    
    # Apply minimum fare of $100
    if total_price < 100.0:
        total_price = 100.0
        base_price = 100.0 - passenger_fee - airport_fee - luggage_fee
    
    return {
        'distance': round(distance_km, 2),
        'basePrice': round(base_price, 2),
        'airportFee': round(airport_fee, 2),
        'passengerFee': round(passenger_fee, 2),
        'oversizedLuggageFee': round(luggage_fee, 2),
        'totalPrice': round(total_price, 2),
        'ratePerKm': rate_per_km
    }

# Email Notifications
def send_email(to_email: str, subject: str, body: str, calendar_invite=None):
    """Send email via Google Workspace SMTP with optional calendar invite"""
    try:
        smtp_server = os.environ.get('SMTP_SERVER')
        smtp_port = int(os.environ.get('SMTP_PORT', 587))
        smtp_username = os.environ.get('SMTP_USERNAME')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        sender_email = os.environ.get('SENDER_EMAIL')
        
        msg = MIMEMultipart('mixed')
        msg['From'] = sender_email
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # HTML body
        html_body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            {body}
          </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, 'html'))
        
        # Attach calendar invite if provided
        if calendar_invite:
            ical_part = MIMEBase('text', 'calendar', method='REQUEST', name='booking.ics')
            ical_part.set_payload(calendar_invite)
            encoders.encode_base64(ical_part)
            ical_part.add_header('Content-Disposition', 'attachment', filename='booking.ics')
            msg.attach(ical_part)
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        return False

# SMS Notifications
def send_sms(to_phone: str, message: str):
    """Send SMS via Twilio"""
    try:
        account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
        auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
        from_phone = os.environ.get('TWILIO_PHONE_NUMBER')
        
        client = Client(account_sid, auth_token)
        
        message = client.messages.create(
            body=message,
            from_=from_phone,
            to=to_phone
        )
        
        logger.info(f"SMS sent successfully to {to_phone}")
        return True
    except Exception as e:
        logger.error(f"Error sending SMS: {str(e)}")
        return False

# Customer Confirmation Email Template
def send_customer_confirmation(booking: dict):
    """Send premium booking confirmation email to customer"""
    booking_ref = booking.get('booking_ref', 'N/A')
    formatted_date = format_date_with_day(booking['date'])
    
    subject = f"✈️ Your Premium Transfer is Confirmed - {booking_ref}"
    
    # Generate calendar invite
    calendar_invite = generate_calendar_invite(booking)
    
    body = f"""
    <div style="max-width: 650px; margin: 0 auto; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: white; padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">
          🏆 HIBISCUS TO AIRPORT
        </h1>
        <p style="margin: 8px 0 0; font-size: 14px; color: #f59e0b; font-weight: 500; letter-spacing: 1px;">
          PREMIUM TRANSPORTATION
        </p>
      </div>
      
      <!-- Main Content -->
      <div style="background: white; padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0; color: #1f2937; font-size: 28px; font-weight: 600;">
            Dear {booking['name']},
          </h2>
          <p style="margin: 15px 0 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
            Your premium airport transfer has been confirmed. We look forward to providing you with exceptional service.
          </p>
        </div>
        
        <!-- Confirmation Box -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
          <h3 style="margin: 0 0 10px; font-size: 18px; font-weight: 600; letter-spacing: 1px;">
            BOOKING CONFIRMATION
          </h3>
          <p style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
            {booking_ref}
          </p>
          <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">
            ✅ CONFIRMED & PAID
          </p>
        </div>
        
        <!-- Transfer Details -->
        <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin: 30px 0; border-left: 4px solid #f59e0b;">
          <h3 style="margin: 0 0 20px; color: #f59e0b; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
            ✈️ TRANSFER DETAILS
          </h3>
          
          <div style="margin-bottom: 20px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 500;">📍 PICKUP LOCATION</p>
            <p style="margin: 5px 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">{booking['pickupAddress']}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 500;">🛬 DESTINATION</p>
            <p style="margin: 5px 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">{booking['dropoffAddress']}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 500;">📅 DATE & TIME</p>
            <p style="margin: 5px 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">{formatted_date} at {booking['time']}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 500;">👥 PASSENGERS</p>
            <p style="margin: 5px 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">{booking['passengers']} guests</p>
          </div>
          
          {'<div style="margin-bottom: 0;"><p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 500;">✈️ FLIGHT INFORMATION</p><p style="margin: 5px 0 0; color: #1f2937; font-size: 16px;">' + (f"Departure: {booking.get('departureFlightNumber', '')} at {booking.get('departureTime', '')}" if booking.get('departureFlightNumber') or booking.get('departureTime') else '') + (' | ' if (booking.get('departureFlightNumber') or booking.get('departureTime')) and (booking.get('arrivalFlightNumber') or booking.get('arrivalTime')) else '') + (f"Arrival: {booking.get('arrivalFlightNumber', '')} at {booking.get('arrivalTime', '')}" if booking.get('arrivalFlightNumber') or booking.get('arrivalTime') else '') + '</p></div>' if booking.get('departureFlightNumber') or booking.get('departureTime') or booking.get('arrivalFlightNumber') or booking.get('arrivalTime') else ''}
        </div>
        
        <!-- Investment Breakdown -->
        <div style="background: white; border: 2px solid #f3f4f6; border-radius: 12px; padding: 30px; margin: 30px 0;">
          <h3 style="margin: 0 0 20px; color: #f59e0b; font-size: 18px; font-weight: 600;">
            💰 INVESTMENT BREAKDOWN
          </h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6;">Distance ({booking['pricing']['distance']} km)</td>
              <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 600; border-bottom: 1px solid #f3f4f6;">${booking['pricing']['basePrice']:.2f}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6;">Airport Service Fee</td>
              <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 600; border-bottom: 1px solid #f3f4f6;">${booking['pricing']['airportFee']:.2f}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; border-bottom: 2px solid #f59e0b;">Additional Passengers</td>
              <td style="padding: 8px 0; text-align: right; color: #1f2937; font-weight: 600; border-bottom: 2px solid #f59e0b;">${booking['pricing']['passengerFee']:.2f}</td>
            </tr>
            <tr>
              <td style="padding: 15px 0 0; color: #f59e0b; font-size: 18px; font-weight: bold;">TOTAL INVESTMENT</td>
              <td style="padding: 15px 0 0; text-align: right; color: #f59e0b; font-size: 20px; font-weight: bold;">${booking['pricing']['totalPrice']:.2f} NZD</td>
            </tr>
          </table>
        </div>
        
        <!-- Service Expectations -->
        <div style="background: #1f2937; color: white; border-radius: 12px; padding: 30px; margin: 30px 0;">
          <h3 style="margin: 0 0 20px; color: #f59e0b; font-size: 18px; font-weight: 600;">
            🎯 WHAT TO EXPECT
          </h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 8px 0; display: flex; align-items: center;">
              <span style="color: #f59e0b; margin-right: 10px;">•</span>
              Professional driver in business attire
            </li>
            <li style="padding: 8px 0; display: flex; align-items: center;">
              <span style="color: #f59e0b; margin-right: 10px;">•</span>
              Late-model Toyota Hiace vehicle
            </li>
            <li style="padding: 8px 0; display: flex; align-items: center;">
              <span style="color: #f59e0b; margin-right: 10px;">•</span>
              Complimentary Wi-Fi & phone charging
            </li>
            <li style="padding: 8px 0; display: flex; align-items: center;">
              <span style="color: #f59e0b; margin-right: 10px;">•</span>
              Flight monitoring & pickup adjustments
            </li>
            <li style="padding: 8px 0; display: flex; align-items: center;">
              <span style="color: #f59e0b; margin-right: 10px;">•</span>
              Premium door-to-door service
            </li>
          </ul>
        </div>
        
        <!-- Contact Information -->
        <div style="text-align: center; background: #f8fafc; border-radius: 12px; padding: 30px; margin: 30px 0;">
          <h3 style="margin: 0 0 20px; color: #1f2937; font-size: 18px; font-weight: 600;">
            📱 STAY CONNECTED
          </h3>
          <p style="margin: 10px 0; color: #6b7280; font-size: 16px;">
            <strong>Email:</strong> <span style="color: #f59e0b;">bookings@bookaride.co.nz</span>
          </p>
          <p style="margin: 10px 0; color: #6b7280; font-size: 16px;">
            <strong>Track:</strong> <span style="color: #f59e0b;">hibiscustoairport.co.nz/track/{booking_ref}</span>
          </p>
        </div>
        
        <!-- Signature -->
        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 16px;">
            Best regards,<br>
            <strong style="color: #f59e0b;">The Hibiscus to Airport Team</strong>
          </p>
        </div>
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #f3f4f6;">
          This is an automated confirmation email. Please keep this for your records.<br>
          You received this email because you booked a transfer with Hibiscus to Airport.
        </p>
      </div>
    </div>
    """
    
    # Send to customer
    send_email(booking['email'], subject, body, calendar_invite)
    
    # Also send calendar invite to admin
    admin_cal_email = os.environ.get('ADMIN_EMAIL', 'bookings@bookaride.co.nz')
    admin_subject = f"New Booking Calendar - {booking_ref}"
    admin_body = f"<p>New booking received. Calendar invite attached.</p><p>Booking Reference: <strong>{booking_ref}</strong></p>"
    send_email(admin_cal_email, admin_subject, admin_body, calendar_invite)
    
    return True

# Admin Notification Email
def send_admin_notification(booking: dict):
    """Send new booking notification to admin"""
    booking_ref = booking.get('booking_ref', 'N/A')
    formatted_date = format_date_with_day(booking['date'])
    admin_email = os.environ.get('ADMIN_EMAIL')
    
    # Flight information
    departure_flight = booking.get('departureFlightNumber', '')
    departure_time = booking.get('departureTime', '')
    arrival_flight = booking.get('arrivalFlightNumber', '')
    arrival_time = booking.get('arrivalTime', '')
    
    flight_info = ""
    if departure_flight or departure_time:
        flight_info += f"<p><strong>✈️ Departure Flight:</strong> {departure_flight or 'N/A'} at {departure_time or 'N/A'}</p>"
    if arrival_flight or arrival_time:
        flight_info += f"<p><strong>🛬 Arrival Flight:</strong> {arrival_flight or 'N/A'} at {arrival_time or 'N/A'}</p>"
    
    notes = booking.get('notes', '')
    notes_section = f"<p><strong>Notes:</strong> {notes}</p>" if notes else ""
    
    subject = f"🚗 New Booking - {booking_ref}"
    
    body = f"""
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="color: #D4AF37; margin-bottom: 20px;">New Booking Received</h2>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #D4AF37;">
        <p><strong>Reference:</strong> <span style="font-size: 18px; color: #D4AF37;">{booking_ref}</span></p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
        
        <p><strong>👤 Customer:</strong> {booking['name']}</p>
        <p><strong>📞 Phone:</strong> {booking['phone']}</p>
        <p><strong>✉️ Email:</strong> {booking['email']}</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
        
        <p><strong>📍 Pickup:</strong> {booking['pickupAddress']}</p>
        <p><strong>🏁 Drop-off:</strong> {booking['dropoffAddress']}</p>
        <p><strong>📅 Date/Time:</strong> {formatted_date} at {booking['time']}</p>
        <p><strong>👥 Passengers:</strong> {booking['passengers']}</p>
        
        {flight_info}
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
        
        <p><strong>💰 Total Price:</strong> <span style="font-size: 18px; color: green;">${booking['pricing']['totalPrice']:.2f} NZD</span></p>
        <p><strong>💳 Payment Status:</strong> {booking.get('payment_status', 'pending').upper()}</p>
        <p><strong>📋 Booking Status:</strong> {booking.get('status', 'pending').upper()}</p>
        
        {notes_section}
      </div>
      
      <p style="margin-top: 20px; color: #666;">Login to admin dashboard to manage this booking.</p>
    </div>
    """
    
    return send_email(admin_email, subject, body)

def send_admin_sms_notification(booking: dict):
    """Send new booking SMS alert to admin"""
    admin_phone = os.environ.get('ADMIN_PHONE')
    if not admin_phone:
        logger.warning("ADMIN_PHONE not set - skipping admin SMS")
        return False
    
    booking_ref = booking.get('booking_ref', 'N/A')
    formatted_date = format_date_nz(booking['date'])
    total = booking.get('totalPrice', booking.get('pricing', {}).get('totalPrice', 0))
    
    message = f"""🚗 NEW BOOKING!

Ref: {booking_ref}
{booking['name']}
{formatted_date} at {booking['time']}
{booking['passengers']} pax | ${total:.2f}

From: {booking['pickupAddress'][:40]}...
To: {booking['dropoffAddress'][:40]}...

Login to admin to manage."""
    
    try:
        send_sms(admin_phone, message)
        logger.info(f"Admin SMS notification sent to {admin_phone} for booking {booking_ref}")
        return True
    except Exception as e:
        logger.error(f"Failed to send admin SMS: {str(e)}")
        return False

# Customer SMS
def send_customer_sms(booking: dict):
    """Send premium booking confirmation SMS to customer"""
    booking_ref = booking.get('booking_ref', 'N/A')
    formatted_date = format_date_with_day(booking['date'])
    
    message = f"""HIBISCUS TO AIRPORT
Transfer CONFIRMED

Ref: {booking_ref}
{formatted_date}, {booking['time']}
{booking['pickupAddress']} to {booking['dropoffAddress']}
{booking['passengers']} passengers | ${booking.get('totalPrice', booking['pricing']['totalPrice']):.2f}

Questions? 021 743 321
hibiscustoairport.co.nz"""
    
    return send_sms(booking['phone'], message)
    


# Cancellation Notifications
def send_cancellation_email(booking: dict):
    """Send booking cancellation email to customer"""
    booking_ref = booking.get('booking_ref', 'N/A')
    formatted_date = format_date_nz(booking['date'])
    
    subject = f"Booking Cancelled - {booking_ref}"
    
    body = f"""
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #8B0000 0%, #DC143C 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">❌ Booking Cancelled</h1>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #666;">Your booking with Hibiscus to Airport has been cancelled.</p>
        
        <div style="background: #ffe6e6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC143C;">
          <p style="margin: 0;"><strong>Booking Reference:</strong> <span style="color: #DC143C; font-size: 20px; font-weight: bold;">{booking_ref}</span></p>
        </div>
        
        <h3 style="color: #333; border-bottom: 2px solid #DC143C; padding-bottom: 10px;">Cancelled Trip Details</h3>
        <table style="width: 100%; margin: 20px 0;">
          <tr>
            <td style="padding: 10px 0; color: #666;"><strong>Name:</strong></td>
            <td style="padding: 10px 0;">{booking['name']}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666;"><strong>Pickup:</strong></td>
            <td style="padding: 10px 0;">{booking['pickupAddress']}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666;"><strong>Drop-off:</strong></td>
            <td style="padding: 10px 0;">{booking['dropoffAddress']}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666;"><strong>Date & Time:</strong></td>
            <td style="padding: 10px 0;">{formatted_date} at {booking['time']}</td>
          </tr>
        </table>
        
        <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #666;">If you have any questions about this cancellation or would like to make a new booking, please contact us.</p>
        </div>
        
        <p style="margin-top: 20px; color: #666;">
          <strong>Contact Us:</strong><br>
          Phone: 021 123 4567<br>
          Email: info@bookaride.co.nz
        </p>
      </div>
    </div>
    """
    
    return send_email(booking['email'], subject, body)

def send_cancellation_sms(booking: dict):
    """Send booking cancellation SMS to customer"""
    booking_ref = booking.get('booking_ref', 'N/A')
    formatted_date = format_date_nz(booking['date'])
    
    message = f"""Hibiscus to Airport - Booking Cancelled
Ref: {booking_ref}
Date: {formatted_date} at {booking['time']}

Your booking has been cancelled. Contact us if you have questions: 021 123 4567"""
    
    return send_sms(booking['phone'], message)

# ============================================
# URGENT BOOKING NOTIFICATIONS (Within 24 hours)
# ============================================

def is_urgent_booking(booking_date: str, booking_time: str = "00:00") -> tuple:
    """
    Check if booking is urgent (within 24 hours of travel).
    Returns (is_urgent, hours_until_trip)
    """
    try:
        from datetime import datetime, timezone
        import pytz
        
        # Parse booking date and time
        booking_datetime_str = f"{booking_date} {booking_time}"
        booking_dt = datetime.strptime(booking_datetime_str, "%Y-%m-%d %H:%M")
        
        # Make it NZ timezone aware
        nz_tz = pytz.timezone('Pacific/Auckland')
        booking_dt = nz_tz.localize(booking_dt)
        
        # Get current time in NZ
        now_nz = datetime.now(nz_tz)
        
        # Calculate hours until trip
        time_diff = booking_dt - now_nz
        hours_until = time_diff.total_seconds() / 3600
        
        # Urgent if within 24 hours
        is_urgent = 0 < hours_until <= 24
        
        return is_urgent, round(hours_until, 1)
    except Exception as e:
        logger.error(f"Error checking urgent booking: {str(e)}")
        return False, 0

def send_urgent_admin_email(booking: dict, hours_until: float):
    """Send URGENT booking alert email to admin"""
    booking_ref = booking.get('booking_ref', 'N/A')
    formatted_date = format_date_with_day(booking['date'])
    admin_email = os.environ.get('ADMIN_EMAIL')
    
    subject = f"🚨 URGENT BOOKING - {booking_ref} - {int(hours_until)}hrs NOTICE!"
    
    body = f"""
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="background: #DC2626; color: white; padding: 25px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🚨 URGENT BOOKING</h1>
        <p style="margin: 10px 0 0; font-size: 18px; font-weight: bold;">Only {int(hours_until)} hours until pickup!</p>
      </div>
      
      <div style="background: #FEF2F2; padding: 20px; border: 2px solid #DC2626; border-top: none; border-radius: 0 0 10px 10px;">
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #DC2626;">
          <p><strong>Reference:</strong> <span style="font-size: 20px; color: #DC2626; font-weight: bold;">{booking_ref}</span></p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
          
          <p><strong>👤 Customer:</strong> {booking['name']}</p>
          <p><strong>📞 Phone:</strong> <a href="tel:{booking['phone']}" style="color: #DC2626; font-weight: bold;">{booking['phone']}</a></p>
          <p><strong>✉️ Email:</strong> {booking['email']}</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
          
          <p><strong>📍 Pickup:</strong> {booking['pickupAddress']}</p>
          <p><strong>🏁 Drop-off:</strong> {booking['dropoffAddress']}</p>
          <p style="font-size: 18px;"><strong>📅 Pickup Time:</strong> <span style="color: #DC2626; font-weight: bold;">{formatted_date} at {booking['time']}</span></p>
          <p><strong>👥 Passengers:</strong> {booking['passengers']}</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
          
          <p><strong>💰 Total Price:</strong> <span style="font-size: 18px; color: green;">${booking.get('totalPrice', booking.get('pricing', {}).get('totalPrice', 0)):.2f} NZD</span></p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #DC2626; font-weight: bold; font-size: 16px;">⚠️ ACTION REQUIRED: Assign driver immediately!</p>
        </div>
      </div>
    </div>
    """
    
    return send_email(admin_email, subject, body)

def send_urgent_admin_sms(booking: dict, hours_until: float):
    """Send URGENT booking SMS alert to admin"""
    admin_phone = os.environ.get('ADMIN_PHONE')
    if not admin_phone:
        logger.warning("ADMIN_PHONE not set - skipping urgent admin SMS")
        return False
    
    booking_ref = booking.get('booking_ref', 'N/A')
    formatted_date = format_date_nz(booking['date'])
    total = booking.get('totalPrice', booking.get('pricing', {}).get('totalPrice', 0))
    
    message = f"""🚨 URGENT BOOKING!

⏰ ONLY {int(hours_until)}hrs NOTICE!

Ref: {booking_ref}
{booking['name']}
📞 {booking['phone']}

{formatted_date} at {booking['time']}
{booking['passengers']} pax | ${total:.2f}

From: {booking['pickupAddress'][:35]}...
To: {booking['dropoffAddress'][:35]}...

ACTION REQUIRED NOW!"""
    
    try:
        send_sms(admin_phone, message)
        logger.info(f"URGENT admin SMS sent to {admin_phone} for booking {booking_ref}")
        return True
    except Exception as e:
        logger.error(f"Failed to send urgent admin SMS: {str(e)}")
        return False

async def send_password_reset_email(email: str, reset_token: str):
    """Send password reset email to admin"""
    # Get frontend URL from environment
    frontend_url = os.environ.get('FRONTEND_URL', 'https://hibiscustoairport.co.nz')
    reset_link = f"{frontend_url}/admin/reset-password?token={reset_token}"
    
    subject = "🔐 Password Reset - Hibiscus to Airport Admin"
    
    body = f"""
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase;">
          🔐 PASSWORD RESET
        </h1>
        <p style="margin: 8px 0 0; font-size: 14px; color: #f59e0b; font-weight: 500; letter-spacing: 1px;">
          HIBISCUS TO AIRPORT ADMIN
        </p>
      </div>
      
      <!-- Main Content -->
      <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Hello,
        </p>
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          We received a request to reset your admin password. Click the button below to set a new password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{reset_link}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Reset Password
          </a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
          Or copy and paste this link into your browser:
        </p>
        <p style="font-size: 12px; color: #f59e0b; word-break: break-all; background: #f8fafc; padding: 15px; border-radius: 8px;">
          {reset_link}
        </p>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            ⚠️ This link will expire in <strong>1 hour</strong>. If you didn't request this reset, please ignore this email.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          Hibiscus to Airport - Premium Airport Transfers<br>
          This is an automated message. Please do not reply.
        </p>
      </div>
    </div>
    """
    
    return send_email(email, subject, body)

