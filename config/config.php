<?php

define('DB_HOST', 'localhost');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_NAME', 'voting_system');

define('SITE_URL', 'http://your-domain.com');
define('MAX_FACULTY_VOTES', 3);
define('MAX_GENERAL_VOTES', 7);

// Security settings
define('SESSION_LIFETIME', 3600); // 1 hour
define('HASH_ALGO', PASSWORD_ARGON2ID); 