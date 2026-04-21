const express = require('express');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');
const compression = require('compression');
const { validateEmailRequest } = require('./emailValidation');

const app = express();
const port = Number(process.env.PORT || 8080);
const bodyLimit = '32kb';
const configuredOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const localOriginPattern =
    /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(?::\d+)?$/;
let transporter: any;

const isAllowedOrigin = (origin: string | undefined) => {
    if (!origin) return true;
    if (configuredOrigins.length > 0) {
        return configuredOrigins.includes(origin);
    }

    return localOriginPattern.test(origin);
};

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: process.env.FOLIO_EMAIL,
                pass: process.env.FOLIO_PASSWORD,
            },
        });
    }

    return transporter;
};

app.use(
    cors({
        origin(
            origin: string | undefined,
            callback: (error: Error | null, accept?: boolean) => void
        ) {
            if (isAllowedOrigin(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error('Origin not allowed by CORS'));
        },
    })
);
app.use(compression());

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../public')));

app.use(express.urlencoded({ extended: false, limit: bodyLimit }));
app.use(express.json({ limit: bodyLimit }));

// Handle GET requests to /api route
app.post('/api/send-email', async (req: any, res: any) => {
    const validation = validateEmailRequest(req.body);
    if (!validation.valid) {
        res.status(400).json({ message: 'invalid request' });
        return;
    }

    const { name, company, email, message } = validation.value;

    try {
        await getTransporter().sendMail({
            from: `"${name}" <MontassarHajri.folio@gmail.com>`,
            to: 'MontassarHajri@gmail.com, MontassarHajri.folio@gmail.com',
            subject: `${name} <${email}> ${
                company ? `from ${company}` : ''
            } submitted a contact form`,
            text: message,
        });

        res.json({ message: 'success' });
    } catch (error) {
        console.error('Failed to send contact email', error);
        res.status(500).json({ message: 'failed to send email' });
    }
});

// listen to app on port 8080
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
