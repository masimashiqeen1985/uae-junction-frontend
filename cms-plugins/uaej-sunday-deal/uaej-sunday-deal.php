<?php
/**
 * Plugin Name: UAEJ Sunday Deal
 * Description: Sunday Super Deal engine — status API, deal pricing, atomic 5-unit cap, 1-per-customer, notify-me reminders.
 * Version: 1.2.1
 * Author: The UAE Junction
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'UAEJ_SD_VERSION', '1.2.1' );
define( 'UAEJ_SD_TZ', 'Asia/Dubai' );
define( 'UAEJ_SD_META', '_uaej_sunday_deal' );
define( 'UAEJ_SD_CART_FLAG', 'uaej_deal' );

/* ---------------------------------------------------------------------------
 * Activation: notify table + cron
 * ------------------------------------------------------------------------- */
register_activation_hook( __FILE__, function () {
	global $wpdb;
	$table = $wpdb->prefix . 'uaej_deal_notify';
	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	dbDelta( "CREATE TABLE {$table} (
		id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
		email VARCHAR(190) NOT NULL,
		token VARCHAR(64) NOT NULL,
		consent_at DATETIME NOT NULL,
		unsubscribed TINYINT(1) NOT NULL DEFAULT 0,
		PRIMARY KEY (id),
		UNIQUE KEY email (email),
		KEY token (token)
	) {$wpdb->get_charset_collate()};" );

	if ( ! wp_next_scheduled( 'uaej_sd_sunday_reminder' ) ) {
		wp_schedule_event( uaej_sd_next_sunday_8am_ts(), 'weekly', 'uaej_sd_sunday_reminder' );
	}
} );

register_deactivation_hook( __FILE__, function () {
	wp_clear_scheduled_hook( 'uaej_sd_sunday_reminder' );
} );

/* ---------------------------------------------------------------------------
 * Time helpers (Asia/Dubai)
 * ------------------------------------------------------------------------- */
function uaej_sd_now() {
	return new DateTimeImmutable( 'now', new DateTimeZone( UAEJ_SD_TZ ) );
}

function uaej_sd_next_sunday_8am_ts() {
	$now = uaej_sd_now();
	$d   = $now->modify( 'this sunday' )->setTime( 8, 0, 0 );
	if ( $d <= $now ) $d = $d->modify( '+7 days' );
	return $d->getTimestamp();
}

/* ---------------------------------------------------------------------------
 * Deal config — read from ACF options ("Sunday Promotions") with fallback
 * Each deal: deal_date (Y-m-d Sunday), product (ID), deal_price, original_price,
 *            discount_label, units_total, hero_blurb
 * ------------------------------------------------------------------------- */
function uaej_sd_all_deals() {
	$deals = array();
	if ( function_exists( 'get_field' ) ) {
		$rows = get_field( 'deals', 'option' );
		if ( is_array( $rows ) ) $deals = $rows;
	}
	if ( ! $deals ) {
		$opt = get_option( 'uaej_sd_deals_fallback', array() );
		if ( is_array( $opt ) ) $deals = $opt;
	}
	$out = array();
	foreach ( $deals as $d ) {
		$pid  = is_array( $d['product'] ?? null ) ? ( $d['product']['ID'] ?? 0 ) : (int) ( $d['product'] ?? 0 );
		$date = $d['deal_date'] ?? '';
		// ACF may return d/m/Y or Ymd depending on settings; normalize.
		$ts = $date ? strtotime( str_replace( '/', '-', $date ) ) : false;
		if ( ! $pid || ! $ts ) continue;
		$out[] = array(
			'date'           => gmdate( 'Y-m-d', $ts ),
			'product_id'     => $pid,
			'deal_price'     => (float) ( $d['deal_price'] ?? 0 ),
			'original_price' => (float) ( $d['original_price'] ?? 0 ),
			'discount_label' => sanitize_text_field( $d['discount_label'] ?? '' ),
			'units_total'    => max( 1, (int) ( $d['units_total'] ?? 5 ) ),
			'hero_blurb'     => sanitize_text_field( $d['hero_blurb'] ?? '' ),
		);
	}
	usort( $out, fn( $a, $b ) => strcmp( $a['date'], $b['date'] ) );
	return $out;
}

