#!/usr/bin/php
<?php
$loader['locais'][] = '';
$loader['dependencias'][] = '../../html/library/';
include("../../html/library/AutoLoader.php5");
AutoLoader::init();
include '../config/config_banco_producao.php';

$tdg = TDG::getInstance();
$sql = "select count(*) as conexoes 
from pg_stat_activity
where client_addr = '10.20.60.22';";

while (true) {
	$result = $tdg->genericQuery($sql);
	echo ($result[0]['conexoes']);
	sleep(1);
	echo "\r";
}
