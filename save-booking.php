<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Get POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    echo json_encode([
        'success' => false,
        'message' => '無效的資料格式'
    ]);
    exit;
}

$bookingsFile = 'bookings.json';

// Create file if it doesn't exist
if (!file_exists($bookingsFile)) {
    file_put_contents($bookingsFile, json_encode(['bookings' => []], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Read existing bookings
$jsonData = file_get_contents($bookingsFile);
$fileData = json_decode($jsonData, true);

if (!$fileData || !isset($fileData['bookings'])) {
    $fileData = ['bookings' => []];
}

// Handle delete operation
if (isset($data['delete']) && $data['delete'] === true && isset($data['code'])) {
    $code = $data['code'];
    $fileData['bookings'] = array_values(array_filter($fileData['bookings'], function($b) use ($code) {
        return $b['code'] !== $code;
    }));
    
    if (file_put_contents($bookingsFile, json_encode($fileData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode([
            'success' => true,
            'message' => '預訂已刪除'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => '刪除失敗'
        ]);
    }
    exit;
}

// Validate required fields
$required = ['code', 'matchDate', 'matchTime', 'endTime', 'venue', 'matchType', 'contactName', 'contactPhone', 'status', 'paymentStatus'];
foreach ($required as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        echo json_encode([
            'success' => false,
            'message' => "缺少必填欄位: $field"
        ]);
        exit;
    }
}

// Prepare booking data
$booking = [
    'code' => $data['code'],
    'matchDate' => $data['matchDate'],
    'matchTime' => $data['matchTime'],
    'endTime' => $data['endTime'],
    'venue' => $data['venue'],
    'matchType' => $data['matchType'],
    'refereeCount' => $data['refereeCount'] ?? '',
    'contactName' => $data['contactName'],
    'contactPhone' => $data['contactPhone'],
    'contactEmail' => $data['contactEmail'] ?? '',
    'status' => $data['status'],
    'paymentStatus' => $data['paymentStatus'],
    'refereeInfo' => $data['refereeInfo'] ?? '',
    'notes' => $data['notes'] ?? '',
    'createdAt' => $data['createdAt'] ?? date('Y-m-d H:i:s'),
    'updatedAt' => date('Y-m-d H:i:s')
];

// Check if booking exists (update) or new (insert)
$existingIndex = -1;
foreach ($fileData['bookings'] as $index => $b) {
    if ($b['code'] === $booking['code']) {
        $existingIndex = $index;
        break;
    }
}

if ($existingIndex >= 0) {
    // Update existing booking
    $fileData['bookings'][$existingIndex] = $booking;
    $message = '預訂已更新';
} else {
    // Add new booking
    $fileData['bookings'][] = $booking;
    $message = '預訂已建立';
}

// Save to file
if (file_put_contents($bookingsFile, json_encode($fileData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    echo json_encode([
        'success' => true,
        'message' => $message,
        'booking' => $booking
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => '儲存失敗'
    ]);
}
?>