/** Deal whose Sunday window contains $now, or null. */
function uaej_sd_active_deal() {
	$now = uaej_sd_now();
	if ( (int) $now->format( 'w' ) !== 0 ) return null; // Sunday only
	$today = $now->format( 'Y-m-d' );
	foreach ( uaej_sd_all_deals() as $d ) {
		if ( $d['date'] === $today ) return $d;
	}
	return null;
}

/** Next upcoming deal (including today's if still Sunday), or null. */
function uaej_sd_next_deal() {
	$today = uaej_sd_now()->format( 'Y-m-d' );
	foreach ( uaej_sd_all_deals() as $d ) {
		if ( $d['date'] >= $today ) return $d;
	}
	return null;
}

/* ---------------------------------------------------------------------------
 * Units sold / left
 * ------------------------------------------------------------------------- */
function uaej_sd_units_sold( $deal ) {
	$orders = wc_get_orders( array(
		'limit'        => -1,
		'status'       => array( 'pending', 'on-hold', 'processing', 'completed' ),
		'date_created' => '>=' . strtotime( $deal['date'] . ' 00:00:00 +04:00' ),
		'return'       => 'objects',
	) );
	$sold = 0;
	$last_sale_at = null;
	$last_city    = '';
	foreach ( $orders as $order ) {
		foreach ( $order->get_items() as $item ) {
			if ( $item->get_meta( UAEJ_SD_META ) === $deal['date'] ) {
				$sold += (int) $item->get_quantity();
				$t = $order->get_date_created() ? $order->get_date_created()->getTimestamp() : 0;
				if ( $t && ( ! $last_sale_at || $t > $last_sale_at ) ) {
					$last_sale_at = $t;
					$last_city    = $order->get_billing_city();
				}
			}
		}
	}
	return array( 'sold' => $sold, 'last_sale_at' => $last_sale_at, 'last_city' => $last_city );
}

function uaej_sd_pct_left_step( $left, $total ) {
	if ( $left <= 0 ) return 0;
	$pct = ( $left / $total ) * 100;
	return (int) ( ceil( $pct / 20 ) * 20 ); // 20% steps, never reveal exact count
}

/** Has this email/user already bought today's deal? */
function uaej_sd_customer_has_deal( $deal, $email, $user_id = 0 ) {
	$args = array(
		'limit'        => -1,
		'status'       => array( 'pending', 'on-hold', 'processing', 'completed' ),
		'date_created' => '>=' . strtotime( $deal['date'] . ' 00:00:00 +04:00' ),
		'return'       => 'objects',
	);
	$orders = array();
	if ( $email )   $orders = array_merge( $orders, wc_get_orders( $args + array( 'billing_email' => $email ) ) );
	if ( $user_id ) $orders = array_merge( $orders, wc_get_orders( $args + array( 'customer_id' => $user_id ) ) );
	foreach ( $orders as $order ) {
		foreach ( $order->get_items() as $item ) {
			if ( $item->get_meta( UAEJ_SD_META ) === $deal['date'] ) return true;
		}
	}
	return false;
}

/* ---------------------------------------------------------------------------
 * REST API
 * ------------------------------------------------------------------------- */
add_action( 'rest_api_init', function () {
	register_rest_route( 'uaej/v1', '/sunday-deal/status', array(
		'methods'             => 'GET',
		'permission_callback' => '__return_true',
		'callback'            => 'uaej_sd_rest_status',
	) );
	register_rest_route( 'uaej/v1', '/sunday-deal/notify', array(
		'methods'             => 'POST',
		'permission_callback' => '__return_true',
		'callback'            => 'uaej_sd_rest_notify',
	) );
	register_rest_route( 'uaej/v1', '/sunday-deal/notify/unsubscribe', array(
		'methods'             => 'GET',
		'permission_callback' => '__return_true',
		'callback'            => 'uaej_sd_rest_unsub',
	) );
} );

