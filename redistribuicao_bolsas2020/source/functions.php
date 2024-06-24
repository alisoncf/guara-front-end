<?php

function printTime($start) {
	$fim = Util::getElapsedExecutionTime($start);
	echo "Tempo:    " . date('d-m-Y H:i:s', $start + $fim) . "\n";
}

function getPessoa(string $cpf) {
	$cpfFormatado = Conversor::somenteNumero($cpf);
	$sql = "select distinct pf.nome, pf.cpf, pf.id, pf.email
			from ueg.pessoas_fisicas pf 
			WHERE pf.cpf like '%$cpfFormatado'
			order by pf.id desc
			limit 1";
	$return = TDG::getInstance()->genericQuery($sql);
	return $return;
}

function criarArquivoCSV($file, $array) {
	$fp = fopen($file, 'w');
	if (!$fp) {
		return;
	}
	ftruncate($fp, 0);
	foreach ($array as $linha) {
		fputcsv($fp, $linha);
	}
	fclose($fp);
}

function criarArquivo($file, $message) {
	$fp = fopen($file, 'a');
	if (!$fp) {
		return;
	}
	ftruncate($fp, 0);
	fwrite($fp, $message);
	fclose($fp);
}
