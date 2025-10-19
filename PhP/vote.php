<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Use POST method.']);
    exit;
}

$pollId = intval($_POST['poll_id']);
$option = intval($_POST['option']);

if (!in_array($option, [1, 2])) {
    echo json_encode(['success' => false, 'message' => 'Invalid option.']);
    exit;
}

$column = $option === 1 ? 'votes1' : 'votes2';

$stmt = $conn->prepare("UPDATE polls SET $column = $column + 1 WHERE id = ?");
$stmt->bind_param("i", $pollId);
$stmt->execute();

$stmt = $conn->prepare("SELECT votes1, votes2 FROM polls WHERE id = ?");
$stmt->bind_param("i", $pollId);
$stmt->execute();
$result = $stmt->get_result();
$poll = $result->fetch_assoc();

$total = $poll['votes1'] + $poll['votes2'];

echo json_encode([
    'success' => true,
    'poll' => [
        'votes1' => $poll['votes1'],
        'votes2' => $poll['votes2'],
        'percentage1' => $total > 0 ? round(($poll['votes1'] / $total) * 100) : 0,
        'percentage2' => $total > 0 ? round(($poll['votes2'] / $total) * 100) : 0,
        'totalVotes' => $total
    ]
]);

closeConnection();
?>
