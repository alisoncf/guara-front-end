<?php

$configDb['desenvIp'] = "10.20.3.15";
$_SERVER['SERVER_ADDR'] = $configDb['desenvIp'];

//Db Desenvolvimento
$GLOBALS['configDb']['host'] = '10.20.60.33';

$GLOBALS['configDb']['bd'] = "ueg_central_24h";

$GLOBALS['configDb']['login'] = 'postgres';
$GLOBALS['configDb']['password'] = "Hitokiri_Battousai";

//Db Producao
$configDb['webIp']="187.5.96.170";
$configDb['webURL'] = 'www.adms.ueg.br';
$configDb['_host'] = 'pgsql.ueg.br';
$configDb['_bd'] = 'ueg_central';
$configDb['_login']="user_modulo_eleicao";
$configDb['_password']="eL#CT$&-_KP@o";