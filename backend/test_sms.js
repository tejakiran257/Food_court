import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const testSMS = async () => {
    try {
        const res = await axios.post(
            'https://www.fast2sms.com/dev/bulkV2',
            { route: 'q', message: 'Hello from test', flash: 0, numbers: '9999999999' },
            { headers: { authorization: process.env.FAST2SMS_API_KEY, 'Content-Type': 'application/json' } }
        );
        fs.writeFileSync('result.txt', JSON.stringify({ success: true, data: res.data }, null, 2));
    } catch (error) {
        fs.writeFileSync('result.txt', JSON.stringify({ success: false, data: error.response?.data || error.message }, null, 2));
    }
};

testSMS();
