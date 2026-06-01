#!/bin/bash
# UAE Junction - Phase 6 WordPress Config (Part 2 - Settings & Security)
# Plugins already installed - this script finishes configuration
echo "============================================"
echo " UAE Junction - Phase 6 Config & Security"
echo "============================================"

WP="/usr/local/bin/wp --allow-root"
WP_PATH="/var/www/html"

echo ""
echo "=== CONFIGURE: WPGraphQL Settings ==="
# Delete existing boolean and set correct array value
$WP option delete graphql_general_settings --path=$WP_PATH 2>/dev/null || true
$WP option add graphql_general_settings '{"public_introspection_enabled":"on","graphql_endpoint":"graphql","show_graphiql_link_in_admin_bar":"on","enable_graphql_playground_link":true}' --format=json --path=$WP_PATH || true
echo "WPGraphQL settings updated"

echo ""
echo "=== CONFIGURE: Site Identity ==="
$WP option update blogname "The UAE Junction CMS" --path=$WP_PATH && echo "blogname: OK"
$WP option update blogdescription "Headless WordPress CMS for UAE Travel Experiences" --path=$WP_PATH && echo "blogdesc: OK"

echo ""
echo "=== CONFIGURE: Timezone & Date ==="
$WP option update timezone_string "Asia/Dubai" --path=$WP_PATH && echo "timezone: OK"

echo ""
echo "=== CONFIGURE: Disable comments (headless) ==="
$WP option update default_comment_status closed --path=$WP_PATH && echo "comments: disabled"
$WP option update default_ping_status closed --path=$WP_PATH && echo "pings: disabled"

echo ""
echo "=== CONFIGURE: Permalinks ==="
$WP rewrite structure "/%postname%/" --hard --path=$WP_PATH && echo "structure: OK"
$WP rewrite flush --hard --path=$WP_PATH && echo "flush: OK"

echo ""
echo "=== SECURITY: Create MU-Plugin ==="
mkdir -p $WP_PATH/wp-content/mu-plugins
cat > $WP_PATH/wp-content/mu-plugins/uaej-security.php << 'PHPEOF'
<?php
/**
 * Plugin Name: UAE Junction Security Hardening
 * Description: Security hardening for headless WordPress
 * Version: 1.0
 */
add_filter('xmlrpc_enabled', '__return_false');
remove_action('wp_head', 'wp_generator');
remove_action('rss2_head', 'the_generator');
defined('DISALLOW_FILE_EDIT') || define('DISALLOW_FILE_EDIT', true);
add_filter('rest_endpoints', function($e) {
    unset($e['/wp/v2/users'], $e['/wp/v2/users/(?P<id>[\d]+)']);
    return $e;
});
remove_action('wp_head', 'rsd_link');
remove_action('wp_head', 'wlwmanifest_link');
remove_action('wp_head', 'wp_shortlink_wp_head');
add_filter('the_generator', '__return_empty_string');
PHPEOF
echo "MU-Plugin created: uaej-security.php"

echo ""
echo "=== VERIFY: Plugin Status ==="
$WP plugin list --format=table --path=$WP_PATH

echo ""
echo "=== VERIFY: WPGraphQL Active ==="
$WP eval "echo 'WPGraphQL: ' . (function_exists('graphql') ? 'ACTIVE' : 'INACTIVE') . PHP_EOL; echo 'ACF: ' . (class_exists('ACF') ? 'ACTIVE' : 'INACTIVE') . PHP_EOL; echo 'WooCommerce: ' . (class_exists('WooCommerce') ? 'ACTIVE' : 'INACTIVE') . PHP_EOL;" --path=$WP_PATH

echo ""
echo "=== VERIFY: GraphQL Endpoint ==="
curl -sf -X POST https://cms.theuaejunction.cloud/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ generalSettings { title url } posts { nodes { title slug } } }"}' | python3 -m json.tool && echo "GRAPHQL: OK" || echo "GRAPHQL: FAIL"

echo ""
echo "=== VERIFY: Site Settings ==="
$WP option get blogname --path=$WP_PATH
$WP option get timezone_string --path=$WP_PATH

echo ""
echo "=== PHASE 6 COMPLETE ==="
echo "GraphQL: https://cms.theuaejunction.cloud/graphql"
echo "WP Admin: https://cms.theuaejunction.cloud/wp-admin"
