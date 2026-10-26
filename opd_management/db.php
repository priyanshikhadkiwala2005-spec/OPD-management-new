<?php
$host = "localhost";
$username = "root";
$password = "";
$database = "opd_management";

$conn = mysqli_connect($host, $username, $password, $database);

if(!$conn)
{
    die("sorry we are failed to connect". mysqli_connect_error());
}
?>