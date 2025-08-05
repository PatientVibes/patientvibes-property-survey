// Property Survey Analytics API
export async function onRequestGet(context) {
    const { searchParams } = new URL(context.request.url);
    const action = searchParams.get('action') || 'pageview';
    
    // Basic analytics tracking
    const analyticsData = {
        timestamp: new Date().toISOString(),
        action: action,
        userAgent: context.request.headers.get('User-Agent'),
        country: context.request.cf?.country || 'Unknown',
        city: context.request.cf?.city || 'Unknown',
        ip: context.request.headers.get('CF-Connecting-IP'),
        referer: context.request.headers.get('Referer') || 'Direct'
    };
    
    // Log for Cloudflare Analytics
    console.log('Property Survey Analytics:', analyticsData);
    
    return new Response(JSON.stringify({
        success: true,
        message: 'Analytics tracked',
        data: analyticsData
    }), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}

export async function onRequestPost(context) {
    const body = await context.request.json();
    
    // Track custom events (layer toggles, exports, etc.)
    const eventData = {
        timestamp: new Date().toISOString(),
        event: body.event || 'custom',
        properties: body.properties || {},
        country: context.request.cf?.country || 'Unknown'
    };
    
    console.log('Property Survey Event:', eventData);
    
    return new Response(JSON.stringify({
        success: true,
        message: 'Event tracked'
    }), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}