function uaej_sd_rest_status() {
	$now    = uaej_sd_now();
	$active = uaej_sd_active_deal();
	$next   = uaej_sd_next_deal();

	$body = array(
		'now'    => $now->format( DATE_ATOM ),
		'active' => false,
	);

	if ( $active ) {
		$stats = uaej_sd_units_sold( $active );
		$left  = max( 0, $active['units_total'] - $stats['sold'] );
		$body['active']       = true;
		$body['product_id']   = $active['product_id'];
		$body['deal_date']    = $active['date'];
		$body['deal_price']   = $active['deal_price'];
		$body['pct_left']     = uaej_sd_pct_left_step( $left, $active['units_total'] );
		$body['sold_out']     = ( $left <= 0 );
		$body['window_end']   = $active['date'] . 'T23:59:59+04:00';
		$body['last_sale_at'] = $stats['last_sale_at'] ? gmdate( DATE_ATOM, $stats['last_sale_at'] ) : null;
		$body['last_city']    = $stats['last_city'] ?: null;
	} elseif ( $next ) {
		$body['next_deal_date']   = $next['date'];
		$body['next_product_id']  = $next['product_id'];
		$body['window_start']     = $next['date'] . 'T00:00:00+04:00';
	}

	$res = new WP_REST_Response( $body );
	$res->header( 'Cache-Control', 'no-store' );
	return $res;
}

function uaej_sd_rest_notify( WP_REST_Request $req ) {
	// Honeypot + rate limit
	if ( ! empty( $req->get_param( 'website' ) ) ) return new WP_REST_Response( array( 'ok' => true ), 200 );
	$ip  = $_SERVER['REMOTE_ADDR'] ?? '0';
	$key = 'uaej_sd_rl_' . md5( $ip );
	if ( (int) get_transient( $key ) >= 5 ) {
		return new WP_Error( 'rate_limited', 'Too many requests', array( 'status' => 429 ) );
	}
	set_transient( $key, (int) get_transient( $key ) + 1, 10 * MINUTE_IN_SECONDS );

	$email = sanitize_email( (string) $req->get_param( 'email' ) );
	if ( ! is_email( $email ) ) {
		return new WP_Error( 'invalid_email', 'Please enter a valid email address.', array( 'status' => 400 ) );
	}
	global $wpdb;
	$table = $wpdb->prefix . 'uaej_deal_notify';
	$wpdb->query( $wpdb->prepare(
		"INSERT INTO {$table} (email, token, consent_at, unsubscribed) VALUES (%s, %s, %s, 0)
		 ON DUPLICATE KEY UPDATE unsubscribed = 0",
		$email, wp_generate_password( 40, false ), current_time( 'mysql', true )
	) );
	return new WP_REST_Response( array( 'ok' => true, 'message' => 'You are on the list — see you Sunday!' ), 200 );
}

function uaej_sd_rest_unsub( WP_REST_Request $req ) {
	global $wpdb;
	$table = $wpdb->prefix . 'uaej_deal_notify';
	$token = sanitize_text_field( (string) $req->get_param( 'token' ) );
	if ( $token ) {
		$wpdb->update( $table, array( 'unsubscribed' => 1 ), array( 'token' => $token ) );
	}
	return new WP_REST_Response( array( 'ok' => true, 'message' => 'Unsubscribed.' ), 200 );
}

/* ---------------------------------------------------------------------------
 * Cart: deal flag, price override, qty = 1
 * Frontend adds to cart with cart item data: uaej_deal = sunday
 * ------------------------------------------------------------------------- */
add_filter( 'woocommerce_add_cart_item_data', function ( $data, $product_id ) {
	// Flag arrives either via classic request param OR via WooGraphQL addToCart
	// extraData (which lands directly in $data). Normalize: only the server may
	// stamp the deal date; any client-supplied value other than 'sunday' is dropped.
	$flag = isset( $_REQUEST[ UAEJ_SD_CART_FLAG ] ) ? sanitize_text_field( wp_unslash( $_REQUEST[ UAEJ_SD_CART_FLAG ] ) ) : '';
	if ( ! $flag && isset( $data[ UAEJ_SD_CART_FLAG ] ) ) {
		$flag = sanitize_text_field( (string) $data[ UAEJ_SD_CART_FLAG ] );
	}
	unset( $data[ UAEJ_SD_CART_FLAG ] );
	if ( 'sunday' === $flag ) {
		$deal = uaej_sd_active_deal();
		if ( $deal && (int) $deal['product_id'] === (int) $product_id ) {
			$stats = uaej_sd_units_sold( $deal );
			if ( $deal['units_total'] - $stats['sold'] > 0 ) {
				$data[ UAEJ_SD_CART_FLAG ] = $deal['date'];
			}
		}
	}
	return $data;
}, 10, 2 );

