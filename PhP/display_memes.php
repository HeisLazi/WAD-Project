<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

$sql = "SELECT id, filename, uploaded_at FROM memes ORDER BY uploaded_at DESC";
$result = $conn->query($sql);

$memes = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $row['path'] = 'uploads/' . $row['filename'];
        $row['uploaded_at_formatted'] = date('F j, Y g:i A', strtotime($row['uploaded_at']));
        $memes[] = $row;
    }

    echo json_encode(['success' => true, 'memes' => $memes]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to load memes']);
}

closeConnection();
?>
