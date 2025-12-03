// filepath: /netlify/functions/fetchPolicy.js
export async function handler(event, context) {
    const policyUUID = event.queryStringParameters.policyUUID;

    const url = `https://app.termly.io/api/v1/consumer/policies/${policyUUID}/content?lang=en`;

    try {
        const response = await fetch(url);
        const html = await response.text();

        const allowedOrigins = ['https://kestrel-labs.webflow.io', 'https://kestrellabs.webflow.io'];
        const origin = event.headers.origin || event.headers.Origin;
        const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/html',
                'Access-Control-Allow-Origin': corsOrigin,
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: html,
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch policy document' }),
        };
    }
}