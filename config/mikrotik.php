<?php

return [
    'ssh' => [
        'host' => env('MIKROTIK_HOST', '10.25.0.10'),
        'username' => env('MIKROTIK_SSH_USERNAME'),
        'password' => env('MIKROTIK_SSH_PASSWORD'),
    ],
    
    'pppoe_password' => 'Setpassword2',
];
