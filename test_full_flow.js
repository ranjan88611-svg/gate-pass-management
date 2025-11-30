const axios = require('axios');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const jar = new tough.CookieJar();
const client = wrapper(axios.create({ jar, baseURL: 'http://localhost:8081' }));

async function test() {
    try {
        const usn = 'TEST' + Date.now();
        console.log('Registering user:', usn);

        // 1. Register
        await client.post('/student/register', {
            name: 'Test User',
            usn: usn,
            email: 'test@example.com',
            phone: '1234567890',
            password: 'password',
            confirmPassword: 'password',
            sem: '5',
            section: 'A'
        });

        // 2. Login
        console.log('Logging in...');
        await client.post('/studentsignin', {
            usn: usn,
            password: 'password'
        });

        // 3. Submit Gate Pass
        console.log('Submitting gate pass...');
        await client.post('/dashboard', {
            pOV: 'Test Visit',
            time: '2025-12-01T10:00',
            sem: '5', // These might be ignored by backend but sending anyway
            section: 'A'
        });

        console.log('Gate pass submitted. Checking database...');

        // 4. Check Database (using mongoose directly since we can't check via API easily without parsing HTML)
        const mongoose = require('mongoose');
        const studentData = require('./models/student');
        await mongoose.connect('mongodb://127.0.0.1:27017/studentdata'); // Note: index.js uses 'studentdata' db name in main()

        const pass = await studentData.findOne({ pOV: 'Test Visit' });
        if (pass) {
            console.log('SUCCESS: Gate pass found in database:', pass);
        } else {
            console.log('FAILURE: Gate pass NOT found in database');
        }

        await mongoose.disconnect();

    } catch (err) {
        console.error('Test failed:', err.message);
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
        }
    }
}

test();