add_filter( 'woocommerce_add_to_cart_validation', function ( $passed, $product_id, $quantity ) {
	$flag = isset( $_REQUEST[ UAEJ_SD_CART_FLAG ] ) ? sanitize_text_field( wp_unslash( $_REQUEST[ UAEJ_SD_CART_FLAG ] ) ) : '';
	if ( 'sunday' !== $flag ) return $passed;

	$deal = uaej_sd_active_deal();
	if ( ! $deal || (int) $deal['product_id'] !== (int) $product_id ) {
		wc_add_notice( 'The Sunday deal is not active right now.', 'error' );
		return false;
	}
	$stats = uaej_sd_units_sold( $deal );
	if ( $deal['units_total'] - $stats['sold'] <= 0 ) {
		wc_add_notice( 'Sold out! See next Sunday\'s deal.', 'error' );
		return false;
	}
	if ( $quantity > 1 ) {
		wc_add_notice( 'Sunday deal is limited to 1 per customer.', 'error' );
		return false;
	}
	return $passed;
}, 10, 3 );

add_action( 'woocommerce_before_calculate_totals', function ( $cart ) {
	if ( is_admin() && ! defined( 'DOING_AJAX' ) ) return;
	$deal = uaej_sd_active_deal();
	foreach ( $cart->get_cart() as $key => $item ) {
		if ( empty( $item[ UAEJ_SD_CART_FLAG ] ) ) continue;
		// Window must still be active and match the flagged date.
		if ( ! $deal || $deal['date'] !== $item[ UAEJ_SD_CART_FLAG ] || (int) $deal['product_id'] !== (int) $item['product_id'] ) {
			$cart->remove_cart_item( $key );
			wc_add_notice( 'The Sunday deal window has ended; the deal item was removed from your cart.', 'notice' );
			continue;
		}
		$item['data']->set_price( $deal['deal_price'] );
		if ( $item['quantity'] > 1 ) {
			$cart->set_quantity( $key, 1, false );
		}
	}
}, 20 );

/* ---------------------------------------------------------------------------
 * Checkout: atomic final gate (units + 1-per-customer)
 * ------------------------------------------------------------------------- */
function uaej_sd_cart_deal_line() {
	if ( ! WC()->cart ) return null;
	foreach ( WC()->cart->get_cart() as $item ) {
		if ( ! empty( $item[ UAEJ_SD_CART_FLAG ] ) ) return $item;
	}
	return null;
}

add_action( 'woocommerce_checkout_process', function () {
	$line = uaej_sd_cart_deal_line();
	if ( ! $line ) return;
	$deal = uaej_sd_active_deal();
	if ( ! $deal || $deal['date'] !== $line[ UAEJ_SD_CART_FLAG ] ) {
		wc_add_notice( 'The Sunday deal window has ended.', 'error' );
		return;
	}
	$email   = sanitize_email( $_POST['billing_email'] ?? '' );
	$user_id = get_current_user_id();
	if ( uaej_sd_customer_has_deal( $deal, $email, $user_id ) ) {
		wc_add_notice( 'This deal is limited to 1 per customer — you already grabbed it. 🎉', 'error' );
		return;
	}

	global $wpdb;
	$got = $wpdb->get_var( "SELECT GET_LOCK('uaej_sunday_deal', 3)" );
	if ( '1' !== (string) $got ) {
		wc_add_notice( 'High demand right now — please try again in a few seconds.', 'error' );
		return;
	}
	$stats = uaej_sd_units_sold( $deal );
	if ( $deal['units_total'] - $stats['sold'] <= 0 ) {
		$wpdb->query( "SELECT RELEASE_LOCK('uaej_sunday_deal')" );
		wc_add_notice( 'Sold out! See next Sunday\'s deal.', 'error' );
		return;
	}
	// Hold the lock through order creation; released in checkout_order_processed / shutdown.
} );

add_action( 'woocommerce_checkout_create_order_line_item', function ( $item, $cart_item_key, $values ) {
	if ( ! empty( $values[ UAEJ_SD_CART_FLAG ] ) ) {
		$item->add_meta_data( UAEJ_SD_META, $values[ UAEJ_SD_CART_FLAG ], true );
	}
}, 10, 3 );

