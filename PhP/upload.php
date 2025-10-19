<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Use POST method.']);
    exit;
}

if (!isset($_FILES['meme'])) {
    echo json_encode(['success' => false, 'message' => 'No file uploaded.']);
    exit;
}

$file = $_FILES['meme'];
$maxSize = 5 * 1024 * 1024;
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

$type = mime_content_type($file['tmp_name']);
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($type, $allowedTypes) || $file['size'] > $maxSize) {
    echo json_encode(['success' => false, 'message' => 'Invalid file.']);
    exit;
}

$filename = uniqid('meme_') . '.' . $ext;
$uploadDir = '../uploads/';
$uploadPath = $uploadDir . $filename;

if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
    echo json_encode(['success' => false, 'message' => 'Upload failed.']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO memes (filename) VALUES (?)");
$stmt->bind_param("s", $filename);
$stmt->execute();

echo json_encode(['success' => true, 'message' => 'Uploaded!', 'meme' => ['filename' => $filename, 'path' => 'uploads/' . $filename]]);
closeConnection();
?>
