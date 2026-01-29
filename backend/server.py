from fastapi import FastAPI, APIRouter, Request, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import os
import logging
from pathlib import Path

# Import booking routes
from booking_routes import router as booking_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app without a prefix
app = FastAPI(title="Hibiscus to Airport Booking API")

# CRITICAL: Middleware to prevent Cloudflare/CDN caching of API responses
class NoCacheMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Add headers to prevent ALL caching for API routes
        if request.url.path.startswith("/api"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0, private"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
            response.headers["Surrogate-Control"] = "no-store"
            response.headers["CDN-Cache-Control"] = "no-store"
            response.headers["Cloudflare-CDN-Cache-Control"] = "no-store"
        return response

app.add_middleware(NoCacheMiddleware)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Add your routes to the router
@api_router.get("/")
async def root():
    return {"message": "Hibiscus to Airport Booking API", "status": "running"}

# Include booking routes
api_router.include_router(booking_router, tags=["bookings"])

# Include the router in the main app
app.include_router(api_router)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================
# AUTOMATIC DAY-BEFORE REMINDER SCHEDULER
# ============================================
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorClient

scheduler = AsyncIOScheduler()

async def send_day_before_reminders():
    """Send reminders for bookings happening tomorrow - runs daily at 6 PM NZ time"""
    try:
        logger.info("Running day-before reminder job...")
        
        # Connect to database
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'hibiscus_shuttle')
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        # Calculate tomorrow's date (NZ timezone)
        tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).strftime('%Y-%m-%d')
        
        # Find confirmed bookings for tomorrow that haven't had reminders sent
        bookings = await db.bookings.find({
            "date": tomorrow,
            "status": "confirmed",
            "payment_status": "paid",
            "reminder_sent": {"$ne": True}
        }, {"_id": 0}).to_list(100)
        
        logger.info(f"Found {len(bookings)} bookings for tomorrow ({tomorrow}) needing reminders")
        
        from utils import send_email, send_sms, format_date_nz
        
        sent_count = 0
        for booking in bookings:
            try:
                booking_ref = booking.get('booking_ref', 'N/A')
                formatted_date = format_date_nz(booking['date'])
                
                # Send reminder email
                subject = f"⏰ Reminder: Your Airport Transfer Tomorrow - {booking_ref}"
                body = f"""
                <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                  <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">⏰ Transfer Reminder</h1>
                    <p style="margin: 8px 0 0; color: #f59e0b;">Your transfer is tomorrow!</p>
                  </div>
                  <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
                    <p>Hi {booking['name']},</p>
                    <p>Just a friendly reminder that your airport transfer is scheduled for <strong>tomorrow</strong>.</p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                      <p><strong>Booking:</strong> {booking_ref}</p>
                      <p><strong>Date & Time:</strong> {formatted_date} at {booking['time']}</p>
                      <p><strong>Pickup:</strong> {booking['pickupAddress']}</p>
                      <p><strong>Drop-off:</strong> {booking['dropoffAddress']}</p>
                    </div>
                    <p style="background: #fef3c7; padding: 15px; border-radius: 8px;">
                      📌 <strong>Please be ready 5-10 minutes before your pickup time.</strong>
                    </p>
                    <p>Questions? Contact us at 021 743 321 or bookings@bookaride.co.nz</p>
                  </div>
                </div>
                """
                send_email(booking['email'], subject, body)
                
                # Send reminder SMS
                sms_message = f"""REMINDER: Your airport transfer is tomorrow!

Ref: {booking_ref}
Pickup: {formatted_date} at {booking['time']}
From: {booking['pickupAddress'][:50]}...

Be ready 5-10 mins early.
Questions? 021 743 321"""
                send_sms(booking['phone'], sms_message)
                
                # Mark reminder as sent
                await db.bookings.update_one(
                    {"id": booking['id']},
                    {"$set": {"reminder_sent": True, "reminder_sent_at": datetime.now(timezone.utc).isoformat()}}
                )
                
                sent_count += 1
                logger.info(f"Reminder sent for booking {booking_ref}")
                
            except Exception as e:
                logger.error(f"Failed to send reminder for booking {booking.get('booking_ref')}: {str(e)}")
        
        logger.info(f"Day-before reminders complete: {sent_count} sent")
        client.close()
        
    except Exception as e:
        logger.error(f"Error in day-before reminder job: {str(e)}")

@app.on_event("startup")
async def start_scheduler():
    """Start the scheduler when the app starts"""
    # Run reminders every day at 6 PM NZ time (5 AM UTC during NZDT)
    scheduler.add_job(
        send_day_before_reminders,
        CronTrigger(hour=5, minute=0),  # 5 AM UTC = 6 PM NZDT
        id="day_before_reminders",
        replace_existing=True
    )
    scheduler.start()
    logger.info("Scheduler started - Day-before reminders will run at 6 PM NZ time daily")

@app.on_event("shutdown")
async def shutdown_scheduler():
    """Shutdown the scheduler when the app stops"""
    scheduler.shutdown()
    logger.info("Scheduler shutdown")