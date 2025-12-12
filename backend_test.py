#!/usr/bin/env python3

import requests
import sys
import json
import os
from datetime import datetime
from pathlib import Path

class DeepfakeDetectionAPITester:
    def __init__(self, base_url="https://fakefinder-12.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = None
        self.admin_token = None
        self.test_user_id = None
        self.test_upload_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            print(f"❌ {test_name} - {details}")
            self.failed_tests.append({"test": test_name, "error": details})

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.session_token and 'Authorization' not in test_headers:
            test_headers['Authorization'] = f'Bearer {self.session_token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                if files:
                    # Remove Content-Type for multipart
                    test_headers.pop('Content-Type', None)
                    response = requests.post(url, files=files, headers=test_headers)
                else:
                    response = requests.post(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers)

            success = response.status_code == expected_status
            
            if success:
                self.log_result(name, True)
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.log_result(name, False, f"Expected {expected_status}, got {response.status_code}")
                try:
                    return False, response.json()
                except:
                    return False, {"error": response.text}

        except Exception as e:
            self.log_result(name, False, f"Exception: {str(e)}")
            return False, {"error": str(e)}

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "name": f"Test User {timestamp}",
            "email": f"testuser{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_data
        )
        
        return success

    def test_user_login(self):
        """Test user login and get session token"""
        # First register a user
        timestamp = datetime.now().strftime('%H%M%S')
        register_data = {
            "name": f"Test User {timestamp}",
            "email": f"testuser{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        # Register user
        reg_success, reg_response = self.run_test(
            "Register Test User for Login",
            "POST",
            "auth/register",
            200,
            data=register_data
        )
        
        if not reg_success:
            return False
        
        # Now login
        login_data = {
            "email": register_data["email"],
            "password": register_data["password"]
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        # For session-based auth, we need to extract session from cookies
        # Since we can't easily get cookies in this test, we'll use admin login
        return success

    def test_admin_login(self):
        """Test admin login"""
        admin_data = {
            "email": "admin@truthlens.com",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=admin_data
        )
        
        return success

    def test_auth_me_without_token(self):
        """Test /auth/me without authentication"""
        success, response = self.run_test(
            "Auth Me (No Token)",
            "GET",
            "auth/me",
            401,
            headers={'Authorization': ''}
        )
        return success

    def test_file_upload_without_auth(self):
        """Test file upload without authentication"""
        # Create a small test file
        test_file_content = b"fake image content"
        files = {'file': ('test.jpg', test_file_content, 'image/jpeg')}
        
        success, response = self.run_test(
            "File Upload (No Auth)",
            "POST",
            "upload",
            401,
            files=files,
            headers={'Authorization': ''}
        )
        return success

    def test_admin_endpoints_without_auth(self):
        """Test admin endpoints without authentication"""
        tests = [
            ("Admin Stats (No Auth)", "GET", "admin/stats", 401),
            ("Admin Uploads (No Auth)", "GET", "admin/uploads", 401),
        ]
        
        all_passed = True
        for test_name, method, endpoint, expected_status in tests:
            success, _ = self.run_test(
                test_name,
                method,
                endpoint,
                expected_status,
                headers={'Authorization': ''}
            )
            if not success:
                all_passed = False
        
        return all_passed

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        invalid_data = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        success, response = self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data=invalid_data
        )
        return success

    def test_invalid_registration(self):
        """Test registration with invalid data"""
        # Test duplicate email (using admin email)
        duplicate_data = {
            "name": "Test User",
            "email": "admin@truthlens.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "Duplicate Email Registration",
            "POST",
            "auth/register",
            400,
            data=duplicate_data
        )
        return success

    def test_logout(self):
        """Test logout functionality"""
        success, response = self.run_test(
            "User Logout",
            "POST",
            "auth/logout",
            200
        )
        return success

    def print_summary(self):
        """Print test summary"""
        print(f"\n{'='*50}")
        print(f"TEST SUMMARY")
        print(f"{'='*50}")
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print(f"\nFAILED TESTS:")
            for failed in self.failed_tests:
                print(f"  - {failed['test']}: {failed['error']}")
        
        return len(self.failed_tests) == 0

def main():
    print("🔍 Starting Deepfake Detection API Tests...")
    print("=" * 50)
    
    tester = DeepfakeDetectionAPITester()
    
    # Test authentication flows
    print("\n📝 Testing Authentication...")
    tester.test_user_registration()
    tester.test_user_login()
    tester.test_admin_login()
    tester.test_invalid_login()
    tester.test_invalid_registration()
    
    # Test unauthorized access
    print("\n🔒 Testing Unauthorized Access...")
    tester.test_auth_me_without_token()
    tester.test_file_upload_without_auth()
    tester.test_admin_endpoints_without_auth()
    
    # Test logout
    print("\n🚪 Testing Logout...")
    tester.test_logout()
    
    # Print final summary
    success = tester.print_summary()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())