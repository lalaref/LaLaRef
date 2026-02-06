<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Get booking code from query parameter
$code = isset($_GET['code']) ? trim($_GET['code']) : '';

// Read bookings from JSON file
$bookingsFile = 'bookings.json';

if (!file_exists($bookingsFile)) {
    echo json_encode([
        'success' => false,
        'message' => '找不到預訂資料'
    ]);
    exit;
}

$jsonData = file_get_contents($bookingsFile);
$data = json_decode($jsonData, true);

if (!$data || !isset($data['bookings'])) {
    echo json_encode([
        'success' => false,
        'message' => '資料格式錯誤'
    ]);
    exit;
}

// If no code provided, return all bookings (for admin)
if (empty($code)) {
    echo json_encode([
        'success' => true,
        'bookings' => $data['bookings']
    ]);
    exit;
}

// Find booking by code
$booking = null;
foreach ($data['bookings'] as $b) {
    if (isset($b['code']) && strtoupper($b['code']) === strtoupper($code)) {
        $booking = $b;
        break;
    }
}

if ($booking) {
    echo json_encode([
        'success' => true,
        'booking' => $booking
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => '找不到此預訂編號'
    ]);
}
?>