add_action( 'woocommerce_checkout_order_processed', function () {
	global $wpdb;
	$wpdb->query( "SELECT RELEASE_LOCK('uaej_sunday_deal')" );
} );
add_action( 'shutdown', function () {
	global $wpdb;
	if ( $wpdb instanceof wpdb ) {
		$wpdb->query( "SELECT RELEASE_LOCK('uaej_sunday_deal')" );
	}
} );


/* ---------------------------------------------------------------------------
 * Admin page: "Sunday Promotions" (native, no ACF PRO required)
 * Stores config in option 'uaej_sd_deals_fallback' + globals option.
 * ------------------------------------------------------------------------- */
function uaej_sd_globals() {
	$g = get_option( 'uaej_sd_globals', array() );
	return wp_parse_args( is_array( $g ) ? $g : array(), array(
		'page_heading'    => 'Sunday Super Deal',
		'page_subheading' => 'One product. Up to 70% off. Every Sunday.',
		'terms_text'      => 'Limited units. 1 per customer. Valid Sunday 12:00 AM to 11:59 PM (UAE time) or while stock lasts.',
	) );
}

add_action( 'admin_menu', function () {
	add_menu_page(
		'Sunday Promotions', 'Sunday Promotions', 'manage_woocommerce',
		'sunday-promotions', 'uaej_sd_render_admin_page', 'dashicons-tickets-alt', 56
	);
} );

add_action( 'admin_init', function () {
	if ( ! isset( $_POST['uaej_sd_save'] ) ) return;
	if ( ! current_user_can( 'manage_woocommerce' ) ) return;
	check_admin_referer( 'uaej_sd_save_deals' );

	$globals = array(
		'page_heading'    => sanitize_text_field( wp_unslash( $_POST['page_heading'] ?? '' ) ),
		'page_subheading' => sanitize_text_field( wp_unslash( $_POST['page_subheading'] ?? '' ) ),
		'terms_text'      => sanitize_textarea_field( wp_unslash( $_POST['terms_text'] ?? '' ) ),
	);
	update_option( 'uaej_sd_globals', $globals, false );

	$deals = array();
	$rows  = isset( $_POST['deal'] ) && is_array( $_POST['deal'] ) ? wp_unslash( $_POST['deal'] ) : array();
	$errors = array();
	foreach ( $rows as $r ) {
		$date = sanitize_text_field( $r['deal_date'] ?? '' );
		$pid  = (int) ( $r['product'] ?? 0 );
		if ( ! $date && ! $pid ) continue; // empty row
		$ts = $date ? strtotime( $date ) : false;
		if ( ! $ts || 0 !== (int) gmdate( 'w', $ts ) ) {
			$errors[] = sprintf( 'Row skipped: %s is not a Sunday.', esc_html( $date ?: '(no date)' ) );
			continue;
		}
		if ( ! $pid || ! wc_get_product( $pid ) ) {
			$errors[] = sprintf( 'Row skipped (%s): invalid product.', esc_html( $date ) );
			continue;
		}
		$deals[] = array(
			'deal_date'      => gmdate( 'Y-m-d', $ts ),
			'product'        => $pid,
			'deal_price'     => max( 1, (float) ( $r['deal_price'] ?? 0 ) ),
			'original_price' => max( 1, (float) ( $r['original_price'] ?? 0 ) ),
			'discount_label' => sanitize_text_field( $r['discount_label'] ?? '' ),
			'units_total'    => min( 100, max( 1, (int) ( $r['units_total'] ?? 5 ) ) ),
			'hero_blurb'     => sanitize_text_field( $r['hero_blurb'] ?? '' ),
		);
	}
	update_option( 'uaej_sd_deals_fallback', $deals, false );
	set_transient( 'uaej_sd_admin_notice', $errors ? implode( ' ', $errors ) : 'Saved.', 60 );
	wp_safe_redirect( admin_url( 'admin.php?page=sunday-promotions' ) );
	exit;
} );

