<?php
require_once '../auth/config.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$prompt = trim($data['prompt'] ?? '');
$reply = trim($data['reply'] ?? '');

if (!$prompt || !$reply) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Prompt and reply are required']);
    exit;
}

$stmt = $conn->prepare('INSERT INTO chat_history (user_id, prompt, reply, created_at) VALUES (?, ?, ?, NOW())');
$stmt->bind_param('iss', $_SESSION['user_id'], $prompt, $reply);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Chat saved']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save chat']);
}

$stmt->close();
$conn->close();
?>