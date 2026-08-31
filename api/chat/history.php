<?php
require_once '../auth/config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$stmt = $conn->prepare('SELECT id, prompt, reply, created_at FROM chat_history WHERE user_id = ? ORDER BY id DESC LIMIT 50');
$stmt->bind_param('i', $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

$history = [];
while ($row = $result->fetch_assoc()) {
    $history[] = $row;
}

echo json_encode(['success' => true, 'history' => $history]);

$stmt->close();
$conn->close();
?>