function uaej_sd_render_admin_page() {
	$globals = uaej_sd_globals();
	$deals   = get_option( 'uaej_sd_deals_fallback', array() );
	if ( ! is_array( $deals ) ) $deals = array();
	$notice  = get_transient( 'uaej_sd_admin_notice' );
	if ( $notice ) delete_transient( 'uaej_sd_admin_notice' );

	$products = wc_get_products( array( 'limit' => 300, 'status' => 'publish', 'orderby' => 'title', 'order' => 'ASC' ) );
	$opts = '';
	foreach ( $products as $p ) {
		$opts .= '<option value="' . (int) $p->get_id() . '">' . esc_html( $p->get_name() . ' (#' . $p->get_id() . ' - AED ' . $p->get_regular_price() . ')' ) . '</option>';
	}
	?>
	<div class="wrap"><h1>Sunday Promotions</h1>
	<?php if ( $notice ) : ?><div class="notice notice-info"><p><?php echo esc_html( $notice ); ?></p></div><?php endif; ?>
	<form method="post">
		<?php wp_nonce_field( 'uaej_sd_save_deals' ); ?>
		<h2>Page Content</h2>
		<table class="form-table">
			<tr><th>Heading</th><td><input type="text" name="page_heading" class="regular-text" value="<?php echo esc_attr( $globals['page_heading'] ); ?>"></td></tr>
			<tr><th>Subheading</th><td><input type="text" name="page_subheading" class="large-text" value="<?php echo esc_attr( $globals['page_subheading'] ); ?>"></td></tr>
			<tr><th>Terms</th><td><textarea name="terms_text" class="large-text" rows="2"><?php echo esc_textarea( $globals['terms_text'] ); ?></textarea></td></tr>
		</table>
		<h2>Deals (each must be a Sunday)</h2>
		<table class="widefat" id="uaej-deals"><thead><tr>
			<th>Date</th><th>Product</th><th>Deal AED</th><th>Original AED</th><th>Label</th><th>Units</th><th>Blurb</th><th></th>
		</tr></thead><tbody>
		<?php $i = 0; foreach ( $deals as $d ) : ?>
			<tr>
				<td><input type="date" name="deal[<?php echo $i; ?>][deal_date]" value="<?php echo esc_attr( $d['deal_date'] ?? '' ); ?>"></td>
				<td><select name="deal[<?php echo $i; ?>][product]" class="uaej-prod" data-val="<?php echo (int) ( $d['product'] ?? 0 ); ?>"></select></td>
				<td><input type="number" step="0.01" min="1" style="width:90px" name="deal[<?php echo $i; ?>][deal_price]" value="<?php echo esc_attr( $d['deal_price'] ?? '' ); ?>"></td>
				<td><input type="number" step="0.01" min="1" style="width:90px" name="deal[<?php echo $i; ?>][original_price]" value="<?php echo esc_attr( $d['original_price'] ?? '' ); ?>"></td>
				<td><input type="text" style="width:90px" name="deal[<?php echo $i; ?>][discount_label]" value="<?php echo esc_attr( $d['discount_label'] ?? '' ); ?>"></td>
				<td><input type="number" min="1" max="100" style="width:60px" name="deal[<?php echo $i; ?>][units_total]" value="<?php echo esc_attr( $d['units_total'] ?? 5 ); ?>"></td>
				<td><input type="text" name="deal[<?php echo $i; ?>][hero_blurb]" value="<?php echo esc_attr( $d['hero_blurb'] ?? '' ); ?>"></td>
				<td><button type="button" class="button uaej-del">×</button></td>
			</tr>
		<?php $i++; endforeach; ?>
		</tbody></table>
		<p><button type="button" class="button" id="uaej-add">Add Sunday Deal</button></p>
		<p><input type="submit" name="uaej_sd_save" class="button button-primary" value="Save Promotions"></p>
	</form>
	<template id="uaej-opts"><select><?php echo $opts; // phpcs:ignore ?></select></template>
	<script>
	(function(){
		var optsHTML = document.getElementById('uaej-opts').content.querySelector('select').innerHTML;
		var tbody = document.querySelector('#uaej-deals tbody');
		function hydrate(sel){ sel.innerHTML = '<option value="">— select product —</option>' + optsHTML; if(sel.dataset.val && sel.dataset.val !== '0') sel.value = sel.dataset.val; }
		document.querySelectorAll('.uaej-prod').forEach(hydrate);
		var idx = tbody.querySelectorAll('tr').length;
		document.getElementById('uaej-add').addEventListener('click', function(){
			var tr = document.createElement('tr');
			tr.innerHTML = '<td><input type="date" name="deal['+idx+'][deal_date]"></td>'
				+ '<td><select name="deal['+idx+'][product]" class="uaej-prod" data-val="0"></select></td>'
				+ '<td><input type="number" step="0.01" min="1" style="width:90px" name="deal['+idx+'][deal_price]"></td>'
				+ '<td><input type="number" step="0.01" min="1" style="width:90px" name="deal['+idx+'][original_price]"></td>'
				+ '<td><input type="text" style="width:90px" name="deal['+idx+'][discount_label]"></td>'
				+ '<td><input type="number" min="1" max="100" style="width:60px" name="deal['+idx+'][units_total]" value="5"></td>'
				+ '<td><input type="text" name="deal['+idx+'][hero_blurb]"></td>'
				+ '<td><button type="button" class="button uaej-del">×</button></td>';
			tbody.appendChild(tr); hydrate(tr.querySelector('select')); idx++;
		});
		tbody.addEventListener('click', function(e){ if(e.target.classList.contains('uaej-del')) e.target.closest('tr').remove(); });
	})();
	</script>
	</div>
	<?php
}

