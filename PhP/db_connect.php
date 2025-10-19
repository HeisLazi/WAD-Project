<?php
// Connect to database
$conn = new mysqli('localhost', 'root', '', 'campus_polls');

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'DB connection failed.']));
}

// Set character set
$conn->set_charset("utf8mb4");

// Set timezone
date_default_timezone_set('Africa/Windhoek');

function closeConnection() {
    global $conn;
    if ($conn) $conn->close();
}
?>
