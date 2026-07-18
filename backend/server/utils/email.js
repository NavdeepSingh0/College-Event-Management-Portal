const nodemailer = require('nodemailer');

let transporter = null;

async function initMailer() {
    try {
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
            && process.env.SMTP_USER !== 'YOUR_GMAIL@gmail.com') {
            // Real SMTP (Gmail or other)
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: (process.env.SMTP_PORT === '465'),
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
            // Verify connection
            await transporter.verify();
            console.log(`📧 SMTP mailer ready (${process.env.SMTP_HOST})`);
            console.log(`   Sending from: ${process.env.SMTP_USER}`);
        } else {
            // Dev mode — use Ethereal (fake emails)
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            console.log('📧 Dev mailer ready (Ethereal — emails won\'t be delivered)');
            console.log('   To send real emails, set SMTP_USER and SMTP_PASS in .env');
        }
    } catch (err) {
        console.warn('⚠️ Mailer init failed:', err.message);
        console.warn('   OTPs will be logged to console instead.');
        transporter = null;
    }
}

async function sendOtpEmail(to, otp, eventTitle) {
    if (!transporter) {
        console.log(`\n📧 OTP for ${to}: ${otp}\n`);
        throw new Error('Mailer not configured — OTP logged to console');
    }

    const fromAddr = process.env.SMTP_USER || 'noreply@cuevents.in';

    const info = await transporter.sendMail({
        from: `"CU Events" <${fromAddr}>`,
        to,
        subject: `Your Verification Code — ${eventTitle || 'CU Events'}`,
        html: `
        <div style="font-family:'Inter',Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8f9fb;border-radius:16px;">
            <div style="text-align:center;margin-bottom:24px;">
                <h1 style="font-size:20px;color:#1a1a2e;margin:0 0 4px;">🎓 CU Events</h1>
                <p style="color:#5f6878;font-size:14px;margin:0;">Chandigarh University Event Platform</p>
            </div>
            <div style="background:white;border-radius:12px;padding:28px;text-align:center;border:1px solid #e2e4ea;">
                <h2 style="font-size:16px;color:#1a1a2e;margin:0 0 8px;">Verification Code</h2>
                ${eventTitle ? `<p style="color:#5f6878;font-size:13px;margin:0 0 20px;">For: <strong>${eventTitle}</strong></p>` : ''}
                <div style="background:#f0f1f4;border-radius:10px;padding:16px;margin:16px 0;">
                    <span style="font-size:32px;letter-spacing:8px;font-weight:700;color:#1a1a2e;">${otp}</span>
                </div>
                <p style="color:#5f6878;font-size:13px;margin:16px 0 0;">This code expires in <strong>10 minutes</strong>.</p>
                <p style="color:#9ca3af;font-size:12px;margin:8px 0 0;">If you didn't request this, please ignore this email.</p>
            </div>
            <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:20px;">
                © ${new Date().getFullYear()} CU Events — Chandigarh University, Gharuan, Mohali
            </p>
        </div>
        `
    });

    // Log preview URL in dev mode (Ethereal)
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('📧 Preview:', previewUrl);
    else console.log(`📧 OTP email sent to ${to}`);

    return info;
}

module.exports = { initMailer, sendOtpEmail };
