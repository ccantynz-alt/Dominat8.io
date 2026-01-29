"""
Test suite for Cancel Booking functionality
Tests the DELETE /api/bookings/{booking_id} endpoint which:
1. Sends cancellation SMS to customer
2. Sends cancellation email to customer
3. Soft-deletes booking (moves to deleted_bookings collection)
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCancelBooking:
    """Test Cancel Booking functionality"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get auth token"""
        self.token = None
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "admin", "password": "Kongkong2025!@"},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            self.token = response.json().get("access_token")
        yield
    
    def get_headers(self):
        """Get headers with auth token"""
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_admin_login(self):
        """Test admin login works"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "admin", "password": "Kongkong2025!@"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_get_bookings(self):
        """Test fetching bookings list"""
        if not self.token:
            pytest.skip("Auth failed")
        
        response = requests.get(
            f"{BASE_URL}/api/bookings",
            headers=self.get_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_create_and_cancel_booking(self):
        """Test creating a booking and then cancelling it"""
        if not self.token:
            pytest.skip("Auth failed")
        
        # Create a test booking
        booking_data = {
            "name": "TEST_Cancel_Pytest",
            "email": "pytest_cancel@example.com",
            "phone": "+64211234888",
            "pickupAddress": "Test Pickup Address, Auckland",
            "dropoffAddress": "Auckland Airport",
            "date": "2026-02-15",
            "time": "11:00",
            "passengers": "1",
            "notes": "Pytest test booking for cancellation",
            "pricing": {
                "distance": 30,
                "basePrice": 150,
                "airportFee": 0,
                "passengerFee": 0,
                "oversizedLuggageFee": 0,
                "totalPrice": 150,
                "ratePerKm": 5
            }
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/bookings",
            json=booking_data,
            headers=self.get_headers()
        )
        assert create_response.status_code == 200
        created = create_response.json()
        assert "booking_id" in created
        assert "booking_ref" in created
        
        booking_id = created["booking_id"]
        booking_ref = created["booking_ref"]
        
        # Cancel the booking
        cancel_response = requests.delete(
            f"{BASE_URL}/api/bookings/{booking_id}",
            headers=self.get_headers()
        )
        assert cancel_response.status_code == 200
        cancel_data = cancel_response.json()
        assert cancel_data["message"] == "Booking cancelled and moved to deleted (can be restored)"
        assert cancel_data["booking_ref"] == booking_ref
        
        # Verify booking is no longer in active bookings
        bookings_response = requests.get(
            f"{BASE_URL}/api/bookings",
            headers=self.get_headers()
        )
        assert bookings_response.status_code == 200
        active_bookings = bookings_response.json()
        active_ids = [b["id"] for b in active_bookings]
        assert booking_id not in active_ids
        
        # Verify booking is in deleted bookings
        deleted_response = requests.get(
            f"{BASE_URL}/api/bookings/deleted/list",
            headers=self.get_headers()
        )
        assert deleted_response.status_code == 200
        deleted_bookings = deleted_response.json()
        deleted_ids = [b["id"] for b in deleted_bookings]
        assert booking_id in deleted_ids
        
        # Verify deleted booking has deletedAt and deletedBy fields
        deleted_booking = next((b for b in deleted_bookings if b["id"] == booking_id), None)
        assert deleted_booking is not None
        assert "deletedAt" in deleted_booking
        assert deleted_booking["deletedBy"] == "admin"
    
    def test_cancel_nonexistent_booking(self):
        """Test cancelling a booking that doesn't exist"""
        if not self.token:
            pytest.skip("Auth failed")
        
        response = requests.delete(
            f"{BASE_URL}/api/bookings/nonexistent-booking-id-12345",
            headers=self.get_headers()
        )
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()
    
    def test_cancel_without_auth(self):
        """Test cancelling without authentication"""
        response = requests.delete(
            f"{BASE_URL}/api/bookings/some-booking-id",
            headers={"Content-Type": "application/json"}
        )
        # API returns 403 Forbidden for missing auth
        assert response.status_code in [401, 403]
    
    def test_get_deleted_bookings(self):
        """Test fetching deleted bookings list"""
        if not self.token:
            pytest.skip("Auth failed")
        
        response = requests.get(
            f"{BASE_URL}/api/bookings/deleted/list",
            headers=self.get_headers()
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Verify structure of deleted bookings
        if len(data) > 0:
            booking = data[0]
            assert "id" in booking
            assert "booking_ref" in booking
            assert "deletedAt" in booking
            assert "deletedBy" in booking


class TestCancellationNotifications:
    """Test that cancellation sends proper notifications"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - get auth token"""
        self.token = None
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "admin", "password": "Kongkong2025!@"},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            self.token = response.json().get("access_token")
        yield
    
    def get_headers(self):
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_cancellation_sends_notifications(self):
        """
        Test that cancellation triggers SMS and email notifications.
        Note: We can't directly verify SMS/email delivery, but we verify
        the endpoint returns success which indicates notifications were attempted.
        """
        if not self.token:
            pytest.skip("Auth failed")
        
        # Create a booking
        booking_data = {
            "name": "TEST_Notification_Test",
            "email": "notification_test@example.com",
            "phone": "+64211234777",
            "pickupAddress": "Notification Test Address",
            "dropoffAddress": "Auckland Airport",
            "date": "2026-03-01",
            "time": "09:00",
            "passengers": "1",
            "notes": "Testing notification on cancel",
            "pricing": {
                "distance": 20,
                "basePrice": 100,
                "airportFee": 0,
                "passengerFee": 0,
                "oversizedLuggageFee": 0,
                "totalPrice": 100,
                "ratePerKm": 5
            }
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/bookings",
            json=booking_data,
            headers=self.get_headers()
        )
        assert create_response.status_code == 200
        booking_id = create_response.json()["booking_id"]
        
        # Cancel and verify success (notifications are sent in the backend)
        cancel_response = requests.delete(
            f"{BASE_URL}/api/bookings/{booking_id}",
            headers=self.get_headers()
        )
        assert cancel_response.status_code == 200
        # Success response indicates notifications were attempted
        # Backend logs will show actual SMS/email delivery status


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
