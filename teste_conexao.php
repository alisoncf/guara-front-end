#!/usr/bin/php
<?php
$connectParans = "host=pgsql.ueg.br dbname=ueg_central_logs user=user_logs password=user_logs753 port=5432";
$con = pg_connect($connectParans, PGSQL_CONNECT_FORCE_NEW);
print_r($con);
echo "\n";
