<?php

if (php_sapi_name() != 'cli') {
	throw new Exception('This application must be run on the command line.');
}

function soma($a, $b) {
	return $a + $b;
}

$max = pow(10, 9);
echo "Usando PHP 7.4: \n";
/**
 * sem chamada de funcao
 */
$ini = getStartExecutionTime();
$result = 0;
for ($index = 0; $index < $max; $index++) {
	$result += 1;
}
$fim = getElapsedExecutionTime($ini);
echo "Laço direto: $result em $fim \n";

/**
 * Chamando uma funcao
 */
$ini = getStartExecutionTime();
$result = 0;
for ($index1 = 0; $index1 < $max; $index1++) {
	$result = soma($result, 1);
}
$fim = getElapsedExecutionTime($ini);
echo "Chamando funcao: $result em $fim \n";

/**
 * funcoes para contar o tempo
 */
function getStartExecutionTime() {
	list($usec, $sec) = explode(' ', microtime());
	$script_start = (float) $sec + (float) $usec;
	return $script_start;
}

function getElapsedExecutionTime($startTime) {
	list($usec, $sec) = explode(' ', microtime());
	$script_end = (float) $sec + (float) $usec;
	$elapsedTime = round($script_end - $startTime, 5);
	return $elapsedTime;
}
