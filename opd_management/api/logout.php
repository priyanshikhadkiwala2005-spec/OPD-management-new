<?php
session_start();
require_once 'cors.php';
require_once 'response.php';

session_unset();
session_destroy();

send_success([], 'Logged out successfully');
