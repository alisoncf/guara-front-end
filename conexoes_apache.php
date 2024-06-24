#!/usr/bin/php
<?php
while(true){
	exec('netstat -tuna |grep :443 |grep -i est|wc -l 2>&1',$saida);
	echo ($saida[0]);
	$saida = [];
	sleep(1);
	echo "\r";
}