/* ---------------------------------------------------------------------------
 * WPGraphQL: expose sundayPromotions (read-only, public content only)
 * ------------------------------------------------------------------------- */
add_action( 'graphql_register_types', function () {
	register_graphql_object_type( 'UaejSundayDeal', array(
		'fields' => array(
			'dealDate'      => array( 'type' => 'String' ),
			'productId'     => array( 'type' => 'Int' ),
			'dealPrice'     => array( 'type' => 'Float' ),
			'originalPrice' => array( 'type' => 'Float' ),
			'discountLabel' => array( 'type' => 'String' ),
			'heroBlurb'     => array( 'type' => 'String' ),
		),
	) );
	register_graphql_object_type( 'UaejSundayPromotions', array(
		'fields' => array(
			'pageHeading'    => array( 'type' => 'String' ),
			'pageSubheading' => array( 'type' => 'String' ),
			'termsText'      => array( 'type' => 'String' ),
			'deals'          => array( 'type' => array( 'list_of' => 'UaejSundayDeal' ) ),
		),
	) );
	register_graphql_field( 'RootQuery', 'sundayPromotions', array(
		'type'    => 'UaejSundayPromotions',
		'resolve' => function () {
			$g = uaej_sd_globals();
			$deals = array_map( function ( $d ) {
				return array(
					'dealDate'      => $d['date'],
					'productId'     => $d['product_id'],
					'dealPrice'     => $d['deal_price'],
					'originalPrice' => $d['original_price'],
					'discountLabel' => $d['discount_label'],
					'heroBlurb'     => $d['hero_blurb'],
				);
			}, uaej_sd_all_deals() );
			return array(
				'pageHeading'    => $g['page_heading'],
				'pageSubheading' => $g['page_subheading'],
				'termsText'      => $g['terms_text'],
				'deals'          => $deals,
			);
		},
	) );
} );

/* ---------------------------------------------------------------------------
 * Sunday 08:00 reminder email
 * ------------------------------------------------------------------------- */
add_action( 'uaej_sd_sunday_reminder', function () {
	$deal = uaej_sd_active_deal();
	if ( ! $deal ) return;
	$product = wc_get_product( $deal['product_id'] );
	if ( ! $product ) return;

	global $wpdb;
	$table = $wpdb->prefix . 'uaej_deal_notify';
	$subs  = $wpdb->get_results( "SELECT email, token FROM {$table} WHERE unsubscribed = 0" );
	if ( ! $subs ) return;

	$subject = sprintf( 'Today only: %s - AED %s (%s)', $product->get_name(), number_format( $deal['deal_price'], 0 ), $deal['discount_label'] ? $deal['discount_label'] : 'Sunday Super Deal' );
	foreach ( $subs as $s ) {
		$unsub = home_url( '/wp-json/uaej/v1/sunday-deal/notify/unsubscribe?token=' . rawurlencode( $s->token ) );
		$body  = sprintf(
			"Today's Sunday Super Deal is LIVE!\n\n%s\nDeal price: AED %s (was AED %s)\nOnly a handful of units - 1 per customer.\n\nGrab it now: https://theuaejunction.cloud/promotions\n\n-\nThe UAE Junction\nUnsubscribe: %s",
			$product->get_name(),
			number_format( $deal['deal_price'], 0 ),
			number_format( $deal['original_price'], 0 ),
			$unsub
		);
		wp_mail( $s->email, $subject, $body );
	}
} );
