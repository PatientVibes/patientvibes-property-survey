// R2 Asset Serving Function
export async function onRequestGet(context) {
    const { params, env } = context;
    const assetName = params.asset;
    
    // Only serve allowed GeoJSON files
    const allowedAssets = [
        'contours_wgs84.geojson',
        'flood_zones_wgs84.geojson', 
        'impervious_wgs84.geojson'
    ];
    
    if (!allowedAssets.includes(assetName)) {
        return new Response('Asset not found', { status: 404 });
    }
    
    try {
        // Get object from R2 bucket
        const object = await env.PROPERTY_ASSETS.get(assetName);
        
        if (!object) {
            return new Response('Asset not found', { status: 404 });
        }
        
        // Return with proper headers
        return new Response(object.body, {
            headers: {
                'Content-Type': 'application/geo+json',
                'Cache-Control': 'public, max-age=3600',
                'Access-Control-Allow-Origin': '*',
                'X-Source': 'Cloudflare R2'
            }
        });
    } catch (error) {
        console.error('R2 Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}