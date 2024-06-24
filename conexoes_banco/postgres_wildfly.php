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
where 
client_addr in (
'10.20.60.25', --wild2
'10.20.60.26', --wild3
'10.20.60.67', --wild4
'10.20.60.68' --wild5
); ";

while (true) {
	$result = $tdg->genericQuery($sql);
	echo ($result[0]['conexoes']);
	sleep(1);
	echo "\r";
}
