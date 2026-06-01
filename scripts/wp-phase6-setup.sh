#!/bin/bash
set -e
echo "============================================"
echo " UAE Junction - Phase 6 WordPress Setup"
echo "============================================"

WP="/usr/local/bin/wp --allow-root"
WP_PATH="/var/www/html"

echo ""
echo "=== PLUGINS BEFORE ==="
$WP plugin list --format=table --path=$WP_PATH

echo ""
echo "=== INSTALL: WPGraphQL for ACF ==="
$WP plugin install wpgraphql-acf --activate --path=$WP_PATH || echo "WARN: wpgraphql-acf install failed"

echo ""
echo "=== INSTALL: WooCommerce ==="
$WP plugin install woocommerce --activate --path=$WP_PATH || echo "WARN: woocommerce install failed"

echo ""
echo "=== INSTALL: WPGraphQL WooCommerce ==="
$WP plugin install wp-graphql-woocommerce --activate --path=$WP_PATH || echo "WARN: wp-graphql-woocommerce install failed"

echo ""
echo "=== CONFIGURE: WPGraphQL Public Introspection ==="
$WP option patch insert graphql_general_settings public_introspection_enabled on --path=$WP_PATH || true

echo ""
echo "=== CONFIGURE: Site Identity ==="
$WP option update blogname "The UAE Junction CMS" --path=$WP_PATH
$WP option update blogdescription "Headless WordPress CMS for UAE Travel Experiences" --path=$WP_PATH

echo ""
echo "=== CONFIGURE: Disable comments (headless) ==="
$WP option update default_comment_status closed --path=$WP_PATH
$WP option update default_ping_status closed --path=$WP_PATH

echo ""
echo "=== CONFIGURE: Timezone ==="
$WP option update timezone_string "Asia/Dubai" --path=$WP_PATH
$WP option update time_format "H:i" --path=$WP_PATH

echo ""
echo "=== CONFIGURE: Permalinks ==="
$WP rewrite structure "/%postname%/" --path=$WP_PATH
$WP rewrite flush --path=$WP_PATH

echo ""
echo "=== CONFIGURE: Disable pingbacks ==="
$WP option update default_pingback_flag 0 --path=$WP_PATH

echo ""
echo "=== SECURITY: Create MU-Plugin ==="
mkdir -p $WP_PATH/wp-content/mu-plugins
cat > $WP_PATH/wp-content/mu-plugins/uaej-security.php << 'PHPEOF'
<?php
/**
 * Plugin Name: UAE Junction Security Hardening
 * Description: Security hardening for headless WordPress setup
 * Version: 1.0
 */

// Disable XML-RPC completely
add_filter('xmlrpc_enabled', '__return_false');

// Remove WordPress version from headers and feeds
remove_action('wp_head', 'wp_generator');
remove_action('rss2_head', 'the_generator');
remove_action('atom_head', 'the_generator');

// Disable file editing in admin dashboard
defined('DISALLOW_FILE_EDIT') || define('DISALLOW_FILE_EDIT', true);

// Allow GraphQL from Next.js frontend (CORS)
add_action('graphql_response_headers_to_send', function($headers) {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, ['https://theuaejunction.cloud', 'https://www.theuaejunction.cloud'])) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
    }
    return $headers;
});

// Block REST API user enumeration
add_filter('rest_endpoints', function($endpoints) {
    if (isset($endpoints['/wp/v2/users'])) {
        unset($endpoints['/wp/v2/users']);
    }
    if (isset($endpoints['/wp/v2/users/(?P<id>[\\d]+)'])) {
        unset($endpoints['/wp/v2/users/(?P<id>[\\d]+)']);
    }
    return $endpoints;
});

// Remove unnecessary header leakage
remove_action('wp_head', 'rsd_link');
remove_action('wp_head', 'wlwmanifest_link');
remove_action('wp_head', 'wp_shortlink_wp_head');
PHPEOF

echo "Security MU-plugin created."

echo ""
echo "=== CONFIGURE: Hide WP version in REST ==="
$WP option update show_on_front page --path=$WP_PATH || true

echo ""
echo "=== TEST: WPGraphQL Schema ==="
$WP eval "echo 'WPGraphQL active: ' . (function_exists('graphql') ? 'YES' : 'NO') . PHP_EOL;" --path=$WP_PATH

echo ""
echo "=== PLUGINS AFTER ==="
$WP plugin list --format=table --path=$WP_PATH

echo ""
echo "=== PHASE 6 SETUP COMPLETE ==="
echo "GraphQL endpoint: https://cms.theuaejunction.cloud/graphql"
