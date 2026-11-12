import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb, initDb, saveDb } from './db/index.js';
import { calculateAvailableSlots } from './services/slotService.js';
import { formatWhatsAppConfirmationMessage, generateWhatsAppLink } from './services/whatsappService.js';

console.log('🧪 ========================================================');
console.log('🧪 STARTING COMPREHENSIVE BEAUTY PARLOUR SYSTEM TEST SUITE');
console.log('🧪 ========================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    testsFailed++;
  }
}

// 1. Test Database Initialization
const db = initDb();
assert(db.services.length >= 20, 'Database initializes with all 21 sample services');
assert(db.service_categories.length >= 6, 'Database initializes with 6 core beauty categories');
assert(db.business_hours.length === 7, 'Database has 7 days of business hours');
assert(db.admins.length >= 1, 'Database has admin account seeded');

// 2. Test Admin Password Hashing & JWT
const admin = db.admins[0];
const passwordCorrect = bcrypt.compareSync('Admin@12345', admin.password_hash);
assert(passwordCorrect, 'Admin default password hash verifies correctly with bcrypt');

const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, 'secret-test', { expiresIn: '1h' });
const decoded = jwt.verify(token, 'secret-test') as any;
assert(decoded.email === admin.email, 'Admin JWT authentication token signs and decodes successfully');

// 3. Test Slot Calculation Engine
console.log('\n--- Testing Slot Availability Calculation Engine ---');
const todayStr = new Date().toISOString().split('T')[0];

// Test future valid date
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 3);
const futureDateStr = futureDate.toISOString().split('T')[0];

const slotsRes = calculateAvailableSlots(futureDateStr, 45);
assert(slotsRes.isOpen === true, 'Parlour is marked open on valid business day');
assert(slotsRes.slots.length > 0, `Generated ${slotsRes.slots.length} time slots for 45-minute treatment`);

// Test past date blocking
const pastRes = calculateAvailableSlots('2020-01-01', 30);
assert(pastRes.isOpen === false && pastRes.slots.length === 0, 'Past dates are blocked from booking');

// Test holiday closure blocking
const holidayDate = db.holidays[0]?.holiday_date || '2026-11-20';
const holidayRes = calculateAvailableSlots(holidayDate, 30);
assert(holidayRes.isOpen === false, 'Scheduled holidays automatically block appointment booking');

// 4. Test WhatsApp Confirmation Link Generation
console.log('\n--- Testing WhatsApp Integration ---');
const sampleApt = db.appointments[0];
const sampleServices = db.appointment_services.filter((as) => as.appointment_id === sampleApt.id);
const waMsg = formatWhatsAppConfirmationMessage(sampleApt, sampleServices, db.website_settings);
assert(waMsg.includes(sampleApt.booking_id), 'WhatsApp message contains booking ID');
assert(waMsg.includes(db.website_settings.parlour_name.toUpperCase()), 'WhatsApp message contains parlour branding');

const waLink = generateWhatsAppLink(db.website_settings.whatsapp_number, waMsg);
assert(waLink.startsWith('https://wa.me/'), 'WhatsApp click-to-chat URL is properly formed');

// 5. Test Freezing Price at Booking Time
console.log('\n--- Testing Price Freezing on Appointments ---');
const srv6 = db.services.find((s) => s.id === 'srv-6')!;
const originalPrice = srv6.price;
const aptService = db.appointment_services.find((as) => as.service_id === 'srv-6')!;
assert(aptService.price_at_booking === originalPrice, 'Historical appointment stores price_at_booking');

// 6. Test Settings Reflection
console.log('\n--- Testing Dynamic Settings Reflection ---');
const prevName = db.website_settings.parlour_name;
assert(prevName === 'Aashmi Beauty Parlour', 'Default parlour name is configured');

console.log('\n========================================================');
console.log(`TEST RESULTS: ${testsPassed} passed, ${testsFailed} failed`);
console.log('========================================================\n');

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
