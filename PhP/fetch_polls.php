<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

$sql = "SELECT id, question, option1, option2, votes1, votes2 FROM polls ORDER BY id ASC";
$result = $conn->query($sql);
$polls = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $total = $row['votes1'] + $row['votes2'];
        $row['percentage1'] = $total > 0 ? round(($row['votes1'] / $total) * 100) : 0;
        $row['percentage2'] = $total > 0 ? round(($row['votes2'] / $total) * 100) : 0;
        $row['totalVotes'] = $total;
        $polls[] = $row;
    }

    echo json_encode(['success' => true, 'polls' => $polls]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to load polls']);
}

closeConnection();
?>
