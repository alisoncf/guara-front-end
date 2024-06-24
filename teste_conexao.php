#!/usr/bin/php
<?php
$host = '10.20.60.32';
$dbname = 'redmine';
$user = 'user_redmine';
$password = 'kirin769+*';
$port = '5433';
$connectParans = "host=$host dbname=$dbname user=$user password=$password port=$port";
$con = pg_connect($connectParans, PGSQL_CONNECT_FORCE_NEW);
print_r($con);
echo "\n";
